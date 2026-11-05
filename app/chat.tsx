import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderHeightContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function useHeaderHeight() {
  const headerHeight = useContext(HeaderHeightContext);
  return headerHeight ?? 0;
}
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../ctx/AuthContext";
import { supabase } from "../lib/supabase";

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface IconButtonProps {
  icon: string;
  onPress: () => void;
}

export function IconButton({ icon, onPress }: IconButtonProps) {
  const iconName =
    icon === "trash"
      ? "trash-outline"
      : (icon as React.ComponentProps<typeof Ionicons>["name"]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.headerIconButton}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Clear chat"
    >
      <Ionicons name={iconName} size={22} color="#ef4444" />
    </TouchableOpacity>
  );
}

const STORAGE_KEY = "chat_history";
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  text: "Hello! I am your AI PT Coach. Ready to crush your targets today?",
};

export default function ChatScreen() {
  const { profile } = useAuth();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<FlatList<Message>>(null);

  // Load chat_history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
        setMessages([INITIAL_MESSAGE]);
      } catch (error) {
        console.error("Error loading chat_history:", error);
        setMessages([INITIAL_MESSAGE]);
      }
    };

    loadChatHistory();
  }, []);

  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem("@ai_coach_messages");
      setMessages([]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const sendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmedText,
    };

    const updatedWithUser = [...messages, userMessage].slice(-50);
    setMessages(updatedWithUser);
    setInputText("");
    setIsLoading(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWithUser));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }

    try {
      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: {
          message: userMessage.text,
          history: updatedWithUser,
          profile: profile,
        },
      });

      if (error) {
        throw error;
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data?.reply || "Keep pushing! We are making progress.",
      };

      const finalMessages = [...updatedWithUser, modelMessage].slice(-50);
      setMessages(finalMessages);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
      } catch (saveError) {
        console.error("Error saving chat history:", saveError);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        text: "Sorry, I am having trouble connecting right now. Let us try again in a moment.",
      };
      const finalMessages = [...updatedWithUser, errorMessage].slice(-50);
      setMessages(finalMessages);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
      } catch (saveError) {
        console.error("Error saving chat history:", saveError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem: ListRenderItem<Message> = ({ item: msg }) => (
    <View
      style={[
        styles.messageBubble,
        msg.role === "user" ? styles.userBubble : styles.modelBubble,
      ]}
    >
      {msg.role === "model" && (
        <Ionicons
          name="fitness-outline"
          size={16}
          color="#818cf8"
          style={{ marginBottom: 4 }}
        />
      )}
      <Text
        style={[
          styles.messageText,
          msg.role === "user" ? styles.userText : styles.modelText,
        ]}
      >
        {msg.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#020617" }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <Stack.Screen
        options={{
          headerRight: () => <IconButton icon="trash" onPress={clearChat} />,
        }}
      />
      <View style={styles.container}>
        <FlatList
          ref={ref}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => ref.current?.scrollToEnd()}
          onLayout={() => ref.current?.scrollToEnd()}
          ListFooterComponent={
            isLoading ? (
              <View
                style={[
                  styles.messageBubble,
                  styles.modelBubble,
                  { alignSelf: "flex-start" },
                ]}
              >
                <ActivityIndicator color="#818cf8" size="small" />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubbles-outline" size={32} color="#818cf8" />
              </View>
              <Text style={styles.emptyTitle}>AI PT Coach</Text>
              <Text style={styles.emptySubtitle}>
                No messages yet. Ask anything about your workouts, nutrition, or targets to get started!
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your coach..."
            placeholderTextColor="#64748b"
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#020617" : "#64748b"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerIconButton: {
    marginRight: 16,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: "#818cf8",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#020617",
    fontWeight: "500",
  },
  modelText: {
    color: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#020617",
    color: "#f8fafc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    minHeight: 44,
    fontSize: 15,
    borderColor: "#1e293b",
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#818cf8",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
