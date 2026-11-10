import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: CustomAlertButton[];
  buttonText?: string;
  onClose: () => void;
}

type GlobalAlertState = {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: CustomAlertButton[];
};

let globalAlertListener: ((state: GlobalAlertState) => void) | null = null;

export function showAppAlert(
  title: string,
  message?: string,
  buttons?: CustomAlertButton[]
) {
  if (globalAlertListener) {
    globalAlertListener({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: "OK" }],
    });
  } else {
    console.warn("GlobalAlert is not mounted in the component hierarchy.");
  }
}

export function GlobalAlert() {
  const [alertState, setAlertState] = useState<GlobalAlertState>({
    visible: false,
  });

  useEffect(() => {
    globalAlertListener = (state) => setAlertState(state);
    return () => {
      globalAlertListener = null;
    };
  }, []);

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <CustomAlert
      visible={alertState.visible}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      onClose={handleClose}
    />
  );
}

export function CustomAlert({
  visible,
  title,
  message,
  buttons,
  buttonText = "OK",
  onClose,
}: CustomAlertProps) {
  const resolvedButtons: CustomAlertButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: buttonText, onPress: onClose, style: "default" }];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={styles.card}
          className="w-full max-w-sm rounded-3xl p-6 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl items-center"
        >
          {Boolean(title) && (
            <Text
              style={styles.title}
              className="text-lg font-extrabold text-center text-zinc-900 dark:text-white mb-2"
            >
              {title}
            </Text>
          )}
          {Boolean(message) && (
            <Text
              style={styles.message}
              className="text-sm leading-5 text-center text-zinc-600 dark:text-zinc-300 mb-5"
            >
              {message}
            </Text>
          )}

          <View
            style={[
              styles.buttonRow,
              resolvedButtons.length > 2 && styles.buttonCol,
            ]}
          >
            {resolvedButtons.map((btn, index) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";

              let btnClass = "bg-[#4ade80]";
              let textClass = "text-[#0a0a0a]";

              if (isCancel) {
                btnClass = "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700";
                textClass = "text-zinc-700 dark:text-zinc-300";
              } else if (isDestructive) {
                btnClass = "bg-red-600 dark:bg-red-500";
                textClass = "text-white";
              }

              return (
                <TouchableOpacity
                  key={`${btn.text}-${index}`}
                  style={[
                    styles.button,
                    resolvedButtons.length <= 2 && { flex: 1 },
                  ]}
                  className={`${btnClass} rounded-xl py-3 px-4 items-center justify-center`}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    btn.onPress?.();
                  }}
                >
                  <Text
                    style={styles.buttonText}
                    className={`${textClass} font-bold text-sm`}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  buttonCol: {
    flexDirection: "column",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
