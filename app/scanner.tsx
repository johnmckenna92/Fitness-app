import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useAuth, getDailyTargets } from "../ctx/AuthContext";

export default function ScannerScreen() {
  const auth = useAuth();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Diet Scanner</Text>
      <Text style={styles.subtitle}>
        Upload a food photo or nutrition label to check macros against your
        targets.
      </Text>

      {/* Deep Dive Audit (Pro) Toggle */}
      <View style={styles.deepDiveRow}>
        <View style={styles.deepDiveTextContainer}>
          <Text style={styles.deepDiveLabel}>Deep Dive Audit (Pro)</Text>
          <Text style={styles.deepDiveDescription}>
            Audit additives, emulsifiers, seed oils & protein quality
          </Text>
        </View>
        <Switch
          value={isDeepDive}
          onValueChange={handleToggleDeepDive}
          trackColor={{ false: "#334155", true: "#818cf8" }}
          thumbColor={isDeepDive ? "#f8fafc" : "#94a3b8"}
          ios_backgroundColor="#334155"
          accessibilityLabel="Deep Dive Audit (Pro)"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => pickImage(true)}
        >
          <Ionicons name="camera" size={24} color="#020617" />
          <Text style={styles.actionButtonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => pickImage(false)}
        >
          <Ionicons name="images" size={24} color="#f8fafc" />
          <Text style={styles.actionButtonTextSecondary}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzeFood}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Ionicons
                  name="scan"
                  size={20}
                  color="#020617"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.analyzeButtonText}>Analyze Macros</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {analysis && (
        <>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            <ScrollView
              style={styles.markdownScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <Markdown style={markdownStyles}>{analysis}</Markdown>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#f8fafc"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryButtonText}>Clear & Scan Another</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
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
    backgroundColor: "#818cf8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  actionButtonText: {
    color: "#020617",
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
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  proBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#818cf8",
    marginBottom: 16,
  },
  proBadgeText: {
    color: "#818cf8",
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
    backgroundColor: "#818cf8",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  unlockButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: "#f8fafc",
    backgroundColor: "#0f172a",
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    color: "#818cf8",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: "#38bdf8",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#38bdf8",
    letterSpacing: 0.3,
  },
  heading3: {
    color: "#818cf8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    color: "#f8fafc",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 22,
  },
  text: {
    color: "#f8fafc",
  },
  strong: {
    color: "#f8fafc",
    fontWeight: "bold",
  },
  em: {
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  bullet_list: {
    marginVertical: 4,
  },
  bullet_list_icon: {
    color: "#818cf8",
    marginLeft: 4,
    marginRight: 8,
  },
  bullet_list_content: {
    flex: 1,
    color: "#f8fafc",
  },
  ordered_list_icon: {
    color: "#818cf8",
    marginLeft: 4,
    marginRight: 8,
  },
  list_item: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 2,
  },
  code_inline: {
    backgroundColor: "#0f172a",
    color: "#818cf8",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#f8fafc",
  },
  fence: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#f8fafc",
  },
  blockquote: {
    backgroundColor: "#0f172a",
    borderLeftColor: "#818cf8",
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  hr: {
    backgroundColor: "#1e293b",
    height: 1,
    marginVertical: 12,
  },
  table: {
    borderColor: "#1e293b",
    borderWidth: 1,
    backgroundColor: "#0f172a",
    borderRadius: 6,
  },
  tr: {
    borderColor: "#1e293b",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  th: {
    color: "#818cf8",
    padding: 8,
    fontWeight: "bold",
  },
  td: {
    color: "#f8fafc",
    padding: 8,
  },
  link: {
    color: "#818cf8",
    textDecorationLine: "underline",
  },
});
