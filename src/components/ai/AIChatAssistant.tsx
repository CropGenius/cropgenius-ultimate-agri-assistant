import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Message, ChatHistory } from '../types/chat';
import { useGemini } from '../hooks/useGemini';
import { useChatHistory } from '../hooks/useChatHistory';
import { ChatBubbleLeftIcon, ChatBubbleRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIChatAssistantProps {
  onMessageSent?: (message: string) => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getChatHistory } = useChatHistory();
  const { generateResponse } = useGemini();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    const history = await getChatHistory(user.id);
    setMessages(history);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await generateResponse(input, user.id);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        userId: user.id
      };

      setMessages(prev => [...prev, aiMessage]);
      if (onMessageSent) onMessageSent(input);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        userId: user.id
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center gap-2">
                {message.role === 'user' ? (
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                ) : (
                  <ChatBubbleRightIcon className="w-4 h-4" />
                )}
                <span>{message.content}</span>
              </div>
              <small className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your crops, weather, or market prices..."
            className="flex-1 p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
