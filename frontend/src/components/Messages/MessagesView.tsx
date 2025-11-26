import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '../../config/api';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Send, User } from 'lucide-react';

export function MessagesView() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!profile) return;

    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Conversation objects with populated listing, requester, and helper
    try {
      const data = await api.get(`/conversations?user_id=${profile.id}`);
      if (data) setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Message objects with populated sender
    try {
      const data = await api.get(`/messages/${conversationId}`);
      if (data) setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!profile) return;

    // TODO: Replace with actual MongoDB API endpoint
    // Mark all messages in this conversation as read (except user's own messages)
    try {
      await api.put(`/messages/${conversationId}/mark-read`, { user_id: profile.id });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedConversation || !newMessage.trim()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual MongoDB API endpoint
      // Expected response format: Created Message object with populated sender
      const data = await api.post('/messages', {
        conversation_id: selectedConversation.id,
        sender_id: profile.id,
        content: newMessage.trim(),
      });

      if (data) {
        setMessages([...messages, data]);
        setNewMessage('');
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Fehler beim Senden der Nachricht');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!profile) return null;
    return conversation.requester_id === profile.id
      ? conversation.helper
      : conversation.requester;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  if (!profile) return null;

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nachrichten</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Noch keine Unterhaltungen
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {otherUser.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">{otherUser.full_name}</p>
                        <span className="text-xs text-gray-500">{formatDate(conversation.last_message_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.listing?.title}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getOtherUser(selectedConversation)?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedConversation.listing?.title}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === profile.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht eingeben..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Wählen Sie eine Unterhaltung aus
          </div>
        )}
      </div>
    </div>
  );
}
