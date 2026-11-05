import { router } from "expo-router";
import { useEffect } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../ctx/AuthContext";

export default function LockScreen() {
  const { unlock, signOut, isLocked } = useAuth();

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (isLocked) {
      unlock();
    } else {
      router.replace("/(tabs)");
    }
  }, [isLocked]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>App Locked</Text>
        <Text style={styles.subtitle}>
          Please verify your identity to continue.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={unlock}>
          <Text style={styles.primaryButtonText}>Unlock Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={signOut}>
          <Text style={styles.secondaryButtonText}>Sign Out Instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: "#818cf8",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
