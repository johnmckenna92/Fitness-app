import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../ctx/AuthContext";

export default function NotesFromCoachWidget() {
  const { profile } = useAuth();

  const rawTrainer = profile?.trainer;
  const trainer = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;
  const ptNotes = profile?.protocol_notes || profile?.pt_notes;

  if (!trainer || !ptNotes) return null;

  return (
    <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="pin" size={16} color="#10b981" />
          <Text className="text-xs font-extrabold text-emerald-700 dark:text-emerald-500 tracking-wider">
            COACH DIRECTIVE
          </Text>
        </View>
      </View>
      <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed mt-2">
        &ldquo;{ptNotes}&rdquo;
      </Text>
      <Text className="text-xs text-emerald-600 dark:text-emerald-500 font-bold mt-3">
        — {trainer.full_name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
