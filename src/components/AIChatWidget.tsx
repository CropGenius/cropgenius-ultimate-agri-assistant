import { useState, useRef, useEffect, FC, FormEvent } from 'react';
import {
  Send,
  User,
  Bot,
  X,
  Maximize2,
  Minimize2,
  MessageSquare,
} from 'lucide-react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

interface AIChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  defaultOpen?: boolean;
}

const AIChatWidget: FC<AIChatWidgetProps> = ({
  className = '',
  position = 'bottom-right',
  title = 'CropGenius Assistant',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I received your message: "${inputValue}". This is a simulated response. In a real implementation, this would be connected to an AI service.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          'Sorry, there was an error processing your request. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className={`fixed ${positionClasses} bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50`}
        aria-label="Open chat"
        data-testid="chat-toggle-button"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses} w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col z-50 ${className}`}
      style={{
        height: isMinimized ? '60px' : '500px',
        maxHeight: 'calc(100vh - 2rem)',
      }}
      data-testid="ai-chat-widget"
    >
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleMinimize}
            className="text-white hover:text-green-100 focus:outline-none"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            data-testid="minimize-button"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={toggleChat}
            className="text-white hover:text-green-100 focus:outline-none"
            aria-label="Close chat"
            data-testid="close-button"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <Bot className="h-10 w-10 text-gray-300 mb-2" />
              <h4 className="font-medium text-gray-700">
                How can I help you today?
              </h4>
              <p className="text-sm mt-1">
                Ask me anything about farming, crops, or field management.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-xs sm:max-w-md md:max-w-lg rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-green-100 text-gray-800 rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0 mr-2">
                        <Bot className="h-5 w-5 text-green-500 mt-0.5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs text-gray-400 block mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {message.sender === 'user' && (
                      <div className="flex-shrink-0 ml-2">
                        <User className="h-5 w-5 text-green-500 mt-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      {/* Input */}
      {!isMinimized && (
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-3 bg-white"
        >
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`px-3 py-2 rounded-r-md ${
                inputValue.trim() && !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
              data-testid="send-button"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AIChatWidget;
