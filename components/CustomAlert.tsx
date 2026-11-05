import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}: CustomAlertProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          {Boolean(title) && <Text style={styles.title}>{title}</Text>}
          {Boolean(message) && <Text style={styles.message}>{message}</Text>}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#f8fafc",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#818cf8",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "700",
  },
});
