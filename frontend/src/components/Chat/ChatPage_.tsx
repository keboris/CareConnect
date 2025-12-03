import { useEffect, useState, useRef } from "react";
import { useAuth, useLanguage } from "../../contexts";
import type { ChatMessageProps, ChatSessionProps } from "../../types";
import { API_BASE_URL } from "../../config";

const ChatPage = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [sessions, setSessions] = useState<ChatSessionProps[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionProps | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupérer les sessions actives
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/help-sessions`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch chat sessions");
        const data = await res.json();
        setSessions(data.sessions);
        if (data.sessions && data.sessions.length > 0)
          setCurrentSession(data.sessions[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, [refreshUser]);

  // Retrieve messages for the current session
  useEffect(() => {
    if (!currentSession) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/${currentSession._id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data.messages);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [currentSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send a new message
  const handleSend = async () => {
    if (!newMessage.trim() || currentSession?.status !== "active") return;

    try {
      const res = await fetch(`${API_BASE_URL}/chat/${currentSession._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* SESSIONS */}
        <div className="w-1/4 bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4">{t("chat.sessions")}</h2>
          <ul className="space-y-2">
            {sessions &&
              sessions.map((session) => (
                <li
                  key={session._id}
                  onClick={() => setCurrentSession(session)}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-all ${
                    currentSession?._id === session._id
                      ? "bg-blue-600 text-white font-medium"
                      : "hover:bg-blue-100"
                  }`}
                >
                  {session.offerId
                    ? session.offer?.title
                    : session.request?.title}{" "}
                  {session.status !== "active" && "(Inactive)"}
                </li>
              ))}
          </ul>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col bg-white shadow-lg rounded-xl p-4">
          <div className="flex-1 overflow-y-auto mb-4">
            {currentSession ? (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex mb-2 ${
                      msg.sender === user?._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                        msg.sender?._id === user?._id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.content}
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                {t("chat.selectSession")}
              </div>
            )}
          </div>

          {/* INPUT */}
          {currentSession && (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={
                  currentSession.status === "active"
                    ? t("chat.typeMessage")
                    : t("chat.sessionInactive")
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={currentSession.status !== "active"}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${
                  currentSession.status === "active"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={currentSession.status !== "active"}
              >
                {t("chat.send")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
