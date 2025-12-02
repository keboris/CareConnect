import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth, useLanguage } from "../contexts";
import type { ChatMessageProps, ChatSessionProps } from "../types";
import { API_BASE_URL } from "../config";
import { motion } from "framer-motion";
import {
  Send,
  Search,
  User,
  MessageSquare,
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";

// Messages page with professional chat interface
const Messages: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State management
  const [sessions, setSessions] = useState<ChatSessionProps[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSessionProps[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionProps | null>(null);
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chat sessions
  useEffect(() => {
    document.title = `${t("nav.messages")} - CareConnect`;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/help-sessions`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch chat sessions");

        const data = await res.json();
        setSessions(data.sessions || []);
        setFilteredSessions(data.sessions || []);

        if (data.sessions && data.sessions.length > 0) {
          setCurrentSession(data.sessions[0]);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [refreshUser, t]);

  // Fetch messages for current session
  useEffect(() => {
    if (!currentSession) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/${currentSession._id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        setMessages(data.messages || []);
        scrollToBottom();

        if (data.messages && data.messages.length > 0) {
          await markMessagesAsRead(currentSession._id);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [currentSession]);

  // Filter sessions by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const filtered = sessions.filter((session) => {
      const title = session.offerId
        ? session.offer?.title
        : session.request?.title;
      return title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredSessions(filtered);
  }, [searchQuery, sessions]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Mark messages as read
  const markMessagesAsRead = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE_URL}/chat/session/${sessionId}/read`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send new message
  const handleSend = async () => {
    if (!newMessage.trim() || !currentSession) return;
    if (currentSession.status !== "active") {
      alert("Cannot send message to inactive session");
      return;
    }

    try {
      setIsSending(true);

      const res = await fetch(`${API_BASE_URL}/chat/${currentSession._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, data.messageData]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time display
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date display
  const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Get other participant name
  const getOtherParticipantName = (session: ChatSessionProps) => {
    if (!user) return "Unknown";

    const isRequester = session.userRequesterId === user._id;
    const otherUser = isRequester ? session.userHelper : session.userRequester;

    return otherUser
      ? `${otherUser.firstName} ${otherUser.lastName}`
      : "Unknown";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sessions Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-bold text-white mb-3">
            {t("nav.messages")}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">No conversations</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setCurrentSession(session)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    currentSession?._id === session._id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <User className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {getOtherParticipantName(session)}
                        </h3>
                        {session.status !== "active" && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {session.offerId
                          ? session.offer?.title
                          : session.request?.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDate(session.updatedAt || session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      {getOtherParticipantName(currentSession)}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {currentSession.offerId
                        ? currentSession.offer?.title
                        : currentSession.request?.title}
                    </p>
                  </div>
                </div>
                <div>
                  {currentSession.status === "active" ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isOwnMessage = msg.senderId === user?._id;
                    const showDateSeparator =
                      idx === 0 ||
                      formatDate(msg.createdAt) !==
                        formatDate(messages[idx - 1].createdAt);

                    return (
                      <div key={msg._id}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-white px-4 py-1 rounded-full shadow-sm text-xs text-gray-600 font-medium">
                              {formatDate(msg.createdAt)}
                            </div>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md px-4 py-3 rounded-2xl shadow-md ${
                              isOwnMessage
                                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            <p className="break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>

                            <div
                              className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                                isOwnMessage ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwnMessage && (
                                <>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-4 h-4 text-blue-200" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </>
                              )}
                              {msg.edited && (
                                <span className="italic">(edited)</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {currentSession.status === "active" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={t("chat.typeMessage")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                    className={`p-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                      newMessage.trim() && !isSending
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    This session is inactive. You cannot send messages.
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
