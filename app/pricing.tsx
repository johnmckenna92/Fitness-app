import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../ctx/AuthContext";
import { supabase } from "../lib/supabase";

const PRICING_PLANS = [
  {
    id: "yearly",
    title: "Annual Pass",
    price: "£59.99",
    period: "/year",
    subtitle: "Equivalent to £4.99/mo",
    badge: "SAVE 37%",
    popular: true,
  },
  {
    id: "monthly",
    title: "Monthly Pass",
    price: "£7.99",
    period: "/month",
    subtitle: "Billed monthly. Cancel anytime.",
    badge: null,
    popular: false,
  },
];

const PRO_FEATURES = [
  {
    title: "Instant PT Plan OCR",
    desc: "Scan PDFs & photos to auto-populate targets",
  },
  {
    title: "Multimodal AI Diet Checker",
    desc: "Real-time camera feedback against your macros",
  },
  {
    title: "AI PT Coach Chat",
    desc: "24/7 hyper-personalized sports nutrition advice",
  },
];

function PricingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session?.user?.id) {
      Alert.alert(
        "Authentication Required",
        "Please log in to upgrade your subscription."
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "pro" })
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      if (router.canDismiss()) {
        router.dismiss();
      } else {
        router.back();
      }
    } catch (error: any) {
      Alert.alert(
        "Subscription Failed",
        error?.message || "An error occurred while upgrading to Pro. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            if (router.canDismiss()) {
              router.dismiss();
            } else {
              router.back();
            }
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.proPill}>
            <Text style={styles.proPillText}>PRO UNLOCK</Text>
          </View>
          <Text style={styles.title}>Supercharge Your Fitness Hub</Text>
          <Text style={styles.subtitle}>
            Unlock automated OCR document extraction, real-time diet scanning,
            and AI coaching.
          </Text>
        </View>

        <View style={styles.featureList}>
          {PRO_FEATURES.map((feat, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark-sharp" size={16} color="#22c55e" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plansContainer}>
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#020617" />
          ) : (
            <Text style={styles.ctaText}>Subscribe to Pro</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Recurring billing. Cancel anytime in App Store settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { alignItems: "center", marginBottom: 28 },
  proPill: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#818cf8",
    marginBottom: 12,
  },
  proPillText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 28,
    gap: 16,
  },
  featureItem: { flexDirection: "row", alignItems: "flex-start" },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: { flex: 1 },
  featureTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDesc: { color: "#94a3b8", fontSize: 13 },
  plansContainer: { gap: 16, marginBottom: 28 },
  planCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#818cf8",
    backgroundColor: "rgba(129, 140, 248, 0.05)",
  },
  badgeContainer: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#818cf8",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { color: "#020617", fontSize: 10, fontWeight: "800" },
  planHeader: { flexDirection: "row", alignItems: "center" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#818cf8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#818cf8",
  },
  planTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  planSubtitle: { color: "#64748b", fontSize: 12, marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  planPrice: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  planPeriod: { color: "#94a3b8", fontSize: 12 },
  ctaButton: {
    backgroundColor: "#818cf8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 52,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: { color: "#020617", fontSize: 16, fontWeight: "700" },
  disclaimer: { color: "#64748b", fontSize: 12, textAlign: "center" },
});

export default PricingScreen;
