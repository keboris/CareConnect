import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts";
import { API_BASE_URL } from "../../config";

// Types matching backend models
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  email: string;
}

interface ChatSession {
  _id: string;
  userRequesterId: string;
  userHelperId: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  userRequester?: User;
  userHelper?: User;
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatMessage {
  _id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachements: string[];
  isRead: boolean;
  edited: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch all chat sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession._id);
    }
  }, [selectedSession]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/help-sessions`, {
        credentials: "include",
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat-messages/${sessionId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setMessages(data.messages || []);

      // Mark messages as read
      await markMessagesAsRead(sessionId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE_URL}/chat-messages/${sessionId}/read`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || sending) return;

    try {
      setSending(true);
      const response = await fetch(`${API_BASE_URL}/chat-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: selectedSession._id,
          receiverId: getOtherUserId(selectedSession),
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.messageData) {
        setMessages((prev) => [...prev, data.messageData]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUser = (session: ChatSession): User | null => {
    if (!user) return null;
    return session.userRequesterId === user._id
      ? session.userHelper || null
      : session.userRequester || null;
  };

  const getOtherUserId = (session: ChatSession): string => {
    if (!user) return "";
    return session.userRequesterId === user._id
      ? session.userHelperId
      : session.userRequesterId;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const otherUser = getOtherUser(session);
    if (!otherUser) return false;
    const fullName =
      `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Sessions Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <button
              onClick={() => navigate("/app")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <p className="text-center">No conversations found</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredSessions.map((session) => {
                const otherUser = getOtherUser(session);
                if (!otherUser) return null;

                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => setSelectedSession(session)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedSession?._id === session._id
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherUser.profileImage ? (
                        <img
                          src={otherUser.profileImage}
                          alt={otherUser.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {getUserInitials(otherUser)}
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherUser.firstName} {otherUser.lastName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(session.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {session.lastMessage || "No messages yet"}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {session.unreadCount && session.unreadCount > 0 && (
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {session.unreadCount}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {getOtherUser(selectedSession)?.profileImage ? (
                    <img
                      src={getOtherUser(selectedSession)?.profileImage}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getUserInitials(getOtherUser(selectedSession))}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* User Info */}
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOtherUser(selectedSession)?.firstName}{" "}
                    {getOtherUser(selectedSession)?.lastName}
                  </h2>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isMyMessage = msg.senderId === user?._id;
                  const showDate =
                    index === 0 ||
                    new Date(messages[index - 1].createdAt).toDateString() !==
                      new Date(msg.createdAt).toDateString();

                  return (
                    <div key={msg._id}>
                      {/* Date Separator */}
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {new Date(msg.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-end gap-2 ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Other user avatar */}
                        {!isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getUserInitials(msg.sender || null)}
                          </div>
                        )}

                        {/* Message Content */}
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
                            isMyMessage
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-900 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              isMyMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMyMessage && (
                              <>
                                {msg.isRead ? (
                                  <CheckCheck className="w-4 h-4 text-blue-200" />
                                ) : (
                                  <Check className="w-4 h-4 text-blue-200" />
                                )}
                              </>
                            )}
                            {msg.edited && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </div>
                        </div>

                        {/* My avatar */}
                        {isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getUserInitials(user)}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`p-3 rounded-full transition-all flex-shrink-0 ${
                    newMessage.trim() && !sending
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // No Session Selected
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Select a conversation
            </h2>
            <p className="text-sm text-gray-500">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
