import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDismiss = () => {
    try {
      router.back();
    } catch {
      router.replace("/(tabs)/recipes" as Href);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="information-circle-outline"
            size={32}
            color="#4ade80"
          />
        </View>
        <Text style={styles.title}>System Notice</Text>
        <Text style={styles.subtitle}>
          This is your modal context. You can use this for system disclosures,
          helper dialogs, or supplementary navigation flows.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleDismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#171717",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderWidth: 1,
    borderColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4ade80",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#0a0a0a",
    fontSize: 15,
    fontWeight: "700",
  },
});
