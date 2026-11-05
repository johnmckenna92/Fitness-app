import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Assume useAuth provides session details and our required lock suppression method
import { useAuth } from "../../ctx/AuthContext";

export default function PTPlanScreen() {
  const router = useRouter();
  const { profile, isPro, suppressLockForPicker } = useAuth();

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [meals, setMeals] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIExtract = async () => {
    const hasProAccess = isPro || profile?.subscription_status === "pro";
    if (!hasProAccess) {
      router.push("/pricing");
      return;
    }

    try {
      // Prevent app lock when transitioning to native image picker modal
      suppressLockForPicker();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsProcessing(true);

        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 1200 } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            }
          );

          if (!manipResult.base64) {
            throw new Error("Failed to process compressed image data.");
          }

          // Simulate sending image to backend/AI for OCR parsing
          setTimeout(() => {
            setCalories("2450");
            setProtein("185");
            setMeals("4");
            setIsProcessing(false);
          }, 1500);
        } catch (manipErr) {
          console.error("PT Notes compression error:", manipErr);
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error("Image extraction failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Your Nutrition Targets</Text>
        <Text style={styles.subtitle}>
          Enter manually or let AI extract it from your coach's plan.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.aiButton, isProcessing && styles.aiButtonDisabled]}
        onPress={handleAIExtract}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#020617" />
        ) : (
          <Text style={styles.aiButtonText}>
            ✨ AI PT Document Extractor (Pro)
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Calories (kcal)</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="e.g. 2500"
            placeholderTextColor="#475569"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            placeholder="e.g. 180"
            placeholderTextColor="#475569"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meals per Day</Text>
          <TextInput
            style={styles.input}
            value={meals}
            onChangeText={setMeals}
            placeholder="e.g. 4"
            placeholderTextColor="#475569"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 24,
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    lineHeight: 24,
  },
  aiButton: {
    backgroundColor: "#818cf8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "700",
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    color: "#f8fafc",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
});
