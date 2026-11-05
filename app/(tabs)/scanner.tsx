import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai/web";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../ctx/AuthContext";

export default function ScannerScreen() {
  const { suppressLockForPicker, profile } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const pickImage = async (useCamera: boolean = false) => {
    // Suppress biometric lock before leaving the app context
    suppressLockForPicker();

    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    };

    if (useCamera) {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setBase64Data(result.assets[0].base64 || null);

      const uriParts = result.assets[0].uri.split(".");
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      setMimeType(fileType === "png" ? "image/png" : "image/jpeg");

      setAnalysis(null);
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
      const ai = new GoogleGenAI({
        apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
      });

      const ptNotesSection = profile?.pt_notes?.trim()
        ? `\n\nPersonal Trainer Rules & Plan Guidelines:\n"""\n${profile.pt_notes.trim()}\n"""\nIMPORTANT: Explicitly flag if the scanned food violates any of the uploaded PT rules (e.g., forbidden ingredients, allergens, or dietary restrictions).`
        : "";

      const prompt = `Analyze this food or nutrition label. 
      The user's daily targets are: ${profile?.target_calories || 0} kcal, ${profile?.target_protein || 0}g protein, ${profile?.target_carbs || 0}g carbs, ${profile?.target_fats || 0}g fats.${ptNotesSection}
      Please estimate the macros (Calories, Protein, Carbs, Fats) per typical serving and briefly state if this is a good fit for their targets. Format the response clearly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt },
            ],
          },
        ],
      });

      // FIX: The generated response.text is `string | undefined`, but state expects `string | null`.
      // Coercing undefined to null with a fallback message to satisfy TypeScript.
      setAnalysis(
        response.text || "Unable to generate analysis. Please try again.",
      );
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Failed to analyze the image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const isPro = profile?.subscription_status === "pro";

  if (!isPro) {
    return (
      <ScrollView
        style={styles.lockedContainer}
        contentContainerStyle={styles.lockedContent}
      >
        <View style={styles.lockedCard}>
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={44} color="#818cf8" />
          </View>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO FEATURE</Text>
          </View>
          <Text style={styles.lockedTitle}>Unlock AI Diet Scanner</Text>
          <Text style={styles.lockedSubtitle}>
            Scan meals and nutrition labels in seconds with real-time AI macro
            matching against your custom calorie and macronutrient targets.
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => router.push("/pricing")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="lock-open-outline"
              size={20}
              color="#020617"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.unlockButtonText}>Unlock Pro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Diet Scanner</Text>
      <Text style={styles.subtitle}>
        Upload a food photo or nutrition label to check macros against your
        targets.
      </Text>

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
            <Text style={styles.resultsText}>{analysis}</Text>
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
