import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../ctx/AuthContext";
import { validateImageSafety } from "../../lib/gemini";
import { uploadAvatar } from "../../lib/storage";
import { supabase } from "../../lib/supabase";

const GOAL_OPTIONS = [
  "Build Muscle",
  "Lose Fat",
  "Recomp",
  "Increase Strength",
  "Improve Endurance",
  "Maintenance",
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, session, refreshProfile, signOut, suppressLockForPicker, isPro } =
    useAuth();

  const [fullName, setFullName] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [ptNotes, setPtNotes] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [macroVariance, setMacroVariance] = useState<number>(
    profile?.macro_variance ?? 20,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showSuccessModal = (title: string, message: string) => {
    setSuccessModal({ visible: true, title, message });
  };

  const hideSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, visible: false }));
  };

  // Hydrate user's current profile from Supabase on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setFullName(data.full_name || "");
        setMealsPerDay(
          data.meals_per_day != null ? data.meals_per_day.toString() : "3",
        );
        setCalories(
          data.target_calories != null ? data.target_calories.toString() : "",
        );
        setProtein(
          data.target_protein != null ? data.target_protein.toString() : "",
        );
        setCarbs(data.target_carbs != null ? data.target_carbs.toString() : "");
        setFats(data.target_fats != null ? data.target_fats.toString() : "");
        setPtNotes(data.pt_notes || "");
        if (data.macro_variance != null) {
          setMacroVariance(data.macro_variance);
        }
        if (Array.isArray(data.goals)) {
          setGoals(data.goals);
        }
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

  // Sync state when profile in AuthContext loads or changes
  useEffect(() => {
    if (profile) {
      setFullName((prev) => prev || profile.full_name || "");
      setMealsPerDay(
        (prev) =>
          prev ||
          (profile.meals_per_day != null
            ? profile.meals_per_day.toString()
            : "3"),
      );
      setCalories((prev) => prev || profile.target_calories?.toString() || "");
      setProtein((prev) => prev || profile.target_protein?.toString() || "");
      setCarbs((prev) => prev || profile.target_carbs?.toString() || "");
      setFats((prev) => prev || profile.target_fats?.toString() || "");
      setPtNotes((prev) => prev || profile.pt_notes || "");
      if (profile.macro_variance != null) {
        setMacroVariance(profile.macro_variance);
      }
      if (Array.isArray(profile.goals) && profile.goals.length > 0) {
        setGoals((prev) => (prev.length > 0 ? prev : profile.goals!));
      }
      if (profile.avatar_url) {
        setAvatarUrl((prev) => prev || profile.avatar_url!);
      }
    }
  }, [profile]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleUpdateAvatar = async (source: "camera" | "library") => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      suppressLockForPicker();
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Camera Access Needed",
            text2: "Camera permission is required to photograph your avatar.",
          });
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Gallery Access Needed",
            text2: "Gallery permission is required to choose an avatar.",
          });
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUpdatingAvatar(true);

        let manipResult: ImageManipulator.ImageResult;
        try {
          manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 500 } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            }
          );
        } catch (manipErr: any) {
          console.error("Avatar compression error:", manipErr);
          Toast.show({
            type: "error",
            text1: "Compression Failed",
            text2: manipErr?.message || "Failed to compress avatar image.",
          });
          setIsUpdatingAvatar(false);
          return;
        }

        if (!manipResult.base64) {
          Toast.show({
            type: "error",
            text1: "Image Error",
            text2: "Could not read compressed image data.",
          });
          setIsUpdatingAvatar(false);
          return;
        }

        const safetyCheck = await validateImageSafety(manipResult.base64);
        if (!safetyCheck.isSafe) {
          Toast.show({
            type: "error",
            text1: "Image Rejected",
            text2: `Image rejected: ${safetyCheck.reason}`,
          });
          throw new Error(`Image rejected: ${safetyCheck.reason}`);
        }

        const mimeType = "image/jpeg";
        const publicUrl = await uploadAvatar(userId, manipResult.base64, mimeType);
        if (publicUrl) {
          setAvatarUrl(publicUrl);
          await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", userId);
          await refreshProfile();
          Toast.show({
            type: "success",
            text1: "Avatar Updated",
            text2: "Your new avatar has been saved successfully.",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: "Failed to upload avatar to Supabase storage.",
          });
        }
      }
    } catch (err: any) {
      console.error("Avatar update error:", err);
      if (!err?.message?.startsWith("Image rejected:")) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err?.message || "Failed to update avatar.",
        });
      }
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const isProUser = isPro || profile?.subscription_status === "pro";

  const handleSelectVariance = (val: number) => {
    if (!isProUser) {
      Toast.show({
        type: "error",
        text1: "Pro Feature",
        text2: "Custom Macro Variance is a Pro feature. Tap to upgrade.",
      });
      router.push("/pricing");
      return;
    }
    setMacroVariance(val);
  };

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
          Toast.show({
            type: "error",
            text1: "Camera Access Needed",
            text2:
              "Camera permission is required to photograph your PT plan. You can enable it in your device settings.",
          });
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          quality: 0.5,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Toast.show({
            type: "error",
            text1: "Photo Library Access Needed",
            text2:
              "Permission to access your photos is required to upload your PT plan.",
          });
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.5,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsExtracting(true);

      let manipResult: ImageManipulator.ImageResult;
      try {
        manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
      } catch (manipErr: any) {
        console.error("PT Notes compression error:", manipErr);
        Toast.show({
          type: "error",
          text1: "Compression Failed",
          text2: manipErr?.message || "Failed to compress PT plan image.",
        });
        setIsExtracting(false);
        return;
      }

      if (!manipResult.base64) {
        Toast.show({
          type: "error",
          text1: "Image Error",
          text2: "Failed to retrieve processed image data. Please choose another image.",
        });
        setIsExtracting(false);
        return;
      }

      const mimeType = "image/jpeg";

      const userGoals =
        goals.length > 0
          ? goals.join(", ")
          : profile?.goals && profile.goals.length > 0
            ? profile.goals.join(", ")
            : "General Fitness & Health";

      const { data, error } = await supabase.functions.invoke("pt-plan", {
        body: {
          imageBase64: manipResult.base64,
          mimeType,
          goals: userGoals,
        },
      });

      if (error || !data) {
        console.error("PT plan extraction error:", error);
        Toast.show({
          type: "error",
          text1: "Notice",
          text2:
            "No dietary constraints, macro targets, or notes could be found in this image.",
        });
        setIsExtracting(false);
        return;
      }

      const parsed: {
        calories?: number | null;
        protein?: number | null;
        carbs?: number | null;
        fats?: number | null;
        notes?: string | null;
      } = data;

      const {
        calories: extractedCalories,
        protein: extractedProtein,
        carbs: extractedCarbs,
        fats: extractedFats,
        notes: extractedNotes,
      } = parsed;

      // Destructure this JSON to directly populate the profile's macro text inputs
      if (extractedCalories != null && !isNaN(Number(extractedCalories))) {
        setCalories(String(Math.round(Number(extractedCalories))));
      }
      if (extractedProtein != null && !isNaN(Number(extractedProtein))) {
        setProtein(String(Math.round(Number(extractedProtein))));
      }
      if (extractedCarbs != null && !isNaN(Number(extractedCarbs))) {
        setCarbs(String(Math.round(Number(extractedCarbs))));
      }
      if (extractedFats != null && !isNaN(Number(extractedFats))) {
        setFats(String(Math.round(Number(extractedFats))));
      }
      if (extractedNotes && typeof extractedNotes === "string") {
        setPtNotes(extractedNotes.trim());
      }

      // Persist to profiles table strictly filtered by authenticated user's ID
      const userId = session?.user?.id;
      if (userId) {
        const dbUpdates: Record<string, any> = {};
        if (extractedNotes && typeof extractedNotes === "string") {
          dbUpdates.pt_notes = extractedNotes.trim();
        }
        if (extractedCalories != null && !isNaN(Number(extractedCalories))) {
          dbUpdates.target_calories = Math.round(Number(extractedCalories));
        }
        if (extractedProtein != null && !isNaN(Number(extractedProtein))) {
          dbUpdates.target_protein = Math.round(Number(extractedProtein));
        }
        if (extractedCarbs != null && !isNaN(Number(extractedCarbs))) {
          dbUpdates.target_carbs = Math.round(Number(extractedCarbs));
        }
        if (extractedFats != null && !isNaN(Number(extractedFats))) {
          dbUpdates.target_fats = Math.round(Number(extractedFats));
        }

        if (Object.keys(dbUpdates).length > 0) {
          const { error: dbError } = await supabase
            .from("profiles")
            .update(dbUpdates)
            .eq("id", userId);

          if (dbError) {
            console.error("PT Notes persistence error:", dbError);
            Toast.show({
              type: "error",
              text1: "Warning",
              text2:
                "PT notes extracted, but could not be saved to your cloud profile: " +
                dbError.message,
            });
          } else {
            await refreshProfile();
            Toast.show({
              type: "success",
              text1: "PT Notes Analyzed",
              text2:
                "Your macros and PT notes have been extracted and saved to your profile!",
            });
            showSuccessModal(
              "PT Notes Analyzed",
              "Your macros and PT notes have been extracted and saved to your profile!",
            );
          }
        } else {
          Toast.show({
            type: "success",
            text1: "PT Notes Analyzed",
            text2: "PT notes and macro targets extracted successfully!",
          });
          showSuccessModal(
            "PT Notes Analyzed",
            "PT notes and macro targets extracted successfully!",
          );
        }
      } else {
        Toast.show({
          type: "success",
          text1: "PT Notes Analyzed",
          text2: "PT notes and macro targets extracted successfully!",
        });
        showSuccessModal(
          "PT Notes Analyzed",
          "PT notes and macro targets extracted successfully!",
        );
      }
    } catch (error: any) {
      console.error("PT Notes OCR Error:", error);
      Toast.show({
        type: "error",
        text1: "OCR Extraction Failed",
        text2: error?.message || "Failed to extract text from PT notes image.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

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
        goals: goals,
        avatar_url: avatarUrl,
        macro_variance: macroVariance,
      })
      .eq("id", userId);

    setIsSaving(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save profile: " + error.message,
      });
    } else {
      await refreshProfile();
      Toast.show({
        type: "success",
        text1: "Profile Saved",
        text2:
          "Your profile details and macro targets have been updated successfully.",
      });
      showSuccessModal(
        "Profile Saved",
        "Your profile details and macro targets have been updated successfully.",
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      router.replace("/auth/login");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* CARD 1: Identity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="person-circle-outline" size={20} color="#818cf8" />
              <Text style={styles.cardTitle}>Identity</Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => setAvatarPickerVisible(true)}
              activeOpacity={0.8}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCirclePlaceholder}>
                  <Ionicons name="person" size={38} color="#818cf8" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                {isUpdatingAvatar ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Ionicons name="camera" size={13} color="#020617" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.avatarMeta}>
              <Text style={styles.avatarNameText}>
                {fullName.trim() || profile?.full_name || "User Profile"}
              </Text>
              <Text style={styles.avatarEmailText}>{session?.user?.email}</Text>
            </View>
          </View>

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

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Basic Goals</Text>
            <View style={styles.chipsContainer}>
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = goals.includes(goal);
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                    onPress={() => toggleGoal(goal)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* CARD 2: Nutrition Engine */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="flame-outline" size={20} color="#818cf8" />
              <Text style={styles.cardTitle}>Nutrition Engine</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Calories (kcal)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="e.g. 2500"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroColumn}>
              <Text style={styles.macroLabel}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={styles.macroColumn}>
              <Text style={styles.macroLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="200"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={styles.macroColumn}>
              <Text style={styles.macroLabel}>Fats (g)</Text>
              <TextInput
                style={styles.input}
                value={fats}
                onChangeText={setFats}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
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
        </View>

        {/* CARD 3: Advanced Preferences (Pro) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="options-outline" size={20} color="#818cf8" />
              <Text style={styles.cardTitle}>Advanced Preferences</Text>
            </View>
            {isProUser ? (
              <View style={styles.proActiveBadge}>
                <Text style={styles.proActiveBadgeText}>PRO ACTIVE</Text>
              </View>
            ) : (
              <View style={styles.proLockedBadge}>
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color="#818cf8"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.proLockedBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          {/* Stepped Button Group for Macro Match Variance */}
          <View
            style={[
              styles.varianceSection,
              !isProUser && styles.varianceSectionLocked,
            ]}
          >
            <View style={styles.varianceHeaderRow}>
              <View style={styles.varianceTitleGroup}>
                <Text style={styles.varianceTitle}>Macro Match Variance</Text>
                {!isProUser && (
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color="#818cf8"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
              <View
                style={[
                  styles.varianceBadge,
                  !isProUser && styles.varianceBadgeLocked,
                ]}
              >
                <Text
                  style={[
                    styles.varianceBadgeText,
                    !isProUser && styles.varianceBadgeTextLocked,
                  ]}
                >
                  ±{macroVariance}%
                </Text>
              </View>
            </View>

            <Text style={styles.varianceSubtitle}>
              Tolerance window applied when matching recipes to your targets.
            </Text>

            <View style={styles.stepperRow}>
              {[5, 10, 20, 30].map((val) => {
                const isSelected = macroVariance === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.stepperButton,
                      isSelected
                        ? styles.stepperButtonActive
                        : styles.stepperButtonInactive,
                    ]}
                    onPress={() => handleSelectVariance(val)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.stepperButtonText,
                        isSelected
                          ? styles.stepperButtonTextActive
                          : styles.stepperButtonTextInactive,
                      ]}
                    >
                      {val}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.cardInnerDivider} />

          {/* PT & Dietary Notes */}
          <View style={styles.ptNotesSection}>
            <View style={styles.ptNotesHeaderRow}>
              <Text style={styles.ptNotesTitle}>PT Plan & Constraints</Text>
            </View>

        {isProUser ? (
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
                    Analyzing PT Notes...
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
                  <Text style={styles.extractingTitle}>
                    Analyzing PT Notes...
                  </Text>
                  <Text style={styles.extractingSubtitle}>
                    Extracting dietary rules, macro targets, and notes...
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
              Upgrade to Pro to scan your PT plan and extract dietary
              guidelines, rules, and forbidden foods with AI.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push("/pricing")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#020617"
                style={styles.buttonIcon}
              />
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        )}

            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
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
          </View>
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

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
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

      <Modal
        transparent={true}
        animationType="fade"
        visible={successModal.visible}
        onRequestClose={hideSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideSuccessModal}
          />
          <View style={styles.successModalCard}>
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark-circle" size={48} color="#818cf8" />
            </View>
            <Text style={styles.successModalTitle}>{successModal.title}</Text>
            <Text style={styles.successModalMessage}>
              {successModal.message}
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={hideSuccessModal}
              activeOpacity={0.8}
            >
              <Text style={styles.successModalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={avatarPickerVisible}
        onRequestClose={() => setAvatarPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAvatarPickerVisible(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>
            <Text style={styles.sheetTitle}>Update Profile Photo</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => {
                setAvatarPickerVisible(false);
                handleUpdateAvatar("camera");
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
                setAvatarPickerVisible(false);
                handleUpdateAvatar("library");
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
              onPress={() => setAvatarPickerVisible(false)}
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
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: 0.2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  avatarMeta: {
    flex: 1,
  },
  avatarNameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },
  avatarEmailText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 3,
  },
  macrosRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  macroColumn: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 6,
  },
  proActiveBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderColor: "#818cf8",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proActiveBadgeText: {
    color: "#818cf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  proLockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    borderColor: "#1e293b",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proLockedBadgeText: {
    color: "#818cf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  varianceSection: {
    marginBottom: 16,
  },
  varianceSectionLocked: {
    opacity: 0.55,
  },
  varianceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  varianceTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  varianceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f8fafc",
  },
  varianceBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderColor: "#818cf8",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  varianceBadgeLocked: {
    borderColor: "#1e293b",
    backgroundColor: "#020617",
  },
  varianceBadgeText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "700",
  },
  varianceBadgeTextLocked: {
    color: "#64748b",
  },
  varianceSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 16,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepperButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  stepperButtonActive: {
    backgroundColor: "#818cf8",
    borderColor: "#818cf8",
  },
  stepperButtonInactive: {
    backgroundColor: "#020617",
    borderColor: "#1e293b",
  },
  stepperButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepperButtonTextActive: {
    color: "#020617",
  },
  stepperButtonTextInactive: {
    color: "#94a3b8",
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 16,
  },
  ptNotesSection: {},
  ptNotesHeaderRow: {
    marginBottom: 12,
  },
  ptNotesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f8fafc",
  },
  avatarWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarCirclePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#818cf8",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#020617",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  chipSelected: {
    backgroundColor: "#818cf8",
    borderColor: "#818cf8",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextUnselected: {
    color: "#94a3b8",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
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
  successModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successModalCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconBadge: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  successModalMessage: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  successModalButton: {
    backgroundColor: "#818cf8",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  successModalButtonText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "700",
  },
});
