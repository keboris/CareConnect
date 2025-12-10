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
  Edit,
  Trash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts";
import { CHAT_MESSAGE_API_URL, SESSION_API_URL } from "../../config";
import type { ChatMessageProps, HelpSessionProps, User } from "../../types";
import Loading from "../Landing/Loading";
import SessionDetail from "./SessionDetail";

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // State management
  const [sessions, setSessions] = useState<HelpSessionProps[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [selectedSession, setSelectedSession] =
    useState<HelpSessionProps | null>(null);

  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [editingMessage, setEditingMessage] = useState<ChatMessageProps | null>(
    null
  );

  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isShowDetails, setIsShowDetails] = useState(false);

  const MAX_HEIGHT = 150;
  /* USE EFFECTS */
  // Fetch sessions on mount
  useEffect(() => {
    if (loading) return;

    const fetchSessions = async () => {
      try {
        const response = await refreshUser(`${SESSION_API_URL}`);
        const data = await response.json();

        setSessions(data.helpSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    const interval = setInterval(() => {
      fetchSessions();
    }, 3000);

    return () => clearInterval(interval);
    //fetchSessions();
  }, [loading]);

  // Fetch messages when session is selected
  useEffect(() => {
    if (loading) return;

    if (selectedSession) {
      fetchMessages(selectedSession._id);

      scrollToBottom();
      markAllMessagesAsRead(selectedSession._id);
    }
  }, [loading, selectedSession]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isUserAtBottom) {
      scrollToBottom();
    }
  }, [messages, isUserAtBottom]);

  // Mark messages as read when user is at bottom
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const unreadFromOtherUser = messages.filter(
      (msg) => !msg.isRead && msg.senderId !== user?._id
    );
    if (selectedSession && isUserAtBottom && unreadFromOtherUser.length > 0) {
      markAllMessagesAsRead(selectedSession._id);

      setShowNewMessageIndicator(false);
    }
  }, [isUserAtBottom, messages]);

  // Polling to refresh messages every 3 seconds
  useEffect(() => {
    if (!selectedSession) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSession]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }, [newMessage]);

  /* FUNCTIONS */
  // Fetch messages for a session
  const fetchMessages = async (sessionId: string) => {
    try {
      const response = await refreshUser(
        `${CHAT_MESSAGE_API_URL}/${sessionId}`
      );
      const data = await response.json();

      setMessages(data.messages);

      setLoadingMessages(true);
      return data.messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      await refreshUser(`${CHAT_MESSAGE_API_URL}/${messageId}/read`, {
        method: "PATCH",
        body: JSON.stringify({ messageId }),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Mark all messages as read in a session
  const markAllMessagesAsRead = async (sessionId: string) => {
    try {
      await refreshUser(`${CHAT_MESSAGE_API_URL}/${sessionId}/readAll`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    console.log("hey je suis clic");
    if (!user || !newMessage.trim() || !selectedSession || sending) return;

    setSending(true);

    try {
      let res;

      if (editingMessage) {
        res = await refreshUser(
          `${CHAT_MESSAGE_API_URL}/${editingMessage._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newMessage.trim() }),
          }
        );

        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingMessage._id
              ? { ...m, content: newMessage.trim(), edited: true }
              : m
          )
        );
        setNewMessage("");
        setEditingMessage(null);
      } else {
        res = await refreshUser(
          `${CHAT_MESSAGE_API_URL}/${selectedSession._id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: newMessage.trim(),
            }),
          }
        );

        const data = await res.json();

        if (data.messageData) {
          setMessages((prev) => [...prev, data.messageData]);
          setNewMessage("");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const handleEditMessage = (msg: ChatMessageProps) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    await fetch(`${CHAT_MESSAGE_API_URL}/${messageId}`, {
      method: "DELETE",
      credentials: "include",
    });

    refreshMessages();
  };

  // Refresh messages
  const refreshMessages = async () => {
    if (selectedSession) {
      const oldLastMessageId = messages[messages.length - 1]?._id;

      const newMessages = await fetchMessages(selectedSession._id);

      const newLastMessageId = newMessages[newMessages.length - 1]?._id;

      if (newLastMessageId && newLastMessageId !== oldLastMessageId) {
        if (isUserAtBottom) {
          //scrollToBottom();
          markAllMessagesAsRead(selectedSession._id);
        } else {
          setShowNewMessageIndicator(true);
        }
      }
    }
  };

  // Handle Enter key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const el = chatRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    const target = el;
    const isBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    setIsUserAtBottom(isBottom);
  };

  // Get the other user in the session
  const getOtherUser = (session: any): User | null => {
    if (!user || !session) return null;
    const helper = session.userHelperId;
    const requester = session.userRequesterId;

    // session.userHelperId / session.userRequesterId may be either a string id or a populated User object.
    // Only return when they are populated User objects; otherwise return null.
    if (requester === user._id) {
      return typeof helper === "object" && helper !== null
        ? (helper as User)
        : null;
    } else {
      return typeof requester === "object" && requester !== null
        ? (requester as User)
        : null;
    }
  };

  // Format time for message timestamps
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

  // Get user initials for avatar
  const getUserInitials = (userName: User | null) => {
    if (!userName) return "?";
    return `${userName.firstName[0]}${userName.lastName[0]}`.toUpperCase();
  };

  /* END FUNCTIONS */

  // Filter sessions based on search query
  let filteredSessions: HelpSessionProps[] = [];

  if (sessions && sessions.length > 0) {
    const groupedSessions = sessions.reduce((acc, session) => {
      const otherUser = getOtherUser(session);
      const otherUserId = otherUser?._id;

      if (!otherUserId) return acc;

      const fullName =
        `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();

      const unread = session.unreadCount || 0;
      const currentLastMsg = session.lastMessage || null;

      // if group for this user doesn't exist yet, create it
      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          user: otherUser,
          fullName: fullName,
          lastMessage: currentLastMsg,
          unreadCount: unread,
          sessions: [session],
        };
      } else {
        const group = acc[otherUserId];

        const groupLastDate = group.lastMessage?.createdAt
          ? new Date(group.lastMessage.createdAt).getTime()
          : 0;

        const sessionLastDate = currentLastMsg?.createdAt
          ? new Date(currentLastMsg.createdAt).getTime()
          : 0;

        // Update the last message
        if (sessionLastDate > groupLastDate) {
          group.lastMessage = currentLastMsg;
        }

        // Update unread count
        group.unreadCount += unread;

        // Add the session to the group
        group.sessions.push(session);
      }

      return acc;
    }, {} as Record<string, any>);

    const statusOrder: Record<string, number> = {
      active: 0,
      completed: 1,
      cancelled: 2,
    };

    Object.values(groupedSessions).forEach((group) => {
      group.sessions.sort(
        (a: HelpSessionProps, b: HelpSessionProps) =>
          (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
      );
    });

    const displaySessions = Object.values(groupedSessions);

    console.log("Grouped Sessions:", displaySessions);

    filteredSessions = displaySessions.filter((item) =>
      item.fullName.includes(searchQuery.toLowerCase())
    );
  }

  if (loading || loadingSessions || loadingMessages) return <Loading />;

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
                console.log("Rendering session:", session);

                // Determine the actual HelpSessionProps object to select:
                // prefer the session that matches the lastMessage.sessionId, otherwise fall back to the first session in the group.
                const targetSession: HelpSessionProps | null =
                  (session.sessions && session.lastMessage?.sessionId
                    ? (session.sessions as unknown as HelpSessionProps[]).find(
                        (s) => s._id === session.lastMessage?.sessionId
                      ) || null
                    : null) ??
                  (session.sessions?.[0] as HelpSessionProps | undefined) ??
                  null;

                const otherUser = getOtherUser(targetSession);

                //const otherUser = getOtherUser(session);
                if (!otherUser) return null;

                return (
                  <motion.div
                    key={targetSession?._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => setSelectedSession(targetSession)}
                    onMouseEnter={() => setIsShowDetails(true)}
                    onMouseLeave={() => setIsShowDetails(false)}
                    className={`relative flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedSession?._id === targetSession?._id
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
                          {Array.isArray(session.sessions) &&
                            session.sessions.length > 0 && (
                              <span className="ml-1 font-normal text-gray-500">
                                {`(${session.sessions.length} sessions)`}
                              </span>
                            )}
                        </h3>
                        {
                          <span className="text-xs text-gray-500">
                            {session.lastMessage
                              ? formatTime(session.lastMessage?.createdAt)
                              : ""}
                          </span>
                        }
                      </div>
                      {
                        <p className="text-sm text-gray-600 truncate">
                          {session.lastMessage?.content || "No messages yet"}
                        </p>
                      }
                    </div>

                    {/* Unread Badge */}

                    {session.unreadCount > 0 && (
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {session.unreadCount}
                      </div>
                    )}

                    {isShowDetails && (
                      <SessionDetail
                        sessions={
                          Array.isArray(session.sessions)
                            ? (session.sessions as HelpSessionProps[])
                            : []
                        }
                        setIsShowDetails={setIsShowDetails}
                      />
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
            <div
              ref={chatRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
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

                      {showNewMessageIndicator && (
                        <button
                          className="absolute bottom-16 right-4 bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg animate-bounce"
                          onClick={() => {
                            scrollToBottom();
                            setShowNewMessageIndicator(false);
                            markMessageAsRead(
                              messages[messages.length - 1]._id
                            );
                          }}
                        >
                          New message ↓
                        </button>
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
                            {getUserInitials(getOtherUser(selectedSession))}
                          </div>
                        )}

                        {/* Message Content */}
                        <div
                          className={`relative group max-w-md ${
                            isMyMessage ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm transition-colors duration-200 ${
                              isMyMessage
                                ? !msg.isRead &&
                                  new Date().getTime() -
                                    new Date(msg.createdAt).getTime() <=
                                    5 * 60 * 1000
                                  ? "bg-blue-600 text-white rounded-br-none group-hover:bg-blue-600/30"
                                  : "bg-blue-600 text-white rounded-br-none hover:bg-blue-500"
                                : "bg-white text-gray-900 rounded-bl-none hover:bg-gray-100"
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
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

                          {/* Hover Buttons - Edit & Delete */}
                          {isMyMessage &&
                            !msg.isRead &&
                            new Date().getTime() -
                              new Date(msg.createdAt).getTime() <=
                              5 * 60 * 1000 && (
                              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditMessage(msg)}
                                  className="cursor-pointer p-2 bg-white/70 rounded-full hover:bg-white text-blue-600 hover:text-blue-800 shadow-md transition"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="cursor-pointer p-2 bg-white/70 rounded-full hover:bg-white text-red-600 hover:text-red-800 shadow-md transition"
                                >
                                  <Trash className="w-5 h-5" />
                                </button>
                              </div>
                            )}
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
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ maxHeight: MAX_HEIGHT }}
                    className="flex-1 bg-transparent border-none outline-none text-sm resize-none max-h-32"
                    disabled={
                      selectedSession &&
                      (selectedSession.status === "completed" ||
                        selectedSession.status === "cancelled")
                    }
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
