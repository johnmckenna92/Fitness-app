import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai/web";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../ctx/AuthContext";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

const STORAGE_KEY = "@ai_coach_messages";
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  text: "Hello! I am your AI PT Coach. Ready to crush your targets today?",
};

export default function ChatScreen() {
  const { profile } = useAuth();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoaded = useRef(false);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Load saved messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
        setMessages([INITIAL_MESSAGE]);
      } catch (error) {
        console.error("Error loading chat messages:", error);
        setMessages([INITIAL_MESSAGE]);
      } finally {
        isLoaded.current = true;
      }
    };

    loadMessages();
  }, []);

  // Save messages array to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoaded.current) return;

    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat messages:", error);
      }
    };

    saveMessages();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: inputText.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
      });

      const ptNotesSection = profile?.pt_notes?.trim()
        ? `\n\nPersonal Trainer Rules & Plan Notes:\n"""\n${profile.pt_notes.trim()}\n"""\nYou MUST strictly enforce these specific PT rules in all advice, recommendations, and motivation you give.`
        : "";

      const systemPrompt = `You are an elite AI Personal Trainer and Sports Nutritionist for a UK-based client. 
      The user's daily targets are: ${profile?.target_calories || 0} kcal, ${profile?.target_protein || 0}g protein, ${profile?.target_carbs || 0}g carbs, ${profile?.target_fats || 0}g fats.${ptNotesSection} 
      Keep responses highly concise, motivational, and strictly focused on these targets and UK fitness standards.`;

      const chatHistory = messages
        .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`)
        .join("\n");
      const fullPrompt = `${systemPrompt}\n\nChat History:\n${chatHistory}\n\nUser: ${userMessage.text}\nCoach:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: fullPrompt,
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "Keep pushing! We are making progress.",
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        text: "Sorry, I am having trouble connecting right now. Let us try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
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
        ))}
        {isLoading && (
          <View
            style={[
              styles.messageBubble,
              styles.modelBubble,
              { alignSelf: "flex-start" },
            ]}
          >
            <ActivityIndicator color="#818cf8" size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
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
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? "#020617" : "#64748b"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
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
  inputContainer: {
    flexDirection: "row",
    padding: 12,
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
    maxHeight: 100,
    minHeight: 40,
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
