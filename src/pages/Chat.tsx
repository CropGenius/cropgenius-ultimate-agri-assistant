import { useState, useRef, useEffect } from 'react';
import { Send, LoaderCircle, Bot, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import GenieAgent, { ChatMessage } from '@/agents/GenieAgent';

interface UIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const genieAgent = useRef<GenieAgent | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the agent and set the welcome message
    const history: ChatMessage[] = [{
      role: 'model',
      parts: [{ text: "Hello! I'm Genie, your AI farming assistant. How can I help you optimize your farm today?" }]
    }];
    genieAgent.current = new GenieAgent(history);

    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: "Hello! I'm Genie, your AI farming assistant. How can I help you optimize your farm today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !genieAgent.current) return;

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const responseText = await genieAgent.current.sendMessage(inputMessage);
      const modelMessage: UIMessage = {
        id: Date.now().toString() + '-model',
        role: 'model',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // Re-initialize agent and UI messages
    const history: ChatMessage[] = [{
      role: 'model',
      parts: [{ text: "Hello! I'm Genie, your AI farming assistant. How can I help you optimize your farm today?" }]
    }];
    genieAgent.current = new GenieAgent(history);
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'model',
        content: "Hello! I'm Genie, your AI farming assistant. How can I help you optimize your farm today?",
        timestamp: new Date(),
      },
    ]);
    toast.success('Conversation cleared');
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex justify-center">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <Card className="flex flex-col flex-1 h-[calc(100vh-8rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Chat with Genie</CardTitle>
                    <CardDescription>Your AI-powered agricultural expert.</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleClearChat} title="Clear Conversation">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 max-w-[85%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 border">
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </Avatar>
                  <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border">
                    <Bot className="h-4 w-4" />
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Genie is thinking...</span>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t pt-4">
              <div className="flex items-center w-full gap-2">
                <Input
                  placeholder="Ask Genie about your farm..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
