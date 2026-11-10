import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { showAppAlert } from "../../components/CustomAlert";

import Toast from "react-native-toast-message";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { supabase } from "../../lib/supabase";
import { UnifiedRecipe } from "../../types/recipe";
import {
  isCircuitBreakerOpen,
  recordCircuitFailure,
  recordCircuitSuccess,
} from "../../utils/circuitBreaker";

export interface LogFoodScreenProps {
  initialRecipe?: UnifiedRecipe;
  recipe?: UnifiedRecipe;
  onLogRecipe?: (recipe: UnifiedRecipe) => void;
}

export interface FatSecretServing {
  serving_id?: string;
  serving_description?: string;
  measurement_description?: string;
  metric_serving_amount?: string | number;
  metric_serving_unit?: string;
  number_of_units?: string | number;
  calories?: string | number;
  protein?: string | number;
  carbohydrate?: string | number;
  fat?: string | number;
}

interface ScannedFoodItem {
  name: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFats: number;
  baseGrams: number;
  imageUrl?: string;
  barcode?: string;
  availableServings?: FatSecretServing[];
}

interface FatSecretFoodOption {
  food_id: string;
  food_name: string;
  food_description?: string;
  food_type?: string;
  brand_name?: string;
  food_url?: string;
  image_url?: string;
}

function parseNutritionFromDescription(desc?: string) {
  if (!desc) {
    return { calories: 0, fats: 0, carbs: 0, protein: 0, grams: 100 };
  }
  const calMatch = desc.match(/Calories:\s*([\d.]+)\s*kcal/i);
  const fatMatch = desc.match(/Fat:\s*([\d.]+)g/i);
  const carbMatch = desc.match(/Carbs:\s*([\d.]+)g/i);
  const protMatch = desc.match(/Protein:\s*([\d.]+)g/i);
  const gramMatch = desc.match(/Per\s*([\d.]+)\s*g/i);

  return {
    calories: calMatch ? Math.round(parseFloat(calMatch[1])) : 0,
    fats: fatMatch ? parseFloat(fatMatch[1]) : 0,
    carbs: carbMatch ? parseFloat(carbMatch[1]) : 0,
    protein: protMatch ? parseFloat(protMatch[1]) : 0,
    grams: gramMatch ? parseFloat(gramMatch[1]) : 100,
  };
}

