import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderHeightContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { supabase } from "../lib/supabase";
import { showAppAlert } from "../components/CustomAlert";
import { FormattedMarkdown } from "../components/FormattedMarkdown";

function useHeaderHeight() {
  const headerHeight = useContext(HeaderHeightContext);
  return headerHeight ?? 0;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

const SESSIONS_STORAGE_KEY = "@ai_coach_sessions_v2";
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  text: "Hello! I am your AI PT Coach. Ready to crush your targets today?",
};

function createNewSessionObject(): ChatSession {
  const now = Date.now();
  return {
    id: `session_${now}`,
    title: "New Coaching Chat",
    createdAt: now,
    updatedAt: now,
    messages: [INITIAL_MESSAGE],
  };
}

export default function ChatScreen() {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const ref = useRef<FlatList<Message>>(null);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0] || null;
  const messages = currentSession?.messages || [INITIAL_MESSAGE];

  useEffect(() => {
    const loadSessions = async () => {
      let initialList: ChatSession[] = [];
      try {
        const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialList = parsed;
            setSessions(parsed);
            setCurrentSessionId(parsed[0].id);
          }
        }
      } catch (error) {
        console.warn("Local chat read error:", error);
      }

      if (profile?.id) {
        try {
          const { data: cloudSessions, error: cloudErr } = await supabase
            .from("chat_sessions")
            .select("id, title, created_at, updated_at, chat_messages(id, role, content, created_at)")
            .eq("user_id", profile.id)
            .order("updated_at", { ascending: false });

          if (!cloudErr && cloudSessions && cloudSessions.length > 0) {
            const mapped: ChatSession[] = cloudSessions.map((cs: any) => {
              const msgs: Message[] = Array.isArray(cs.chat_messages) && cs.chat_messages.length > 0
                ? cs.chat_messages
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((m: any) => ({
                      id: m.id,
                      role: m.role === "assistant" ? "model" : m.role,
                      text: m.content,
                    }))
                : [INITIAL_MESSAGE];

              return {
                id: cs.id,
                title: cs.title,
                createdAt: new Date(cs.created_at).getTime(),
                updatedAt: new Date(cs.updated_at).getTime(),
                messages: msgs,
              };
            });

            setSessions(mapped);
            setCurrentSessionId(mapped[0].id);
            await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(mapped));
            return;
          }
        } catch (cloudErr) {
          console.warn("Cloud chat load fallback:", cloudErr);
        }
      }

      if (initialList.length === 0) {
        const defaultSession = createNewSessionObject();
        setSessions([defaultSession]);
        setCurrentSessionId(defaultSession.id);
        await AsyncStorage.setItem(
          SESSIONS_STORAGE_KEY,
          JSON.stringify([defaultSession])
        );
      }
    };

    loadSessions();
  }, [profile?.id]);

  const persistSessions = async (updatedSessions: ChatSession[], sessionToSync?: ChatSession) => {
    setSessions(updatedSessions);
    try {
      await AsyncStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify(updatedSessions)
      );
    } catch (e) {
      console.warn("Error saving sessions to AsyncStorage:", e);
    }

    if (profile?.id && sessionToSync) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToSync.id);
        const { data: upserted } = await supabase.from("chat_sessions").upsert({
          ...(isUuid ? { id: sessionToSync.id } : {}),
          user_id: profile.id,
          title: sessionToSync.title,
          updated_at: new Date().toISOString(),
        }).select().single();

        if (upserted && !isUuid) {
          sessionToSync.id = upserted.id;
        }

        const latestMsg = sessionToSync.messages[sessionToSync.messages.length - 1];
        if (latestMsg && latestMsg.id !== INITIAL_MESSAGE.id) {
          const targetSessionId = upserted?.id || (isUuid ? sessionToSync.id : null);
          if (targetSessionId) {
            await supabase.from("chat_messages").insert({
              session_id: targetSessionId,
              user_id: profile.id,
              role: latestMsg.role === "model" ? "model" : "user",
              content: latestMsg.text,
            });
          }
        }
      } catch (err) {
        console.warn("Error syncing chat to Supabase:", err);
      }
    }
  };

  const handleStartNewChat = () => {
    const newSession = createNewSessionObject();
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setCurrentSessionId(newSession.id);
    setHistoryModalVisible(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setHistoryModalVisible(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    showAppAlert(
      "Delete Chat",
      "Are you sure you want to delete this chat session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const filtered = sessions.filter((s) => s.id !== sessionId);
            if (filtered.length === 0) {
              const fresh = createNewSessionObject();
              persistSessions([fresh]);
              setCurrentSessionId(fresh.id);
            } else {
              persistSessions(filtered);
              if (currentSessionId === sessionId) {
                setCurrentSessionId(filtered[0].id);
              }
            }

            if (profile?.id && !sessionId.startsWith("session_")) {
              try {
                await supabase.from("chat_sessions").delete().eq("id", sessionId).eq("user_id", profile.id);
              } catch (delErr) {
                console.warn("Error deleting cloud chat session:", delErr);
              }
            }
          },
        },
      ]
    );
  };

  const handleClearCurrentChat = () => {
    showAppAlert(
      "Clear Chat",
      "Are you sure you want to clear all messages in this coaching session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            if (!currentSession) return;
            const updatedSessions = sessions.map((s) =>
              s.id === currentSession.id
                ? { ...s, messages: [INITIAL_MESSAGE], updatedAt: Date.now() }
                : s
            );
            persistSessions(updatedSessions);
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmedText,
    };

    const updatedMessages = [...messages, userMessage].slice(-50);
    const isFirstUserMsg =
      messages.filter((m) => m.role === "user").length === 0;
    const sessionTitle = isFirstUserMsg
      ? trimmedText.slice(0, 32) + (trimmedText.length > 32 ? "..." : "")
      : currentSession.title;

    const sessionWithUser: ChatSession = {
      ...currentSession,
      title: sessionTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    const sessionsWithUser = sessions.map((s) =>
      s.id === currentSession.id ? sessionWithUser : s
    );
    persistSessions(sessionsWithUser, sessionWithUser);

    setInputText("");
    setIsLoading(true);

    try {
      const ptNotes = profile?.pt_notes || profile?.protocol_notes || "None provided";
      const targetCalories = profile?.target_calories || 2200;
      const targetProtein = profile?.target_protein || 140;
      const targetCarbs = profile?.target_carbs || 200;
      const targetFats = profile?.target_fats || 65;

      const systemPrompt = `You are the KineticLab Enterprise AI Coaching Assistant.
Client Personal Trainer Directives:
"${ptNotes}"

Client Daily Macro Blueprint:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbs: ${targetCarbs}g
- Fats: ${targetFats}g

Strictly align all advice with the trainer's notes and the athlete's current macros.`;

      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: {
          message: userMessage.text,
          history: updatedMessages,
          profile: {
            ...profile,
            pt_notes: ptNotes,
            target_calories: targetCalories,
            target_protein: targetProtein,
            target_carbs: targetCarbs,
            target_fats: targetFats,
          },
          systemPrompt,
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

      const finalMessages = [...updatedMessages, modelMessage].slice(-50);
      const sessionWithModel: ChatSession = {
        ...sessionWithUser,
        updatedAt: Date.now(),
        messages: finalMessages,
      };

      const sessionsWithModel = sessions.map((s) =>
        s.id === currentSession.id ? sessionWithModel : s
      );
      persistSessions(sessionsWithModel, sessionWithModel);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        text: "Sorry, I am having trouble connecting right now. Let us try again in a moment.",
      };
      const finalMessages = [...updatedMessages, errorMessage].slice(-50);
      const sessionWithError: ChatSession = {
        ...sessionWithUser,
        updatedAt: Date.now(),
        messages: finalMessages,
      };
      const sessionsWithError = sessions.map((s) =>
        s.id === currentSession.id ? sessionWithError : s
      );
      persistSessions(sessionsWithError);
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
      className={
        msg.role === "user"
          ? "bg-emerald-500 dark:bg-emerald-600 self-end"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start shadow-sm"
      }
    >
      {msg.role === "model" && (
        <Ionicons
          name="fitness-outline"
          size={16}
          color={isDark ? "#34d399" : "#15803d"}
          style={{ marginBottom: 4 }}
        />
      )}
      {msg.role === "user" ? (
        <Text style={[styles.messageText, styles.userText]} className="text-white font-medium">{msg.text}</Text>
      ) : (
        <FormattedMarkdown>{msg.text}</FormattedMarkdown>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <Stack.Screen
        options={{
          title: currentSession?.title || "AI PT Coach",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(true)}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Chat History"
              >
                <Ionicons name="time-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartNewChat}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="New Chat"
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearCurrentChat}
                style={styles.headerIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear Current Chat"
              >
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          ref={ref}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => ref.current?.scrollToEnd()}
          onLayout={() => ref.current?.scrollToEnd()}
          ListHeaderComponent={
            messages.length <= 1 && sessions.length > 1 ? (
              <View style={[styles.preLaunchPanel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={styles.preLaunchHeader}>
                  <View style={styles.preLaunchHeaderLeft}>
                    <Ionicons name="time-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.preLaunchTitle, { color: colors.text }]}>Resume Previous Chat</Text>
                  </View>
                  <TouchableOpacity onPress={() => setHistoryModalVisible(true)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={[styles.viewAllText, { color: colors.primaryText }]}>View All ({sessions.length})</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.preLaunchList}>
                  {sessions.slice(0, 3).map((s) => {
                    const isSelected = s.id === currentSessionId;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.preLaunchChip,
                          {
                            backgroundColor: isSelected ? (isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)") : colors.card,
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                          },
                        ]}
                        onPress={() => handleSelectSession(s.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isSelected ? "chatbubble" : "chatbubble-outline"}
                          size={14}
                          color={isSelected ? colors.primary : colors.textMuted}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.preLaunchChipText,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: "700" },
                          ]}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            isLoading ? (
              <View
                style={[
                  styles.messageBubble,
                  styles.modelBubble,
                  {
                    alignSelf: "flex-start",
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>AI PT Coach</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No messages yet. Ask anything about your workouts, nutrition, or targets to get started!
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: colors.surface,
              borderTopColor: colors.borderSubtle,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your coach..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus={true}
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.surfaceSubtle,
              },
            ]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#0a0a0a" : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SESSIONS HISTORY MODAL */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Chat Sessions</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Select a past session or start fresh
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newChatBtn}
              className="bg-[#4ade80] flex-row items-center justify-center py-3 rounded-xl mb-4"
              onPress={handleStartNewChat}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#0a0a0a" />
              <Text style={styles.newChatBtnText} className="text-[#0a0a0a] text-sm font-bold ml-1.5">Start New Coaching Session</Text>
            </TouchableOpacity>

            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isActive = item.id === currentSessionId;
                const formattedDate = new Date(item.updatedAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <View
                    style={[
                      styles.sessionCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isActive ? colors.primary : colors.cardBorder,
                      },
                      isActive && {
                        backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.08)",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.sessionCardContent}
                      onPress={() => handleSelectSession(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.sessionTitle,
                            { color: colors.text },
                            isActive && { color: colors.primaryText, fontWeight: "800" },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.sessionMeta, { color: colors.textSecondary }]}>
                          {formattedDate} · {item.messages.length} messages
                        </Text>
                      </View>
                      {isActive && (
                        <View style={[styles.activeBadge, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.2)" : "rgba(74, 222, 128, 0.15)" }]}>
                          <Text style={[styles.activeBadgeText, { color: colors.primaryText }]}>ACTIVE</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteSessionBtn}
                      onPress={() => handleDeleteSession(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  headerIconButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    borderWidth: 1,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#0a0a0a",
    fontWeight: "600",
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
    backgroundColor: "#171717",
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
  preLaunchPanel: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  preLaunchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  preLaunchHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  preLaunchTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  preLaunchList: {
    gap: 8,
  },
  preLaunchChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  preLaunchChipText: {
    fontSize: 13,
    flex: 1,
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
    backgroundColor: "#4ade80",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0b1329",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "85%",
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#f8fafc" },
  modalSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  newChatBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  sessionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  sessionCardActive: {
    borderColor: "#4ade80",
    backgroundColor: "rgba(74, 222, 128, 0.08)",
  },
  sessionCardContent: {
    flex: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f8fafc",
  },
  sessionMeta: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deleteSessionBtn: {
    padding: 14,
  },
});
