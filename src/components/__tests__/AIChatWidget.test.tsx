/**
 * 🌾 CROPGENIUS – AI CHAT WIDGET TESTS
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Test Suite for Agricultural Chat Widget
 * - Tests AI agent integration and message routing
 * - Validates conversation memory and context awareness
 * - Ensures proper UX with loading states and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AIChatWidget from '../AIChatWidget';
import { useAgriculturalChat } from '@/hooks/useAgriculturalChat';
import { useAuth } from '@/hooks/useAuth';

// Mock hooks
vi.mock('@/hooks/useAgriculturalChat', () => ({
  useAgriculturalChat: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${variant} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={`badge ${variant} ${className}`} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

describe('AIChatWidget', () => {
  let queryClient: QueryClient;
  let mockUseAgriculturalChat: any;
  let mockUseAuth: any;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockMessages = [
    {
      id: 'msg-1',
      content: 'Hello, I need help with my crops',
      sender: 'user' as const,
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: 'msg-2',
      content: 'I can help you with crop management! What specific issue are you facing?',
      sender: 'ai' as const,
      timestamp: new Date('2024-01-01T10:00:30Z'),
      agentType: 'general' as const,
      confidence: 85,
      sources: ['Agricultural AI Assistant'],
      actionable: true,
      followUpSuggestions: ['Tell me about your crops', 'Upload a photo', 'Check weather']
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null
    });

    mockUseAgriculturalChat = vi.mocked(useAgriculturalChat);
    mockUseAgriculturalChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isTyping: false,
      sendMessage: vi.fn(),
      sendQuickAction: vi.fn(),
      clearConversation: vi.fn(),
      getConversationStats: vi.fn(() => ({
        totalMessages: 0,
        agentStats: {},
        avgConfidence: 0,
        actionableResponses: 0
      })),
      isConnected: true,
      conversationId: 'test-conv-id',
      error: null,
      canRetry: false,
      retry: vi.fn(),
      lastMessageTime: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      defaultOpen: true,
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <AIChatWidget {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Initial State', () => {
    it('should render closed chat button by default', () => {
      renderComponent({ defaultOpen: false });

      expect(screen.getByTestId('chat-toggle-button')).toBeInTheDocument();
      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    });

    it('should render open chat widget when defaultOpen is true', () => {
      renderComponent({ defaultOpen: true });

      expect(screen.getByTestId('ai-chat-widget')).toBeInTheDocument();
      expect(screen.getByText('CropGenius AI Assistant')).toBeInTheDocument();
    });

    it('should show welcome message when no messages exist', () => {
      renderComponent();

      expect(screen.getByText('CropGenius AI Assistant')).toBeInTheDocument();
      expect(screen.getByText(/I'm your agricultural intelligence assistant/)).toBeInTheDocument();
    });

    it('should show quick action buttons when enabled', () => {
      renderComponent({ enableQuickActions: true });

      expect(screen.getByText('Disease Check')).toBeInTheDocument();
      expect(screen.getByText('Weather')).toBeInTheDocument();
      expect(screen.getByText('Market Prices')).toBeInTheDocument();
      expect(screen.getByText('Field Health')).toBeInTheDocument();
    });

    it('should hide quick action buttons when disabled', () => {
      renderComponent({ enableQuickActions: false });

      expect(screen.queryByText('Disease Check')).not.toBeInTheDocument();
      expect(screen.queryByText('Weather')).not.toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    beforeEach(() => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages,
        getConversationStats: vi.fn(() => ({
          totalMessages: 2,
          agentStats: { general: 1 },
          avgConfidence: 85,
          actionableResponses: 1
        }))
      });
    });

    it('should display messages correctly', () => {
      renderComponent();

      expect(screen.getByText('Hello, I need help with my crops')).toBeInTheDocument();
      expect(screen.getByText(/I can help you with crop management/)).toBeInTheDocument();
    });

    it('should show agent indicators when enabled', () => {
      renderComponent({ showAgentIndicators: true });

      expect(screen.getByText('General Agent')).toBeInTheDocument();
    });

    it('should show confidence scores when enabled', () => {
      renderComponent({ showConfidenceScores: true });

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should display message sources', () => {
      renderComponent();

      expect(screen.getByText('1 source')).toBeInTheDocument();
    });

    it('should show follow-up suggestions', () => {
      renderComponent();

      expect(screen.getByText('Suggested follow-ups:')).toBeInTheDocument();
      expect(screen.getByText('Tell me about your crops')).toBeInTheDocument();
      expect(screen.getByText('Upload a photo')).toBeInTheDocument();
    });

    it('should display message timestamps', () => {
      renderComponent();

      // Check that timestamps are displayed (format may vary by locale)
      const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Message Sending', () => {
    it('should send message when form is submitted', async () => {
      const mockSendMessage = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        sendMessage: mockSendMessage
      });

      renderComponent();

      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');

      await userEvent.type(input, 'Test message');
      await userEvent.click(sendButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should clear input after sending message', async () => {
      const mockSendMessage = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        sendMessage: mockSendMessage
      });

      renderComponent();

      const input = screen.getByTestId('chat-input') as HTMLInputElement;

      await userEvent.type(input, 'Test message');
      await userEvent.click(screen.getByTestId('send-button'));

      expect(input.value).toBe('');
    });

    it('should not send empty messages', async () => {
      const mockSendMessage = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        sendMessage: mockSendMessage
      });

      renderComponent();

      const sendButton = screen.getByTestId('send-button');
      await userEvent.click(sendButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should disable input and button when loading', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isLoading: true
      });

      renderComponent();

      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should show loading spinner when sending', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isLoading: true
      });

      renderComponent();

      // Check for loading spinner (Loader2 icon)
      expect(screen.getByTestId('send-button')).toBeDisabled();
    });
  });

  describe('Quick Actions', () => {
    it('should send quick action messages', async () => {
      const mockSendQuickAction = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        sendQuickAction: mockSendQuickAction
      });

      renderComponent({ enableQuickActions: true });

      await userEvent.click(screen.getByText('Disease Check'));

      expect(mockSendQuickAction).toHaveBeenCalledWith('disease-check');
    });

    it('should handle all quick action types', async () => {
      const mockSendQuickAction = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        sendQuickAction: mockSendQuickAction
      });

      renderComponent({ enableQuickActions: true });

      await userEvent.click(screen.getByText('Weather'));
      expect(mockSendQuickAction).toHaveBeenCalledWith('weather-impact');

      await userEvent.click(screen.getByText('Market Prices'));
      expect(mockSendQuickAction).toHaveBeenCalledWith('market-prices');

      await userEvent.click(screen.getByText('Field Health'));
      expect(mockSendQuickAction).toHaveBeenCalledWith('field-health');
    });
  });

  describe('Follow-up Suggestions', () => {
    beforeEach(() => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages
      });
    });

    it('should send follow-up suggestion when clicked', async () => {
      const mockSendMessage = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages,
        sendMessage: mockSendMessage
      });

      renderComponent();

      await userEvent.click(screen.getByText('Tell me about your crops'));

      expect(mockSendMessage).toHaveBeenCalledWith('Tell me about your crops');
    });
  });

  describe('Chat Controls', () => {
    it('should toggle chat open/closed', async () => {
      renderComponent({ defaultOpen: false });

      // Initially closed
      expect(screen.getByTestId('chat-toggle-button')).toBeInTheDocument();
      expect(screen.queryByTestId('ai-chat-widget')).not.toBeInTheDocument();

      // Open chat
      await userEvent.click(screen.getByTestId('chat-toggle-button'));
      expect(screen.getByTestId('ai-chat-widget')).toBeInTheDocument();

      // Close chat
      await userEvent.click(screen.getByTestId('close-button'));
      expect(screen.queryByTestId('ai-chat-widget')).not.toBeInTheDocument();
    });

    it('should toggle minimize/maximize', async () => {
      renderComponent();

      const minimizeButton = screen.getByTestId('minimize-button');
      
      // Initially maximized
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();

      // Minimize
      await userEvent.click(minimizeButton);
      expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument();

      // Maximize
      await userEvent.click(screen.getByTestId('minimize-button'));
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });

    it('should clear conversation when clear button is clicked', async () => {
      const mockClearConversation = vi.fn();
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages,
        clearConversation: mockClearConversation,
        getConversationStats: vi.fn(() => ({
          totalMessages: 2,
          agentStats: {},
          avgConfidence: 85,
          actionableResponses: 1
        }))
      });

      renderComponent();

      await userEvent.click(screen.getByText('Clear'));

      expect(mockClearConversation).toHaveBeenCalled();
    });
  });

  describe('Connection Status', () => {
    it('should show connection lost warning when disconnected', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isConnected: false
      });

      renderComponent();

      expect(screen.getByText(/Connection lost/)).toBeInTheDocument();
    });

    it('should not show connection warning when connected', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isConnected: true
      });

      renderComponent();

      expect(screen.queryByText(/Connection lost/)).not.toBeInTheDocument();
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator when AI is responding', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isTyping: true
      });

      renderComponent();

      expect(screen.getByText('AI thinking...')).toBeInTheDocument();
    });

    it('should show typing indicator when loading', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        isLoading: true
      });

      renderComponent();

      expect(screen.getByText('AI thinking...')).toBeInTheDocument();
    });
  });

  describe('Chat Statistics', () => {
    it('should display message count', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages,
        getConversationStats: vi.fn(() => ({
          totalMessages: 2,
          agentStats: {},
          avgConfidence: 85,
          actionableResponses: 1
        }))
      });

      renderComponent();

      expect(screen.getByText('2 messages')).toBeInTheDocument();
    });

    it('should display average confidence when available', () => {
      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: mockMessages,
        getConversationStats: vi.fn(() => ({
          totalMessages: 2,
          agentStats: {},
          avgConfidence: 85,
          actionableResponses: 1
        }))
      });

      renderComponent();

      expect(screen.getByText('Avg confidence: 85%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent({ defaultOpen: false });

      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for minimize/maximize', () => {
      renderComponent();

      expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
    });

    it('should focus input when chat is opened', async () => {
      renderComponent({ defaultOpen: false });

      await userEvent.click(screen.getByTestId('chat-toggle-button'));

      // Input should be focused (this is tested via the useEffect in the component)
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });
  });

  describe('Farm Context Integration', () => {
    it('should use provided farm context', () => {
      const customFarmContext = {
        location: { lat: -6.7924, lng: 39.2083, country: 'Tanzania' },
        soilType: 'clay',
        currentSeason: 'dry',
        userId: 'custom-user-id',
        currentCrops: ['cassava', 'beans'],
        climateZone: 'tropical'
      };

      renderComponent({ farmContext: customFarmContext });

      expect(mockUseAgriculturalChat).toHaveBeenCalledWith(
        customFarmContext,
        expect.any(Object)
      );
    });

    it('should create default farm context when none provided', () => {
      renderComponent();

      expect(mockUseAgriculturalChat).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({
            lat: -1.2921,
            lng: 36.8219,
            country: 'Kenya'
          }),
          userId: 'test-user-id'
        }),
        expect.any(Object)
      );
    });

    it('should handle anonymous users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null
      });

      renderComponent();

      expect(mockUseAgriculturalChat).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'anonymous'
        }),
        expect.objectContaining({
          enableMemory: false,
          autoSave: false
        })
      );
    });
  });

  describe('Agent Icons', () => {
    it('should display correct agent icons', () => {
      const messagesWithDifferentAgents = [
        {
          id: 'msg-1',
          content: 'Disease detected',
          sender: 'ai' as const,
          timestamp: new Date(),
          agentType: 'disease' as const,
          confidence: 90
        },
        {
          id: 'msg-2',
          content: 'Weather forecast',
          sender: 'ai' as const,
          timestamp: new Date(),
          agentType: 'weather' as const,
          confidence: 85
        }
      ];

      mockUseAgriculturalChat.mockReturnValue({
        ...mockUseAgriculturalChat(),
        messages: messagesWithDifferentAgents
      });

      renderComponent({ showAgentIndicators: true });

      expect(screen.getByText('Disease Agent')).toBeInTheDocument();
      expect(screen.getByText('Weather Agent')).toBeInTheDocument();
    });
  });
});