export default function LogFoodScreen({
  initialRecipe,
  recipe,
  onLogRecipe,
}: LogFoodScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const mainScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const { profile, session, isPro, isTrainingDay } = useAuth();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FatSecretFoodOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(() =>
    Boolean(initialRecipe || recipe),
  );
  const [selectedMealCategory, setSelectedMealCategory] = useState<
    string | null
  >(null);

  const [selectedFood, setSelectedFood] = useState<ScannedFoodItem | null>(
    () => {
      const target = initialRecipe || recipe;
      if (target) {
        return {
          name: target.title || target.name || "Untitled Meal",
          baseCalories: target.calories || 0,
          baseProtein: target.protein || 0,
          baseCarbs: target.carbs || 0,
          baseFats: target.fats || 0,
          baseGrams: 100,
          imageUrl:
            target.image_url ||
            (target.images && target.images.length > 0
              ? target.images[0]
              : undefined),
          availableServings: [
            {
              serving_id: "recipe-1",
              serving_description: "1 serving",
              measurement_description: "serving",
              metric_serving_amount: 100,
              calories: target.calories || 0,
              protein: target.protein || 0,
              carbohydrate: target.carbs || 0,
              fat: target.fats || 0,
            },
          ],
        };
      }
      return null;
    },
  );

  const [selectedServing, setSelectedServing] =
    useState<FatSecretServing | null>(() => {
      const target = initialRecipe || recipe;
      if (target) {
        return {
          serving_id: "recipe-1",
          serving_description: "1 serving",
          measurement_description: "serving",
          metric_serving_amount: 100,
          calories: target.calories || 0,
          protein: target.protein || 0,
          carbohydrate: target.carbs || 0,
          fat: target.fats || 0,
        };
      }
      return null;
    });

  const [quantity, setQuantity] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [dailyConsumed, setDailyConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (initialRecipe || recipe) {
      bottomSheetRef.current?.expand();
    }
  }, [initialRecipe, recipe]);
  const snapPoints = useMemo(() => ["76%"], []);

  const targets = useMemo(() => {
    const isProUser = Boolean(
      isPro || profile?.is_pro || profile?.subscription_status === "pro",
    );
    const baseline = {
      calories: profile?.target_calories || 2200,
      protein: profile?.target_protein || 140,
      carbs: profile?.target_carbs || 200,
      fats: profile?.target_fats || 65,
    };
    return isProUser ? getDailyTargets(profile, isTrainingDay) : baseline;
  }, [profile, isPro, isTrainingDay]);

  // Fetch today's consumed macros
  const fetchTodayLogs = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("daily_logs")
        .select("calories, protein, carbs, fats")
        .eq("user_id", session.user.id)
        .gte("logged_at", today.toISOString());

      if (error) {
        console.error("Failed to load today's daily logs:", error);
        return;
      }

      if (data) {
        const totals = data.reduce(
          (acc, item) => ({
            calories: acc.calories + (Number(item.calories) || 0),
            protein: acc.protein + (Number(item.protein) || 0),
            carbs: acc.carbs + (Number(item.carbs) || 0),
            fats: acc.fats + (Number(item.fats) || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 },
        );
        setDailyConsumed(totals);
      }
    } catch (e) {
      console.error("Error fetching logs:", e);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
      void fetchTodayLogs();

      return () => {
        setSearchQuery("");
        setSearchResults([]);
      };
    }, [fetchTodayLogs]),
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  // Debounced live autocomplete search using FatSecret with Circuit Breaker Protection
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      return;
    }

    const breakerStatus = isCircuitBreakerOpen("fatsecret");
    if (breakerStatus.isOpen) {
      console.warn(
        "[FatSecret Breaker Open] Skipping live autocomplete:",
        breakerStatus.reason,
      );
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "fatsecret-lookup",
          {
            body: { query: trimmed },
          },
        );

        if (error || data?.error) {
          recordCircuitFailure("fatsecret", error || data);
          console.warn("[FatSecret Search Error]", error || data?.error);
          setSearchResults([]);
          return;
        }

        recordCircuitSuccess("fatsecret");

        if (data?.foods?.food) {
          const list = Array.isArray(data.foods.food)
            ? data.foods.food
            : [data.foods.food];
          setSearchResults(list);
        } else {
          setSearchResults([]);
        }
      } catch (err: any) {
        recordCircuitFailure("fatsecret", err);
        console.warn("Search lookup error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!isScannerActive) return;
      setIsScannerActive(false);

      const cleanBarcode = (data || "").trim();
      if (!cleanBarcode) {
        showAppAlert("Invalid Barcode", "Could not read barcode format.");
        return;
      }

      const breakerStatus = isCircuitBreakerOpen("fatsecret");
      if (breakerStatus.isOpen) {
        showAppAlert(
          "Service Unavailable",
          breakerStatus.reason ||
            "FatSecret lookup is temporarily paused to prevent server throttling.",
        );
        return;
      }

      Toast.show({
        type: "info",
        text1: "Barcode Scanned",
        text2: "Looking up product details...",
        visibilityTime: 1800,
      });

      try {
        const { data: result, error } = await supabase.functions.invoke(
          "fatsecret-lookup",
          {
            body: { barcode: cleanBarcode },
          },
        );

        if (error || !result || result.error) {
          const errMsg = String(
            result?.error || error?.message || "",
          ).toLowerCase();
          const isNotFound =
            errMsg.includes("not found") || errMsg.includes("invalid barcode");
          if (!isNotFound) {
            recordCircuitFailure("fatsecret", error || result);
          }
          showAppAlert(
            "Food Not Found",
            result?.error || "Food not found in database for this barcode.",
          );
          return;
        }

        recordCircuitSuccess("fatsecret");

        const food = result.food;
        if (!food || (!food.food_name && !food.name)) {
          showAppAlert(
            "Food Not Found",
            "Food not found in database for this barcode.",
          );
          return;
        }

        const rawServings = food.servings?.serving;
        const servingsArray: FatSecretServing[] = Array.isArray(rawServings)
          ? rawServings
          : rawServings
            ? [rawServings]
            : [];
        const primaryServing =
          servingsArray.length > 0 ? servingsArray[0] : null;

        const foodItem: ScannedFoodItem = {
          name: food.food_name || food.name,
          baseCalories: Math.round(Number(primaryServing?.calories) || 0),
          baseProtein: Number(primaryServing?.protein) || 0,
          baseCarbs: Number(primaryServing?.carbohydrate) || 0,
          baseFats: Number(primaryServing?.fat) || 0,
          baseGrams: Number(primaryServing?.metric_serving_amount) || 100,
          imageUrl: result.image_url || food.image_url || undefined,
          barcode: data,
          availableServings:
            servingsArray.length > 0 ? servingsArray : undefined,
        };

        const defaultServing: FatSecretServing = primaryServing || {
          serving_id: "default",
          serving_description: `${foodItem.baseGrams}g`,
          metric_serving_amount: foodItem.baseGrams,
          calories: foodItem.baseCalories,
          protein: foodItem.baseProtein,
          carbohydrate: foodItem.baseCarbs,
          fat: foodItem.baseFats,
        };

        setSelectedFood(foodItem);
        setSelectedServing(defaultServing);
        setQuantity(1);
        setIsSheetOpen(true);
        bottomSheetRef.current?.expand();
      } catch (err: any) {
        recordCircuitFailure("fatsecret", err);
        console.warn("Barcode lookup failed:", err);
        showAppAlert("Lookup Failed", "Food not found in database.");
      }
    },
    [isScannerActive],
  );

  const handleSelectSearchResult = async (item: FatSecretFoodOption) => {
    Keyboard.dismiss();
    const parsed = parseNutritionFromDescription(item.food_description);

    const defaultServing: FatSecretServing = {
      serving_id: "default",
      serving_description: `${parsed.grams || 100}g`,
      measurement_description: "serving",
      metric_serving_amount: parsed.grams || 100,
      calories: parsed.calories,
      protein: parsed.protein,
      carbohydrate: parsed.carbs,
      fat: parsed.fats,
    };

    const initialItem: ScannedFoodItem = {
      name: item.food_name,
      baseCalories: parsed.calories,
      baseProtein: parsed.protein,
      baseCarbs: parsed.carbs,
      baseFats: parsed.fats,
      baseGrams: parsed.grams || 100,
      imageUrl: item.image_url || undefined,
      availableServings: [defaultServing],
    };

    setSelectedFood(initialItem);
    setSelectedServing(defaultServing);
    setQuantity(1);
    setSearchResults([]);
    setSearchQuery("");
    setIsSheetOpen(true);
    bottomSheetRef.current?.expand();

    // Background enrichment with full nutritional profile if food_id is available
    if (item.food_id) {
      try {
        const { data } = await supabase.functions.invoke("fatsecret-lookup", {
          body: { food_id: item.food_id },
        });

        if (data?.food) {
          const food = data.food;
          const rawServings = food.servings?.serving;
          const servingsArray: FatSecretServing[] = Array.isArray(rawServings)
            ? rawServings
            : rawServings
              ? [rawServings]
              : [];

          const enrichedImageUrl =
            data.image_url || food.image_url || initialItem.imageUrl;

          if (servingsArray.length > 0) {
            const primaryServing = servingsArray[0];
            const sCals = Math.round(
              Number(primaryServing.calories) || parsed.calories,
            );
            const sProt = Number(primaryServing.protein) || parsed.protein;
            const sCarb = Number(primaryServing.carbohydrate) || parsed.carbs;
            const sFat = Number(primaryServing.fat) || parsed.fats;
            const sGrams =
              Number(primaryServing.metric_serving_amount) ||
              parsed.grams ||
              100;

            setSelectedServing(primaryServing);
            setSelectedFood((prev) =>
              prev
                ? {
                    ...prev,
                    baseCalories: sCals,
                    baseProtein: sProt,
                    baseCarbs: sCarb,
                    baseFats: sFat,
                    baseGrams: sGrams,
                    imageUrl: enrichedImageUrl,
                    availableServings: servingsArray,
                  }
                : prev,
            );
          } else if (enrichedImageUrl) {
            setSelectedFood((prev) =>
              prev ? { ...prev, imageUrl: enrichedImageUrl } : prev,
            );
          }
        }
      } catch {
        // Non-blocking enrichment failure
      }
    }
  };

  const handleManualSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    Keyboard.dismiss();

    const breakerStatus = isCircuitBreakerOpen("fatsecret");
    if (breakerStatus.isOpen) {
      showAppAlert(
        "Search Temporarily Unavailable",
        breakerStatus.reason ||
          "FatSecret lookup is temporarily paused to prevent server throttling.",
      );
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "fatsecret-lookup",
        {
          body: { query: trimmed },
        },
      );

      if (error || !data || data.error) {
        recordCircuitFailure("fatsecret", error || data);
        Toast.show({
          type: "info",
          position: "bottom",
          bottomOffset: 95,
          text1: "No Foods Found",
          text2: data?.error || `No food items found matching "${trimmed}".`,
          visibilityTime: 2500,
        });
        setSearchResults([]);
        return;
      }

      recordCircuitSuccess("fatsecret");

      const list = data?.foods?.food
        ? Array.isArray(data.foods.food)
          ? data.foods.food
          : [data.foods.food]
        : [];

      if (list.length === 0) {
        Toast.show({
          type: "info",
          position: "bottom",
          bottomOffset: 95,
          text1: "No Foods Found",
          text2: `No food items found matching "${trimmed}". Try another search term.`,
          visibilityTime: 2500,
        });
        setSearchResults([]);
      } else {
        setSearchResults(list);
      }
    } catch (err: any) {
      recordCircuitFailure("fatsecret", err);
      console.warn("Manual search error:", err);
      Toast.show({
        type: "info",
        position: "bottom",
        bottomOffset: 95,
        text1: "Search Notice",
        text2: "Food database temporarily unreachable. Please try again.",
        visibilityTime: 2500,
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsSheetOpen(false);
    setSelectedFood(null);
    setSelectedServing(null);
    setQuantity(1);
  }, []);

  const handleSaveToMeal = async (mealTypeLabel: string) => {
    if (!selectedFood || !session?.user?.id) return;
    setIsSaving(true);

    try {
      const dbMealType = mealTypeLabel === "Snacks" ? "Snack" : mealTypeLabel;
      const calories = computedCalories;
      const protein = Number(computedProtein);
      const carbs = Number(computedCarbs);
      const fats = Number(computedFats);

      const metricAmount =
        Number(selectedServing?.metric_serving_amount) ||
        selectedFood.baseGrams ||
        100;
      const servingSize = Math.max(1, Math.round(metricAmount * quantity));

      // Fixed: Schema requires 'serving_size' instead of 'grams'
      const { error } = await supabase.from("daily_logs").insert({
        user_id: session.user.id,
        meal_type: dbMealType,
        food_name: selectedFood.name,
        calories,
        protein,
        carbs,
        fats,
        serving_size: servingSize,
        barcode: selectedFood.barcode || null,
      });

      if (error) throw error;

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});

      Toast.show({
        type: "success",
        text1: "Food Logged Successfully",
        text2: `Added ${selectedFood.name} (${calories} kcal) to ${mealTypeLabel}`,
        visibilityTime: 2500,
      });

      handleCloseSheet();
      setSearchQuery("");
      setSearchResults([]);
      await fetchTodayLogs();
      // NOTE: Persistent logging flow: no router.back() redirect
    } catch (err: any) {
      console.error("Save meal error:", err);
      Toast.show({
        type: "error",
        text1: "Logging Failed",
        text2: err?.message || "Could not save food log.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedServingMacros = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    if (selectedServing) {
      return {
        calories:
          Number(selectedServing.calories) || selectedFood.baseCalories || 0,
        protein:
          Number(selectedServing.protein) || selectedFood.baseProtein || 0,
        carbs:
          Number(selectedServing.carbohydrate) || selectedFood.baseCarbs || 0,
        fats: Number(selectedServing.fat) || selectedFood.baseFats || 0,
      };
    }
    return {
      calories: selectedFood.baseCalories,
      protein: selectedFood.baseProtein,
      carbs: selectedFood.baseCarbs,
      fats: selectedFood.baseFats,
    };
  }, [selectedFood, selectedServing]);

  const computedCalories = Math.round(
    selectedServingMacros.calories * quantity,
  );
  const computedProtein = (selectedServingMacros.protein * quantity).toFixed(1);
  const computedCarbs = (selectedServingMacros.carbs * quantity).toFixed(1);
  const computedFats = (selectedServingMacros.fats * quantity).toFixed(1);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <GestureHandlerRootView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Top Header Bar */}
        <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (isScannerActive) {
                setIsScannerActive(false);
              } else {
                router.back();
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isScannerActive ? "SCAN BARCODE" : "LOG FOOD"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* STATE 1: CAMERA STATE - Takes up full screen, hides targets & quick select categories */}
        {isScannerActive ? (
          <View
            style={[
              styles.fullCameraContainer,
              { paddingTop: insets.top + 60 },
            ]}
          >
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={
                  isScannerActive ? handleBarcodeScanned : undefined
                }
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "upc_a", "upc_e", "code128", "qr"],
                }}
              >
                <View style={styles.viewfinderOverlay}>
                  <View style={styles.boundingFrame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                    <View style={styles.scanLaser} />
                  </View>
                  <Text style={styles.scanHint}>
                    Align barcode within the frame
                  </Text>
                </View>
              </CameraView>
            ) : (
              <View style={styles.permissionFallback}>
                <Ionicons name="camera-outline" size={54} color="#4ade80" />
                <Text style={styles.permissionTitle}>
                  Camera Access Required
                </Text>
                <Text style={styles.permissionText}>
                  Camera permission is needed to scan food barcodes directly.
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                  activeOpacity={0.8}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.cancelScannerBtn,
                { bottom: Math.max(insets.bottom + 20, 40) },
              ]}
              onPress={() => setIsScannerActive(false)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.cancelScannerText}>Cancel Scanner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* STATE 2 & 3: NON-CAMERA (Search Bar + Dropdown or Targets/Quick Select) */
          <View style={[styles.mainLayout, { paddingTop: insets.top + 64 }]}>
            {/* Search Bar Section */}
            <View style={styles.searchSection}>
              <View style={styles.searchRow}>
                <View style={styles.searchBarContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#94a3b8"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search food name or brand..."
                    placeholderTextColor="#64748b"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleManualSearch}
                    returnKeyType="search"
                    autoCorrect={false}
                    maxLength={100}
                  />
                  {isSearching ? (
                    <ActivityIndicator
                      size="small"
                      color="#4ade80"
                      style={{ marginLeft: 6 }}
                    />
                  ) : searchQuery.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => handleSearchChange("")}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={18} color="#64748b" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.scanBarcodeButton}
                  onPress={() => {
                    if (!permission?.granted) {
                      requestPermission();
                    }
                    setIsScannerActive(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="barcode-outline" size={24} color="#0a0a0a" />
                </TouchableOpacity>
              </View>
            </View>

            {/* STEP 3: SEARCH RESULTS DROPDOWN (Rendered below search bar when searchResults > 0 & sheet closed) */}
            {searchResults.length > 0 && !isSheetOpen ? (
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeaderRow}>
                  <Text style={styles.resultsHeaderText}>
                    FATSECRET FOOD RESULTS
                  </Text>
                  <Text style={styles.resultsCountBadge}>
                    {searchResults.length} found
                  </Text>
                </View>

                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => item.food_id || String(index)}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.resultsListContent}
                  renderItem={({ item }) => {
                    const parsed = parseNutritionFromDescription(
                      item.food_description,
                    );
                    return (
                      <TouchableOpacity
                        style={styles.resultItemRow}
                        onPress={() => handleSelectSearchResult(item)}
                        activeOpacity={0.7}
                      >
                        {item.image_url ? (
                          <Image
                            source={{ uri: item.image_url }}
                            style={styles.resultItemThumb}
                            contentFit="cover"
                            transition={200}
                          />
                        ) : (
                          <View style={styles.resultItemIconFallback}>
                            <Ionicons
                              name="fast-food-outline"
                              size={18}
                              color="#4ade80"
                            />
                          </View>
                        )}

                        <View style={styles.resultItemDetails}>
                          <Text
                            style={styles.resultItemTitle}
                            numberOfLines={1}
                          >
                            {item.food_name}
                          </Text>
                          <Text
                            style={styles.resultItemSubtitle}
                            numberOfLines={1}
                          >
                            {item.brand_name ? `${item.brand_name} • ` : ""}
                            {parsed.calories > 0
                              ? `${parsed.calories} kcal`
                              : "Nutritional info"}
                            {parsed.protein > 0
                              ? ` • ${parsed.protein}g P`
                              : ""}
                          </Text>
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#475569"
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            ) : (
              /* DEFAULT STATE: Daily Targets & Quick Select Categories */
              <ScrollView
                ref={mainScrollRef}
                contentContainerStyle={styles.defaultContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Daily Macro Progress Section */}
                <View style={styles.macroProgressContainer}>
                  <View style={styles.macroHeaderRow}>
                    <Text style={styles.macroSectionTitle}>DAILY TARGETS</Text>
                    <Text style={styles.macroCaloriesBadge}>
                      {dailyConsumed.calories} / {targets.calories} kcal
                    </Text>
                  </View>

                  {/* Progress Bar (Calories) */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round(
                              (dailyConsumed.calories /
                                (targets.calories || 1)) *
                                100,
                            ),
                          )}%`,
                          backgroundColor: "#4ade80",
                        },
                      ]}
                    />
                  </View>

                  {/* Specific Macro Breakdown Progress */}
                  <View style={styles.macroPillRow}>
                    <View style={styles.macroPill}>
                      <View
                        style={[
                          styles.macroDot,
                          { backgroundColor: "#f87171" },
                        ]}
                      />
                      <Text style={styles.macroPillLabel}>P:</Text>
                      <Text style={styles.macroPillValue}>
                        {Math.round(dailyConsumed.protein)}/{targets.protein}g
                      </Text>
                    </View>
                    <View style={styles.macroPill}>
                      <View
                        style={[
                          styles.macroDot,
                          { backgroundColor: "#38bdf8" },
                        ]}
                      />
                      <Text style={styles.macroPillLabel}>C:</Text>
                      <Text style={styles.macroPillValue}>
                        {Math.round(dailyConsumed.carbs)}/{targets.carbs}g
                      </Text>
                    </View>
                    <View style={styles.macroPill}>
                      <View
                        style={[
                          styles.macroDot,
                          { backgroundColor: "#4ade80" },
                        ]}
                      />
                      <Text style={styles.macroPillLabel}>F:</Text>
                      <Text style={styles.macroPillValue}>
                        {Math.round(dailyConsumed.fats)}/{targets.fats}g
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick Select Categories */}
                <View style={styles.quickSelectHeader}>
                  <Text style={styles.mealSelectPrompt}>
                    Quick Select Meal Category
                  </Text>
                  {selectedMealCategory && (
                    <TouchableOpacity
                      onPress={() => setSelectedMealCategory(null)}
                    >
                      <Text style={styles.clearCategoryText}>
                        Clear ({selectedMealCategory})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.mealGrid}>
                  {[
                    {
                      label: "Breakfast",
                      icon: "sunny-outline",
                      color: "#f59e0b",
                    },
                    {
                      label: "Lunch",
                      icon: "restaurant-outline",
                      color: "#38bdf8",
                    },
                    { label: "Dinner", icon: "moon-outline", color: "#4ade80" },
                    { label: "Snacks", icon: "cafe-outline", color: "#ec4899" },
                  ].map((meal) => {
                    const isSelected = selectedMealCategory === meal.label;
                    return (
                      <TouchableOpacity
                        key={meal.label}
                        style={[
                          styles.mealCard,
                          isSelected && {
                            borderColor: meal.color,
                            backgroundColor: `${meal.color}15`,
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedMealCategory(meal.label);
                          Toast.show({
                            type: "info",
                            position: "bottom",
                            bottomOffset: 95,
                            text1: `${meal.label} Selected`,
                            text2: "Search food name or scan barcode to log.",
                            visibilityTime: 2000,
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.mealIconWrapper,
                            { backgroundColor: `${meal.color}20` },
                          ]}
                        >
                          <Ionicons
                            name={meal.icon as any}
                            size={22}
                            color={meal.color}
                          />
                        </View>
                        <Text
                          style={[
                            styles.mealCardTitle,
                            isSelected && { color: meal.color },
                          ]}
                        >
                          {meal.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* Sleek Bottom Sheet for Portion & Meal Logging */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={(index) => {
            const open = index >= 0;
            setIsSheetOpen(open);
            if (!open) {
              setSelectedFood(null);
            }
          }}
          onClose={handleCloseSheet}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.sheetIndicator}
        >
          <BottomSheetView style={styles.sheetContent}>
            {selectedFood && (
              <>
                <View style={styles.sheetHeader}>
                  {selectedFood.imageUrl ? (
                    <Image
                      source={{ uri: selectedFood.imageUrl }}
                      style={styles.sheetFoodImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.sheetPlaceholderIcon}>
                      <Ionicons
                        name="fast-food-outline"
                        size={24}
                        color="#4ade80"
                      />
                    </View>
                  )}
                  <View style={styles.sheetHeaderDetails}>
                    <Text style={styles.sheetFoodTitle} numberOfLines={1}>
                      {selectedFood.name}
                    </Text>
                    <Text style={styles.sheetFoodSubtitle}>
                      Baseline: {selectedFood.baseCalories} kcal per{" "}
                      {selectedFood.baseGrams}g
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCloseSheet}
                    style={styles.sheetCloseBtn}
                  >
                    <Ionicons name="close" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Dynamic FatSecret Serving Sizes & Quantity Stepper */}
                <View style={styles.portionBox}>
                  <Text style={styles.portionLabel}>SERVING SIZE</Text>

                  {/* Horizontal scroll list of available servings */}
                  <View style={styles.servingScrollContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.servingScrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      {(selectedFood.availableServings &&
                      selectedFood.availableServings.length > 0
                        ? selectedFood.availableServings
                        : selectedServing
                          ? [selectedServing]
                          : [
                              {
                                serving_id: "default",
                                serving_description: `${selectedFood.baseGrams || 100}g`,
                                calories: selectedFood.baseCalories,
                              },
                            ]
                      ).map((srv, idx) => {
                        const isSelected =
                          selectedServing?.serving_id === srv.serving_id ||
                          (!selectedServing && idx === 0) ||
                          (selectedServing?.serving_description ===
                            srv.serving_description &&
                            selectedServing?.calories === srv.calories);
                        const label =
                          srv.serving_description ||
                          srv.measurement_description ||
                          `${srv.metric_serving_amount || 100}g`;
                        return (
                          <TouchableOpacity
                            key={srv.serving_id || `srv-${idx}`}
                            style={[
                              styles.servingPill,
                              isSelected && styles.servingPillSelected,
                            ]}
                            onPress={() => setSelectedServing(srv)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.servingPillText,
                                isSelected && styles.servingPillTextSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {label}
                            </Text>
                            {srv.calories !== undefined &&
                            srv.calories !== null ? (
                              <Text
                                style={[
                                  styles.servingPillCalText,
                                  isSelected &&
                                    styles.servingPillCalTextSelected,
                                ]}
                              >
                                {Math.round(Number(srv.calories))} kcal
                              </Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Quantity Input / Stepper */}
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Quantity</Text>
                    <View style={styles.portionStepper}>
                      <TouchableOpacity
                        style={styles.portionStepBtn}
                        onPress={() =>
                          setQuantity((q) =>
                            Math.max(
                              0.25,
                              Math.round((q - (q > 1 ? 1 : 0.25)) * 100) / 100,
                            ),
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color="#f8fafc" />
                      </TouchableOpacity>

                      <View style={styles.portionDisplay}>
                        <TextInput
                          style={styles.quantityInput}
                          keyboardType="decimal-pad"
                          value={String(quantity)}
                          onChangeText={(txt) => {
                            const val = parseFloat(txt);
                            if (!isNaN(val) && val >= 0) {
                              setQuantity(val);
                            } else if (txt === "" || txt === ".") {
                              setQuantity(0);
                            }
                          }}
                          selectTextOnFocus
                        />
                        <Text style={styles.portionUnit}>servings</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.portionStepBtn}
                        onPress={() =>
                          setQuantity(
                            (q) =>
                              Math.round((q + (q >= 1 ? 1 : 0.25)) * 100) / 100,
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={20} color="#f8fafc" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Dynamic Macro Preview */}
                <View style={styles.macroPreviewGrid}>
                  <View style={styles.macroPreviewCard}>
                    <Text style={styles.macroPreviewVal}>
                      {computedCalories}
                    </Text>
                    <Text style={styles.macroPreviewLabel}>CALORIES</Text>
                  </View>
                  <View style={styles.macroPreviewCard}>
                    <Text
                      style={[styles.macroPreviewVal, { color: "#f87171" }]}
                    >
                      {computedProtein}g
                    </Text>
                    <Text style={styles.macroPreviewLabel}>PROTEIN</Text>
                  </View>
                  <View style={styles.macroPreviewCard}>
                    <Text
                      style={[styles.macroPreviewVal, { color: "#38bdf8" }]}
                    >
                      {computedCarbs}g
                    </Text>
                    <Text style={styles.macroPreviewLabel}>CARBS</Text>
                  </View>
                  <View style={styles.macroPreviewCard}>
                    <Text
                      style={[styles.macroPreviewVal, { color: "#4ade80" }]}
                    >
                      {computedFats}g
                    </Text>
                    <Text style={styles.macroPreviewLabel}>FATS</Text>
                  </View>
                </View>

                {/* Meal Selection Direct Action Buttons */}
                <Text style={styles.sheetPrompt}>
                  Select Meal to Confirm & Save
                </Text>
                <View style={styles.sheetMealGrid}>
                  {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => {
                    const isPreselected = selectedMealCategory === meal;
                    return (
                      <TouchableOpacity
                        key={meal}
                        style={[
                          styles.sheetMealButton,
                          isPreselected && styles.sheetMealButtonHighlighted,
                        ]}
                        onPress={() => handleSaveToMeal(meal)}
                        disabled={isSaving}
                        activeOpacity={0.8}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#f8fafc" />
                        ) : (
                          <Text
                            style={[
                              styles.sheetMealButtonText,
                              isPreselected &&
                                styles.sheetMealButtonTextHighlighted,
                            ]}
                          >
                            {meal}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  fullCameraContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000000",
  },
  cancelScannerBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelScannerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  boundingFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 0.75,
    borderRadius: 18,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#4ade80",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scanLaser: {
    width: "85%",
    height: 2,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  scanHint: {
    marginTop: 20,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  permissionFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#090d16",
  },
  permissionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: "#4ade80",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#0a0a0a",
    fontWeight: "700",
    fontSize: 14,
  },
  mainLayout: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#262626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  scanBarcodeButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  resultsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultsHeaderText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  resultsCountBadge: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "600",
  },
  resultsListContent: {
    paddingBottom: 40,
  },
  resultItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 8,
  },
  resultItemThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#262626",
  },
  resultItemIconFallback: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultItemDetails: {
    flex: 1,
    marginRight: 8,
  },
  resultItemTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  resultItemSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  defaultContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  macroProgressContainer: {
    backgroundColor: "#171717",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 20,
  },
  macroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  macroSectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  macroCaloriesBadge: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#262626",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  macroPillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  macroPillLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 4,
  },
  macroPillValue: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "700",
  },
  quickSelectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealSelectPrompt: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  clearCategoryText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
  },
  mealGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mealCard: {
    width: "48%",
    backgroundColor: "#171717",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  mealIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  mealCardTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomSheetBackground: {
    backgroundColor: "#171717",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#262626",
  },
  sheetIndicator: {
    backgroundColor: "#475569",
    width: 40,
  },
  sheetContent: {
    padding: 20,
    paddingTop: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sheetFoodImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#262626",
  },
  sheetPlaceholderIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sheetHeaderDetails: {
    flex: 1,
  },
  sheetFoodTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  sheetFoodSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  portionBox: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  portionLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  servingScrollContainer: {
    marginBottom: 10,
  },
  servingScrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  servingPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  servingPillSelected: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "#4ade80",
  },
  servingPillText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  servingPillTextSelected: {
    color: "#4ade80",
    fontWeight: "800",
  },
  servingPillCalText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  servingPillCalTextSelected: {
    color: "#86efac",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  quantityLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  portionControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  portionStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  portionStepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  portionDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    minWidth: 70,
    paddingHorizontal: 6,
    gap: 4,
  },
  quantityInput: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    minWidth: 28,
    textAlign: "center",
    padding: 0,
  },
  portionNumber: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
  },
  portionUnit: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  macroPreviewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  macroPreviewCard: {
    flex: 1,
    backgroundColor: "#020617",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  macroPreviewVal: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  macroPreviewLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sheetPrompt: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  sheetMealGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetMealButton: {
    flex: 1,
    backgroundColor: "#262626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },
  sheetMealButtonHighlighted: {
    backgroundColor: "#4ade80",
  },
  sheetMealButtonText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
  },
  sheetMealButtonTextHighlighted: {
    color: "#0a0a0a",
    fontWeight: "800",
  },
});
