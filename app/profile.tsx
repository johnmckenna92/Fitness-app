import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai/web";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../ctx/AuthContext";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, session, refreshProfile, signOut, suppressLockForPicker } =
    useAuth();

  const [fullName, setFullName] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [ptNotes, setPtNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  useEffect(() => {
    console.log("Profile modal mounted");
  }, []);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setMealsPerDay(
        profile.meals_per_day != null ? profile.meals_per_day.toString() : "3",
      );
      setCalories(profile.target_calories?.toString() || "");
      setProtein(profile.target_protein?.toString() || "");
      setCarbs(profile.target_carbs?.toString() || "");
      setFats(profile.target_fats?.toString() || "");
      setPtNotes(profile.pt_notes || "");
    }
  }, [profile]);

  const isPro = profile?.subscription_status === "pro";

  const handleUploadPTNotes = () => {
    setPickerModalVisible(true);
  };

  const processImageExtraction = async (source: "camera" | "library") => {
    try {
      suppressLockForPicker();

      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Camera Access Needed",
            "Camera permission is required to photograph your PT plan. You can enable it in your device settings.",
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.8,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Photo Library Access Needed",
            "Permission to access your photos is required to upload your PT plan.",
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert(
          "Image Error",
          "Failed to retrieve image data. Please choose another image.",
        );
        return;
      }

      setIsExtracting(true);

      const uriParts = asset.uri ? asset.uri.split(".") : [];
      const fileType = uriParts[uriParts.length - 1]?.toLowerCase();
      const mimeType =
        asset.mimeType || (fileType === "png" ? "image/png" : "image/jpeg");

      const ai = new GoogleGenAI({
        apiKey:
          process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "",
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: asset.base64,
                  mimeType,
                },
              },
              {
                text: "Extract all dietary constraints, macro targets, forbidden foods, and workout notes from this image. Format it into a concise, readable summary string.",
              },
            ],
          },
        ],
      });

      const extractedText = response.text?.trim() || "";
      if (extractedText) {
        setPtNotes(extractedText);

        // Persist to profiles table in Supabase
        if (session?.user?.id) {
          const { error: dbError } = await supabase
            .from("profiles")
            .update({ pt_notes: extractedText })
            .eq("id", session.user.id);

          if (dbError) {
            console.error("PT Notes persistence error:", dbError);
            Alert.alert(
              "Warning",
              "PT notes extracted, but could not be saved to your cloud profile: " +
                dbError.message,
            );
          } else {
            await refreshProfile();
            Alert.alert("Success", "PT plan extracted and saved successfully!");
          }
        } else {
          Alert.alert("Success", "PT plan extracted successfully!");
        }
      } else {
        Alert.alert(
          "Notice",
          "No dietary constraints, macro targets, forbidden foods, or workout notes could be found in this image.",
        );
      }
    } catch (error: any) {
      console.error("PT Notes OCR Error:", error);
      Alert.alert(
        "OCR Extraction Failed",
        error?.message || "Failed to extract text from PT notes image.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    const parsedMeals = parseInt(mealsPerDay, 10);
    const resolvedMeals =
      isNaN(parsedMeals) || parsedMeals <= 0 ? 3 : parsedMeals;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        meals_per_day: resolvedMeals,
        target_calories: parseInt(calories, 10) || 0,
        target_protein: parseInt(protein, 10) || 0,
        target_carbs: parseInt(carbs, 10) || 0,
        target_fats: parseInt(fats, 10) || 0,
        pt_notes: ptNotes.trim(),
      })
      .eq("id", session.user.id);

    setIsSaving(false);

    if (error) {
      Alert.alert("Error", "Failed to save profile: " + error.message);
    } else {
      await refreshProfile();
      Alert.alert("Success", "Your profile has been updated successfully.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Ionicons name="person-circle" size={64} color="#818cf8" />
        <Text style={styles.nameText}>
          {fullName.trim() || profile?.full_name || "User Profile"}
        </Text>
        <Text style={styles.emailText}>{session?.user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Profile Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. John Doe"
          placeholderTextColor="#64748b"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meals Per Day</Text>
        <TextInput
          style={styles.input}
          value={mealsPerDay}
          onChangeText={setMealsPerDay}
          keyboardType="numeric"
          placeholder="e.g. 3"
          placeholderTextColor="#64748b"
        />
      </View>

      <Text style={styles.sectionTitle}>Daily Macro Targets</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Calories (kcal)</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="e.g. 2500"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholderTextColor="#64748b"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
          <Text style={styles.label}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholderTextColor="#64748b"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Fats (g)</Text>
          <TextInput
            style={styles.input}
            value={fats}
            onChangeText={setFats}
            keyboardType="numeric"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>PT & Dietary Notes</Text>

      {isPro ? (
        <>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isExtracting && styles.uploadButtonDisabled,
            ]}
            onPress={handleUploadPTNotes}
            disabled={isExtracting}
            activeOpacity={0.8}
          >
            {isExtracting ? (
              <View style={styles.buttonInnerRow}>
                <ActivityIndicator
                  color="#020617"
                  size="small"
                  style={styles.buttonIcon}
                />
                <Text style={styles.uploadButtonText}>
                  Extracting Notes with AI...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonInnerRow}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#020617"
                  style={styles.buttonIcon}
                />
                <Text style={styles.uploadButtonText}>
                  Upload PT Plan / Notes
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {isExtracting && (
            <View style={styles.extractingContainer}>
              <ActivityIndicator
                size="small"
                color="#818cf8"
                style={styles.extractingSpinner}
              />
              <View style={styles.extractingTextContainer}>
                <Text style={styles.extractingTitle}>Extracting PT Plan</Text>
                <Text style={styles.extractingSubtitle}>
                  Gemini 3.8 Flash is analyzing dietary rules and macros...
                </Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.lockedCard}>
          <View style={styles.lockedHeader}>
            <View style={styles.lockIconBadge}>
              <Ionicons name="lock-closed" size={20} color="#818cf8" />
            </View>
            <View style={styles.lockedTextContainer}>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>PRO FEATURE</Text>
              </View>
              <Text style={styles.lockedTitle}>Upload PT Plan / Notes</Text>
            </View>
          </View>
          <Text style={styles.lockedSubtitle}>
            Upgrade to Pro to scan your PT plan and extract dietary guidelines,
            rules, and forbidden foods with AI.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push("/pricing")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="star"
              size={16}
              color="#020617"
              style={styles.buttonIcon}
            />
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes & Guidelines</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={ptNotes}
          onChangeText={setPtNotes}
          placeholder="Dietary rules, macro guidelines, forbidden foods..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#020617" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#ef4444"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>

    <Modal
      transparent={true}
      animationType="slide"
      visible={pickerModalVisible}
      onRequestClose={() => setPickerModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          <TouchableOpacity
            style={styles.sheetOption}
            activeOpacity={0.7}
            onPress={() => {
              setPickerModalVisible(false);
              processImageExtraction("camera");
            }}
          >
            <Ionicons
              name="camera-outline"
              size={22}
              color="#818cf8"
              style={styles.sheetOptionIcon}
            />
            <Text style={styles.sheetOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetOption}
            activeOpacity={0.7}
            onPress={() => {
              setPickerModalVisible(false);
              processImageExtraction("library");
            }}
          >
            <Ionicons
              name="image-outline"
              size={22}
              color="#818cf8"
              style={styles.sheetOptionIcon}
            />
            <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetOption, styles.sheetOptionLast]}
            activeOpacity={0.7}
            onPress={() => setPickerModalVisible(false)}
          >
            <Ionicons
              name="close-circle-outline"
              size={22}
              color="#818cf8"
              style={styles.sheetOptionIcon}
            />
            <Text style={styles.sheetOptionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, paddingBottom: 60 },
  headerBlock: { alignItems: "center", marginBottom: 32, marginTop: 12 },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 8,
  },
  emailText: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
  input: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 8,
    color: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#818cf8",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "700",
  },
  extractingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#818cf8",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  extractingSpinner: {
    marginRight: 12,
  },
  extractingTextContainer: {
    flex: 1,
  },
  extractingTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
  extractingSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  buttonInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  lockedCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  lockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  lockIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lockedTextContainer: {
    flex: 1,
  },
  proTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  proTagText: {
    color: "#818cf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  lockedTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  lockedSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  upgradeButton: {
    backgroundColor: "#818cf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  upgradeButtonText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 110,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#818cf8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#020617", fontSize: 16, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#1e293b", marginVertical: 32 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  signOutText: { color: "#ef4444", fontSize: 16, fontWeight: "bold" },
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  sheetContainer: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderBottomWidth: 0,
    paddingTop: 8,
    paddingBottom: 36,
  },
  sheetHandleContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1e293b",
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sheetOptionLast: {
    borderBottomWidth: 0,
  },
  sheetOptionIcon: {
    marginRight: 14,
  },
  sheetOptionText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
});

