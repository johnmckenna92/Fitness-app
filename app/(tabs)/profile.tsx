import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { showAppAlert } from "../../components/CustomAlert";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { validateImageSafety } from "../../lib/gemini";
import { getSecureAvatarUrl, uploadAvatar } from "../../lib/storage";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";
import { kgToLbs, lbsToKg } from "../../utils/conversions";
import { setProfileDirtyState } from "../../utils/profileDirtyState";

import { ActivityLevelSelector } from "../../components/ActivityLevelSelector";
import { AccountSecurityCard } from "../../components/profile/AccountSecurityCard";
import { AppSettingsCard } from "../../components/profile/AppSettingsCard";
import { NutritionTargetsCard } from "../../components/profile/NutritionTargetsCard";
import { PermissionsAndAlertsCard } from "../../components/profile/PermissionsAndAlertsCard";
import { PersonalDetailsCard } from "../../components/profile/PersonalDetailsCard";
import { TrainerBrandingCard } from "../../components/profile/TrainerBrandingCard";
import { useAppStore } from "../../store/useAppStore";
import { setIsIntentionalBackground } from "../_layout";

const NOTIF_STORAGE_PREFIX = "@app_prefs_notif_";

export default function ProfileScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const {
    profile,
    session,
    refreshProfile,
    signOut,
    suppressLockForPicker,
    isPro,
  } = useAuth();
  const { colors, isDark } = useTheme();
  const { stepsRAG, isSyncingHealth, syncHealth, healthSyncError } =
    useAppStore();

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [calories, setCalories] = useState("2200");
  const [protein, setProtein] = useState("140");
  const [carbs, setCarbs] = useState("200");
  const [fats, setFats] = useState("65");
  const [ptNotes, setPtNotes] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [macroVariance, setMacroVariance] = useState<number>(
    profile?.macro_variance ?? 20,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<any>(
    Array.isArray(profile?.trainer)
      ? profile.trainer[0]
      : (profile?.trainer ?? null),
  );

  useEffect(() => {
    let isMounted = true;
    async function fetchTrainerJoin() {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "*, trainer:trainer_id(id, full_name, avatar_url, trainer_bio)",
          )
          .eq("id", session.user.id)
          .single();

        if (!error && data && isMounted) {
          const rawTrainer = (data as any)?.trainer;
          const resolved = Array.isArray(rawTrainer)
            ? rawTrainer[0]
            : rawTrainer;
          if (resolved) setTrainerData(resolved);
        }
      } catch (err) {
        console.warn("[profile.tsx] Error fetching trainer join:", err);
      }
    }
    fetchTrainerJoin();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, profile?.trainer_id]);

  // Modals & loaders
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [activitySelectorVisible, setActivitySelectorVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtractingPT, setIsExtractingPT] = useState(false);

  // App settings (device persisted silently)
  const [initialNotifs, setInitialNotifs] = useState({
    push: true,
    meals: true,
    coach: true,
  });
  const [pushEnabled, setPushEnabled] = useState(true);
  const [mealRemindersEnabled, setMealRemindersEnabled] = useState(true);
  const [coachAlertsEnabled, setCoachAlertsEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  const isProUser = Boolean(
    isPro || profile?.subscription_status === "pro" || profile?.is_pro,
  );
  const navigation = useNavigation();

  const resetFormToProfile = useCallback(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setAge(profile.age != null ? profile.age.toString() : "");
    setSex(profile.sex || "");
    setHeight(profile.height != null ? profile.height.toString() : "");
    setWeight(profile.weight != null ? profile.weight.toString() : "");
    setActivityLevel(profile.activity_level || "sedentary");
    setCalories(
      profile.target_calories != null
        ? profile.target_calories.toString()
        : "2200",
    );
    setProtein(
      profile.target_protein != null
        ? profile.target_protein.toString()
        : "140",
    );
    setCarbs(
      profile.target_carbs != null ? profile.target_carbs.toString() : "200",
    );
    setFats(
      profile.target_fats != null ? profile.target_fats.toString() : "65",
    );
    setPtNotes(profile.protocol_notes || profile.pt_notes || "");
    setMacroVariance(profile.macro_variance ?? 20);
    setGoals(Array.isArray(profile.goals) ? profile.goals : []);
    setPushEnabled(initialNotifs.push);
    setMealRemindersEnabled(initialNotifs.meals);
    setCoachAlertsEnabled(initialNotifs.coach);
    if (profile.avatar_url) {
      getSecureAvatarUrl(profile.avatar_url).then((url) => {
        setAvatarUrl(url || profile.avatar_url || null);
      });
    }
  }, [profile, initialNotifs]);

  const isDirty = useMemo(() => {
    const notifsDirty =
      pushEnabled !== initialNotifs.push ||
      mealRemindersEnabled !== initialNotifs.meals ||
      coachAlertsEnabled !== initialNotifs.coach;

    if (!profile) return notifsDirty;
    const initialName = profile.full_name || "";
    const initialAge = profile.age != null ? profile.age.toString() : "";
    const initialSex = profile.sex || "";
    const initialHeight =
      profile.height != null ? profile.height.toString() : "";
    const initialWeight =
      profile.weight != null ? profile.weight.toString() : "";
    const initialActivity = profile.activity_level || "sedentary";
    const initialCalories =
      profile.target_calories != null
        ? profile.target_calories.toString()
        : "2200";
    const initialProtein =
      profile.target_protein != null
        ? profile.target_protein.toString()
        : "140";
    const initialCarbs =
      profile.target_carbs != null ? profile.target_carbs.toString() : "200";
    const initialFats =
      profile.target_fats != null ? profile.target_fats.toString() : "65";
    const initialPtNotes = profile.protocol_notes || profile.pt_notes || "";
    const initialVariance = profile.macro_variance ?? 20;

    return (
      notifsDirty ||
      fullName !== initialName ||
      age !== initialAge ||
      sex !== initialSex ||
      height !== initialHeight ||
      weight !== initialWeight ||
      activityLevel !== initialActivity ||
      calories !== initialCalories ||
      protein !== initialProtein ||
      carbs !== initialCarbs ||
      fats !== initialFats ||
      ptNotes !== initialPtNotes ||
      macroVariance !== initialVariance
    );
  }, [
    profile,
    fullName,
    age,
    sex,
    height,
    weight,
    activityLevel,
    calories,
    protein,
    carbs,
    fats,
    ptNotes,
    macroVariance,
    pushEnabled,
    mealRemindersEnabled,
    coachAlertsEnabled,
    initialNotifs,
  ]);

  const hasUnsavedChanges = isDirty;

  useEffect(() => {
    setProfileDirtyState(hasUnsavedChanges, resetFormToProfile);
  }, [hasUnsavedChanges, resetFormToProfile]);

  useEffect(() => {
    const unsubscribe = (navigation as any)?.addListener?.(
      "beforeRemove",
      (e: any) => {
        if (!hasUnsavedChanges) {
          return;
        }

        e.preventDefault();

        showAppAlert(
          "Discard unsaved changes?",
          "You have unsaved changes on your profile. Are you sure you want to discard them?",
          [
            { text: "Keep Editing", style: "cancel" },
            {
              text: "Discard & Leave",
              style: "destructive",
              onPress: () => {
                resetFormToProfile();
                setProfileDirtyState(false);
                navigation.dispatch(e.data.action);
              },
            },
          ],
        );
      },
    );

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, resetFormToProfile]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.age != null) setAge(profile.age.toString());
      if (profile.sex) setSex(profile.sex);
      if (profile.height != null) setHeight(profile.height.toString());
      if (profile.weight != null) setWeight(profile.weight.toString());
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.target_calories != null)
        setCalories(profile.target_calories.toString());
      if (profile.target_protein != null)
        setProtein(profile.target_protein.toString());
      if (profile.target_carbs != null)
        setCarbs(profile.target_carbs.toString());
      if (profile.target_fats != null) setFats(profile.target_fats.toString());
      if (profile.protocol_notes || profile.pt_notes)
        setPtNotes(profile.protocol_notes || profile.pt_notes || "");
      if (profile.macro_variance != null)
        setMacroVariance(profile.macro_variance);
      if (Array.isArray(profile.goals)) setGoals(profile.goals);
      if (profile.avatar_url) {
        getSecureAvatarUrl(profile.avatar_url).then((url) => {
          setAvatarUrl(url || profile.avatar_url || null);
        });
      }
    }
  }, [profile]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedPush, savedMeals, savedCoach, savedUnit] =
          await Promise.all([
            AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}push`),
            AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}meals`),
            AsyncStorage.getItem(`${NOTIF_STORAGE_PREFIX}coach`),
            AsyncStorage.getItem("@user_units_system"),
          ]);
        const pushVal = savedPush !== null ? savedPush === "true" : true;
        const mealsVal = savedMeals !== null ? savedMeals === "true" : true;
        const coachVal = savedCoach !== null ? savedCoach === "true" : true;
        setPushEnabled(pushVal);
        setMealRemindersEnabled(mealsVal);
        setCoachAlertsEnabled(coachVal);
        setInitialNotifs({ push: pushVal, meals: mealsVal, coach: coachVal });
        if (savedUnit === "metric" || savedUnit === "imperial")
          setUnitSystem(savedUnit);
      } catch (e) {
        console.warn("Error loading settings preferences", e);
      }
    };
    loadSettings();
  }, []);

  const handleToggleUnitSystem = async (newSystem: "metric" | "imperial") => {
    if (newSystem === unitSystem) return;
    setUnitSystem(newSystem);
    await AsyncStorage.setItem("@user_units_system", newSystem);

    if (newSystem === "imperial") {
      const kg = parseFloat(weight);
      if (!isNaN(kg) && kg > 0) setWeight(kgToLbs(kg).toString());
      const cm = parseFloat(height);
      if (!isNaN(cm) && cm > 0) setHeight(Math.round(cm / 2.54).toString());
    } else {
      const lbs = parseFloat(weight);
      if (!isNaN(lbs) && lbs > 0) setWeight(lbsToKg(lbs).toString());
      const inches = parseFloat(height);
      if (!isNaN(inches) && inches > 0)
        setHeight(Math.round(inches * 2.54).toString());
    }
  };

  // Form-governed persistence for notification preferences
  const togglePush = (val: boolean) => {
    setPushEnabled(val);
  };

  const toggleMeals = (val: boolean) => {
    setMealRemindersEnabled(val);
  };

  const toggleCoach = (val: boolean) => {
    setCoachAlertsEnabled(val);
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleSelectVariance = (val: number) => {
    if (!isProUser && val !== 20) {
      router.push("/pricing");
      return;
    }
    setMacroVariance(val);
  };

  const handleActivitySelected = (
    newLevel: string,
    calculatedMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    },
  ) => {
    setActivityLevel(newLevel);
    setCalories(String(calculatedMacros.calories));
    setProtein(String(calculatedMacros.protein));
    setCarbs(String(calculatedMacros.carbs));
    setFats(String(calculatedMacros.fats));
  };

  const handleSaveChanges = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsSaving(true);
    try {
      const parsedAge = age ? parseInt(age, 10) : null;
      let parsedWeight = weight ? parseFloat(weight) : null;
      let parsedHeight = height ? parseFloat(height) : null;

      if (unitSystem === "imperial") {
        if (parsedWeight !== null && !isNaN(parsedWeight)) {
          parsedWeight = lbsToKg(parsedWeight);
        }
        if (parsedHeight !== null && !isNaN(parsedHeight)) {
          parsedHeight = Math.round(parsedHeight * 2.54);
        }
      }

      const parsedCalories = parseInt(calories, 10) || 2200;
      const parsedProtein = parseInt(protein, 10) || 140;
      const parsedCarbs = parseInt(carbs, 10) || 200;
      const parsedFats = parseInt(fats, 10) || 65;

      const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
        full_name: fullName.trim() || null,
        age: parsedAge,
        sex: sex.trim() || null,
        weight: parsedWeight,
        height: parsedHeight,
        activity_level: activityLevel,
        goals: goals.length > 0 ? goals : null,
        target_calories: parsedCalories,
        target_protein: parsedProtein,
        target_carbs: parsedCarbs,
        target_fats: parsedFats,
        macro_variance: macroVariance,
        pt_notes: ptNotes.trim() || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) throw error;

      await Promise.all([
        AsyncStorage.setItem(
          `${NOTIF_STORAGE_PREFIX}push`,
          String(pushEnabled),
        ),
        AsyncStorage.setItem(
          `${NOTIF_STORAGE_PREFIX}meals`,
          String(mealRemindersEnabled),
        ),
        AsyncStorage.setItem(
          `${NOTIF_STORAGE_PREFIX}coach`,
          String(coachAlertsEnabled),
        ),
      ]);
      setInitialNotifs({
        push: pushEnabled,
        meals: mealRemindersEnabled,
        coach: coachAlertsEnabled,
      });

      await refreshProfile();
      setProfileDirtyState(false);
      Toast.show({
        type: "success",
        text1: "Profile Saved",
        text2: "Your personal details and nutritional targets are updated.",
      });
    } catch (err: any) {
      console.error("Save profile error:", err);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err?.message || "Could not save your profile changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAvatar = async (source: "camera" | "library") => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      suppressLockForPicker();
      setIsIntentionalBackground(true);
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Camera Access Needed",
            text2: "Camera permission is required to capture your avatar.",
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
            text2: "Gallery permission is required to select an avatar.",
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

        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 500 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          },
        );

        if (!manipResult.base64) throw new Error("Could not read image data.");

        const safetyCheck = await validateImageSafety(manipResult.base64);
        if (!safetyCheck.isSafe) {
          Toast.show({
            type: "error",
            text1: "Image Rejected",
            text2: `Image rejected: ${safetyCheck.reason}`,
          });
          return;
        }

        const publicUrl = await uploadAvatar(
          userId,
          manipResult.base64,
          "image/jpeg",
        );
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
            text2: "Your new profile picture has been saved.",
          });
        }
      }
    } catch (err: any) {
      console.error("Avatar update error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update avatar.",
      });
    } finally {
      setIsUpdatingAvatar(false);
      setAvatarPickerVisible(false);
    }
  };

  const handleScanPlan = async () => {
    try {
      suppressLockForPicker();
      setIsIntentionalBackground(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Gallery Access Needed",
          text2: "Gallery permission is required to upload a PT plan.",
        });
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      setIsExtractingPT(true);
      const asset = pickerResult.assets[0];

      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );

      if (!manipResult.base64) {
        throw new Error("Could not process document image.");
      }

      const { data: edgeData, error: edgeError } =
        await supabase.functions.invoke("pt-plan", {
          body: {
            imageBase64: manipResult.base64,
            mimeType: "image/jpeg",
            goals: goals.length > 0 ? goals : ["Build Muscle"],
          },
        });

      if (edgeError) throw edgeError;

      if (edgeData) {
        if (edgeData.calories) setCalories(edgeData.calories.toString());
        if (edgeData.protein) setProtein(edgeData.protein.toString());
        if (edgeData.carbs) setCarbs(edgeData.carbs.toString());
        if (edgeData.fats) setFats(edgeData.fats.toString());
        const extractedNotes =
          edgeData.pt_notes || edgeData.protocol_notes || edgeData.notes;
        if (extractedNotes) setPtNotes(extractedNotes);

        Toast.show({
          type: "success",
          text1: "Targets Extracted!",
          text2: "Extracted daily macros & protocol notes.",
        });
      }
    } catch (err: any) {
      console.error("Scan plan error:", err);
      Toast.show({
        type: "error",
        text1: "Extraction Failed",
        text2:
          err?.message || "Could not parse document. Enter targets manually.",
      });
    } finally {
      setIsExtractingPT(false);
    }
  };

  const handleSignOut = () => {
    showAppAlert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/(auth)/login");
            } catch (err) {
              console.error("Sign out error:", err);
            }
          },
        },
      ],
    );
  };

  const userEmail = session?.user?.email || "No email on record";
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: PERSONAL DETAILS & BIOMETRICS */}
        <PersonalDetailsCard
          avatarUrl={avatarUrl}
          isProUser={isProUser}
          isUpdatingAvatar={isUpdatingAvatar}
          onEditAvatar={() => setAvatarPickerVisible(true)}
          fullName={fullName}
          onFullNameChange={setFullName}
          email={userEmail}
          age={age}
          onAgeChange={setAge}
          sex={sex}
          onSexChange={setSex}
          height={height}
          onHeightChange={setHeight}
          weight={weight}
          onWeightChange={setWeight}
          activityLevel={activityLevel}
          onOpenActivitySelector={() => setActivitySelectorVisible(true)}
          unitSystem={unitSystem}
        />

        {/* CARD 2: NUTRITIONAL TARGETS & PREFERENCES */}
        <NutritionTargetsCard
          calories={calories}
          onCaloriesChange={setCalories}
          protein={protein}
          onProteinChange={setProtein}
          carbs={carbs}
          onCarbsChange={setCarbs}
          fats={fats}
          onFatsChange={setFats}
          goals={goals}
          onToggleGoal={toggleGoal}
          macroVariance={macroVariance}
          onSelectVariance={handleSelectVariance}
          isProUser={isProUser}
          isTrainerLinked={Boolean(profile?.trainer_id)}
        />

        {/* CARD 2.5: ASSIGNED COACH & PROTOCOL */}
        {Boolean(profile?.trainer_id || trainerData?.id) ? (
          <TrainerBrandingCard
            trainerId={profile?.trainer_id || trainerData?.id}
            trainer={
              trainerData ||
              (Array.isArray(profile?.trainer)
                ? profile.trainer[0]
                : profile?.trainer)
            }
            ptNotes={ptNotes}
            onPtNotesChange={setPtNotes}
            isProUser={isProUser}
            onScanPlan={handleScanPlan}
            isScanning={isExtractingPT}
          />
        ) : null}

        {/* CARD 3: APP SETTINGS */}
        <AppSettingsCard
          unitSystem={unitSystem}
          onToggleUnitSystem={handleToggleUnitSystem}
        />

        {/* CARD 3.5: PERMISSIONS & SYSTEM ALERTS */}
        <PermissionsAndAlertsCard
          pushEnabled={pushEnabled}
          mealRemindersEnabled={mealRemindersEnabled}
          coachAlertsEnabled={coachAlertsEnabled}
          onTogglePush={togglePush}
          onToggleMeals={toggleMeals}
          onToggleCoach={toggleCoach}
          isSyncingHealth={isSyncingHealth}
          stepsRAG={stepsRAG}
          healthSyncError={healthSyncError}
          onSyncHealth={() => {
            if (session?.user?.id) {
              syncHealth(session.user.id);
            }
          }}
        />

        {/* CARD 4: ACCOUNT & SECURITY */}
        <AccountSecurityCard
          trainerId={profile?.trainer_id}
          onSignOut={handleSignOut}
        />

        {/* EXPLICIT SAVE ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveChanges}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0a0a0a" />
          ) : (
            <View style={styles.saveBtnInner}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#0a0a0a"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* DESCRIPTIVE ACTIVITY LEVEL SELECTOR MODAL (NO AUTOSAVE / NO TOAST) */}
      <ActivityLevelSelector
        visible={activitySelectorVisible}
        currentLevel={activityLevel}
        profile={profile}
        autoSave={false}
        onClose={() => setActivitySelectorVisible(false)}
        onSuccess={handleActivitySelected}
      />

      {/* AVATAR PICKER MODAL */}
      <Modal
        visible={avatarPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setAvatarPickerVisible(false)}
        >
          <View
            style={[
              styles.pickerActionSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              Change Profile Photo
            </Text>

            <TouchableOpacity
              style={[
                styles.pickerOption,
                {
                  borderBottomColor: colors.borderSubtle,
                  borderBottomWidth: 1,
                },
              ]}
              onPress={() => handleUpdateAvatar("camera")}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleUpdateAvatar("library")}
            >
              <Ionicons
                name="images-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                Choose from Library
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pickerCancelBtn,
                { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
              ]}
              onPress={() => setAvatarPickerVisible(false)}
            >
              <Text
                style={[
                  styles.pickerCancelText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  pickerActionSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 36,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  pickerOptionText: { fontSize: 15, fontWeight: "600" },
  pickerCancelBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  pickerCancelText: { fontSize: 14, fontWeight: "700" },
});
