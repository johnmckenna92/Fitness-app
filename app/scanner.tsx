import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { supabase } from "../lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth, getDailyTargets } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { FormattedMarkdown } from "../components/FormattedMarkdown";
import { setIsIntentionalBackground } from "./_layout";
import Toast from "react-native-toast-message";
import { syncToFatSecretPipeline } from "../services/recipeOcrService";


export default function ScannerScreen() {
  const auth = useAuth();
  const { colors } = useTheme();
  const { suppressLockForPicker, profile, isPro, isTrainingDay = true } = auth;
  const userProfile = profile ?? { goals: [] as string[] };
  const dailyTargets =
    "dailyTargets" in auth && (auth as any).dailyTargets
      ? (auth as any).dailyTargets
      : getDailyTargets(profile, isTrainingDay);
  const [image, setImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [isLoggingToFatSecret, setIsLoggingToFatSecret] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const handleLogViaFatSecretPipeline = async () => {
    if (!profile?.id) return;
    setIsLoggingToFatSecret(true);
    try {
      const matchName = analysis?.match(/(?:Food|Recipe|Item):\s*([^\n\r]+)/i)?.[1] || "Scanned Recipe";
      const calMatch = analysis?.match(/(\d+)\s*kcal/i)?.[1] || "420";
      const pMatch = analysis?.match(/(\d+)\s*g\s*protein/i)?.[1] || "32";
      const cMatch = analysis?.match(/(\d+)\s*g\s*carbs/i)?.[1] || "38";
      const fMatch = analysis?.match(/(\d+)\s*g\s*fat/i)?.[1] || "14";

      const res = await syncToFatSecretPipeline(profile.id, {
        food_name: matchName.trim(),
        calories: parseInt(calMatch, 10),
        protein: parseInt(pMatch, 10),
        carbs: parseInt(cMatch, 10),
        fats: parseInt(fMatch, 10),
        servings: 1,
        serving_size: "1 portion",
        ingredients: [],
      });

      if (res.success) {
        setIsLogged(true);
        Toast.show({
          type: "success",
          text1: "Meal Logged!",
          text2: `Successfully synced via ${res.source === "proxy" ? "FatSecret Proxy (34.63.211.58:7777)" : "KineticLab Database"}`,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Sync Error",
        text2: err?.message || "Failed to log food.",
      });
    } finally {
      setIsLoggingToFatSecret(false);
    }
  };


  const handleToggleDeepDive = (value: boolean) => {
    if (!isPro) {
      setIsDeepDive(false);
      router.push("/pricing");
      return;
    }
    setIsDeepDive(value);
  };

  const pickImage = async (useCamera: boolean = false) => {
    // Suppress biometric lock before leaving the app context
    suppressLockForPicker();
    setIsIntentionalBackground(true);

    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
    };

    if (useCamera) {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        setImage(manipResult.uri);
        setBase64Data(manipResult.base64 || null);
        setMimeType("image/jpeg");
        setAnalysis(null);
      } catch (manipErr) {
        console.error("Scanner image manipulation failed:", manipErr);
      }
    }
  };

  const handleClear = () => {
    setImage(null);
    setBase64Data(null);
    setAnalysis(null);
  };

  const analyzeFood = async () => {
    if (!base64Data) return;
    setIsScanning(true);

    try {
      const isDeepDiveActive = isDeepDive && isPro;
      const { data, error } = await supabase.functions.invoke("ingredient-scanner", {
        body: {
          imageBase64: base64Data,
          query: base64Data,
          mimeType,
          scanType: isDeepDiveActive ? "deep-dive" : "standard",
          profile: userProfile,
          telemetry: {
            goals: userProfile.goals,
            target_calories: profile?.target_calories || 0,
            target_protein: profile?.target_protein || 0,
            target_carbs: profile?.target_carbs || 0,
            target_fats: profile?.target_fats || 0,
            dailyTargets,
            isTrainingDay,
            isDeepDive,
            isPro,
            ptNotesSection: profile?.pt_notes?.trim() || "",
            pt_notes: profile?.pt_notes || "",
          },
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to analyze food");
      }

      const resultText =
        typeof data?.analysis === "string"
          ? data.analysis
          : typeof data?.markdown === "string"
          ? data.markdown
          : typeof data === "string"
          ? data
          : null;

      setAnalysis(
        resultText || "Unable to generate analysis. Please try again."
      );
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Failed to analyze the image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
      <Text style={[styles.title, { color: colors.text }]}>AI Diet Scanner</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Upload a food photo or nutrition label to check macros against your
        targets.
      </Text>

      {/* Deep Dive Audit (Pro) Toggle */}
      <View
        style={[
          styles.deepDiveRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.deepDiveTextContainer}>
          <Text style={[styles.deepDiveLabel, { color: colors.text }]}>Deep Dive Audit (Pro)</Text>
          <Text style={[styles.deepDiveDescription, { color: colors.textSecondary }]}>
            Audit additives, emulsifiers, seed oils & protein quality
          </Text>
        </View>
        <Switch
          value={isDeepDive}
          onValueChange={handleToggleDeepDive}
          trackColor={{ false: colors.borderSubtle, true: colors.primary }}
          thumbColor={isDeepDive ? "#ffffff" : colors.textMuted}
          ios_backgroundColor={colors.borderSubtle}
          accessibilityLabel="Deep Dive Audit (Pro)"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => pickImage(true)}
        >
          <Ionicons name="camera" size={24} color="#ffffff" />
          <Text style={[styles.actionButtonText, { color: "#ffffff" }]}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButtonSecondary,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={() => pickImage(false)}
        >
          <Ionicons name="images" size={24} color={colors.primary} />
          <Text style={[styles.actionButtonTextSecondary, { color: colors.text }]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Image source={{ uri: image }} style={styles.image} />

          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
            onPress={analyzeFood}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons
                  name="scan"
                  size={20}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.analyzeButtonText, { color: "#ffffff" }]}>Analyze Macros</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {analysis && (
        <>
          <View
            style={[
              styles.resultsContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Analysis Results</Text>
            <ScrollView
              style={styles.markdownScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <FormattedMarkdown>{analysis}</FormattedMarkdown>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.analyzeButton,
              {
                backgroundColor: isLogged ? "#10b981" : colors.primary,
                marginTop: 14,
              },
            ]}
            onPress={handleLogViaFatSecretPipeline}
            disabled={isLoggingToFatSecret || isLogged}
            activeOpacity={0.8}
          >
            {isLoggingToFatSecret ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Ionicons
                  name={isLogged ? "checkmark-circle" : "cloud-upload"}
                  size={20}
                  color="#000000"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.analyzeButtonText, { color: "#000000" }]}>
                  {isLogged ? "Logged to FatSecret Pipeline" : "Log via FatSecret Pipeline"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Clear & Scan Another</Text>
          </TouchableOpacity>
        </>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 24,
    lineHeight: 22,
  },
  deepDiveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  deepDiveTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  deepDiveLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 2,
  },
  deepDiveDescription: {
    fontSize: 13,
    color: "#94a3b8",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4ade80",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  actionButtonText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  imageContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },
  analyzeButton: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  analyzeButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 15,
    color: "#94a3b8",
    lineHeight: 24,
  },
  markdownScroll: {
    maxHeight: 450,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  secondaryButtonText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: "#020617",
  },
  lockedContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockedCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  proBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4ade80",
    marginBottom: 16,
  },
  proBadgeText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 12,
  },
  lockedSubtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  unlockButton: {
    flexDirection: "row",
    backgroundColor: "#4ade80",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  unlockButtonText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "bold",
  },
});
