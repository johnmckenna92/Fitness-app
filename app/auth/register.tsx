import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
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

export default function RegisterScreen() {
  const { suppressLockForPicker, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarMimeType, setAvatarMimeType] = useState<string>("image/jpeg");
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [isCheckingAvatar, setIsCheckingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const handleAlertClose = () => {
    const callback = alertConfig.onConfirm;
    setAlertConfig({ visible: false, title: "", message: "" });
    if (callback) {
      callback();
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handlePickImage = async (source: "camera" | "library") => {
    try {
      suppressLockForPicker();
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          setAlertConfig({
            visible: true,
            title: "Notice",
            message: "Camera permission is required to take an avatar photo.",
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
          setAlertConfig({
            visible: true,
            title: "Notice",
            message: "Gallery permission is required to choose an avatar.",
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

        try {
          setIsCheckingAvatar(true);
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 500 } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            },
          );

          if (!manipResult.base64) {
            throw new Error("Failed to process compressed image data.");
          }

          const safety = await validateImageSafety(manipResult.base64);
          if (!safety.isSafe) {
            setAlertConfig({
              visible: true,
              title: "Notice",
              message: `Image rejected: ${safety.reason || "Safety check failed"}`,
            });
            return;
          }

          setAvatarUri(manipResult.uri);
          setAvatarBase64(manipResult.base64);
          setAvatarMimeType("image/jpeg");
        } catch (manipErr: any) {
          console.error("Error manipulating avatar image:", manipErr);
          setAlertConfig({
            visible: true,
            title: "Notice",
            message:
              "Failed to process avatar image: " +
              (manipErr.message || "Unknown error"),
          });
        } finally {
          setIsCheckingAvatar(false);
        }
      }
    } catch (err: any) {
      console.error("Error picking avatar image:", err);
      setAlertConfig({
        visible: true,
        title: "Notice",
        message: "Failed to open image picker: " + (err.message || "Unknown error"),
      });
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setAlertConfig({
        visible: true,
        title: "Notice",
        message: "Please complete all required fields.",
      });
      return;
    }

    if (avatarBase64) {
      const safety = await validateImageSafety(avatarBase64);
      if (!safety.isSafe) {
        setAlertConfig({
          visible: true,
          title: "Notice",
          message: `Image rejected: ${safety.reason || "Safety check failed"}`,
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: "fitnessapp://",
          data: {
            full_name: fullName,
            goals: selectedGoals,
          },
        },
      });

      if (error) {
        console.log("SUPABASE ERROR:", error);
        setAlertConfig({
          visible: true,
          title: "Signup Failed",
          message: error.message || "Unknown database error. Check logs.",
        });
        setLoading(false);
        return;
      }

      // If email confirmation is enabled on Supabase, session will be null
      if (data?.user && !data?.session) {
        setLoading(false);
        setAlertConfig({
          visible: true,
          title: "Notice",
          message:
            "A verification link has been sent to your email. Please verify your account before logging in.",
          onConfirm: () => router.replace("/auth/login"),
        });
        return;
      }

      if (data?.user) {
        if (avatarBase64) {
          try {
            const uploadedAvatarUrl = await uploadAvatar(
              data.user.id,
              avatarBase64,
              avatarMimeType,
            );
            if (uploadedAvatarUrl) {
              await supabase
                .from("profiles")
                .update({ avatar_url: uploadedAvatarUrl })
                .eq("id", data.user.id);
            }
          } catch (uploadErr) {
            console.warn("Avatar upload error:", uploadErr);
          }
        }

        await refreshProfile();
      }

      setLoading(false);
      router.replace("/");
    } catch (err: any) {
      console.error("Unexpected registration error:", err);
      setAlertConfig({
        visible: true,
        title: "Signup Failed",
        message: err?.message || "Unknown database error. Check logs.",
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up to personalize your fitness targets
        </Text>

        {/* Circular Avatar Placeholder */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.8}
            onPress={() => setPickerModalVisible(true)}
          >
            {isCheckingAvatar ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="small" color="#818cf8" />
                <Text style={styles.avatarPromptText}>Checking...</Text>
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={38} color="#818cf8" />
                <Text style={styles.avatarPromptText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color="#020617" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Morgan"
              placeholderTextColor="#64748b"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. alex@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a secure password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {/* Select Your Goals Section */}
          <View style={styles.goalsSection}>
            <Text style={styles.goalsTitle}>Select Your Goals</Text>
            <Text style={styles.goalsSubtitle}>
              Choose one or more to personalize AI recommendations
            </Text>
            <View style={styles.chipsContainer}>
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
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

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text style={styles.buttonText}>Complete Registration</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={styles.linkText}>Login</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>

      {/* Custom Bottom Sheet Image Picker Modal */}
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
            <Text style={styles.sheetTitle}>Choose Avatar</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => {
                setPickerModalVisible(false);
                handlePickImage("camera");
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
                handlePickImage("library");
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPromptText: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#818cf8",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#020617",
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#f8fafc",
    fontSize: 15,
  },
  goalsSection: {
    marginTop: 6,
    marginBottom: 4,
  },
  goalsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  },
  goalsSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  button: {
    backgroundColor: "#818cf8",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  linkText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "600",
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
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
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
