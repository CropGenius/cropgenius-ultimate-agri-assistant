/**
 * 🌾 CROPGENIUS – AGRICULTURAL CHAT HOOK
 * -------------------------------------------------------------
 * PRODUCTION-READY Chat Management for Agricultural AI Conversations
 * - Real-time conversation state management with React Query
 * - Message sending and receiving with AI agent routing
 * - Conversation persistence to Supabase database
 * - Real-time message synchronization and updates
 * - Comprehensive error handling and retry logic
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { agentService, AgentResponse, AgentType } from '@/services/ai/AgentService';
import { useFarmContext, FarmContext } from '@/hooks/useFarmContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    agentType?: AgentType;
    confidence?: number;
    processingTime?: number;
    imageBase64?: string;
    suggestions?: string[];
    reasoning?: string;
  };
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  farmId?: string;
  title?: string;
  context: FarmContext;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageOptions {
  imageBase64?: string;
  agentType?: AgentType;
  metadata?: Record<string, any>;
}

export interface UseAgriculturalChatOptions {
  conversationId?: string;
  farmId?: string;
  autoCreateConversation?: boolean;
  enableRealTimeUpdates?: boolean;
  maxMessages?: number;
}

export interface AgriculturalChatResult {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: Error | null;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  sendQuickAction: (action: string, context?: any) => Promise<void>;
  createConversation: (title?: string) => Promise<string>;
  deleteConversation: () => Promise<void>;
  clearMessages: () => Promise<void>;
  refreshConversation: () => Promise<void>;
  retryLastMessage: () => Promise<void>;
}

/**
 * PRODUCTION-READY Hook for managing agricultural AI conversations
 */
export const useAgriculturalChat = (
  options: UseAgriculturalChatOptions = {}
): AgriculturalChatResult => {
  const { user } = useAuth();
  const { context: farmContext } = useFarmContext({ farmId: options.farmId });
  const queryClient = useQueryClient();
  
  const {
    conversationId: initialConversationId,
    farmId,
    autoCreateConversation = true,
    enableRealTimeUpdates = true,
    maxMessages = 100
  } = options;

  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [lastFailedMessage, setLastFailedMessage] = useState<{ content: string; options?: SendMessageOptions } | null>(null);

  // Query for conversation data
  const conversationQuery = useQuery({
    queryKey: ['chat-conversation', conversationId],
    queryFn: async (): Promise<ChatConversation | null> => {
      if (!conversationId || !user?.id) return null;

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to fetch conversation: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        farmId: data.farm_id,
        title: data.title,
        context: data.context || farmContext || {} as FarmContext,
        messages: [], // Messages loaded separately
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for messages
  const messagesQuery = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(maxMessages);

      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      return data.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        metadata: {
          agentType: msg.agent_type as AgentType,
          confidence: msg.confidence_score,
          ...msg.metadata
        },
        createdAt: msg.created_at
      }));
    },
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId || !enableRealTimeUpdates) return;

    const subscription = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['chat-conversation', conversationId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, enableRealTimeUpdates, queryClient]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (title?: string): Promise<string> => {
      if (!user?.id || !farmContext) {
        throw new Error('User authentication and farm context required');
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          farm_id: farmId || farmContext.farmId,
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          context: farmContext
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create conversation: ${error.message}`);
      }

      return data.id;
    },
    onSuccess: (newConversationId) => {
      setConversationId(newConversationId);
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', newConversationId] });
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation', {
        description: 'Unable to start a new chat. Please try again.',
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, options = {} }: { content: string; options?: SendMessageOptions }) => {
      if (!conversationId || !user?.id || !farmContext) {
        throw new Error('Conversation, user authentication, and farm context required');
      }

      // Store user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content,
          metadata: options.metadata || {}
        })
        .select()
        .single();

      if (userMessageError) {
        throw new Error(`Failed to save user message: ${userMessageError.message}`);
      }

      // Get AI response
      const aiResponse = await agentService.routeMessage(
        content,
        farmContext,
        options.imageBase64
      );

      // Store AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse.content,
          agent_type: aiResponse.agentType,
          confidence_score: aiResponse.confidence,
          metadata: {
            processingTime: aiResponse.metadata.processingTime,
            dataQuality: aiResponse.metadata.dataQuality,
            sources: aiResponse.metadata.sources,
            reasoning: aiResponse.metadata.reasoning,
            suggestions: aiResponse.metadata.suggestions
          }
        })
        .select()
        .single();

      if (aiMessageError) {
        throw new Error(`Failed to save AI message: ${aiMessageError.message}`);
      }

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { userMessage, aiMessage, aiResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', conversationId] });
      setLastFailedMessage(null);
    },
    onError: (error, variables) => {
      console.error('Failed to send message:', error);
      setLastFailedMessage({ content: variables.content, options: variables.options });
      toast.error('Failed to send message', {
        description: 'Your message could not be sent. You can retry or try again later.',
        action: {
          label: 'Retry',
          onClick: () => retryLastMessage()
        }
      });
    }
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId || !user?.id) {
        throw new Error('Conversation ID and user authentication required');
      }

      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
    },
    onSuccess: () => {
      setConversationId(undefined);
      queryClient.removeQueries({ queryKey: ['chat-conversation', conversationId] });
      queryClient.removeQueries({ queryKey: ['chat-messages', conversationId] });
      toast.success('Conversation deleted');
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  });

  // Clear messages mutation
  const clearMessagesMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId || !user?.id) {
        throw new Error('Conversation ID and user authentication required');
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) {
        throw new Error(`Failed to clear messages: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
      toast.success('Messages cleared');
    },
    onError: (error) => {
      console.error('Failed to clear messages:', error);
      toast.error('Failed to clear messages');
    }
  });

  // Auto-create conversation if needed
  useEffect(() => {
    if (autoCreateConversation && !conversationId && user?.id && farmContext && !createConversationMutation.isPending) {
      createConversationMutation.mutate();
    }
  }, [autoCreateConversation, conversationId, user?.id, farmContext, createConversationMutation]);

  // Callback functions
  const sendMessage = useCallback(async (content: string, options?: SendMessageOptions) => {
    if (!content.trim()) return;
    
    await sendMessageMutation.mutateAsync({ content: content.trim(), options });
  }, [sendMessageMutation]);

  const sendQuickAction = useCallback(async (action: string, context?: any) => {
    const quickActionMessages = {
      weather: "What's the weather forecast for my farm?",
      disease: "Help me identify potential crop diseases",
      market: "What are the current market prices for my crops?",
      recommendations: "What crops should I plant next?",
      irrigation: "How should I manage irrigation for my crops?",
      fertilizer: "What fertilizer recommendations do you have?"
    };

    const message = quickActionMessages[action as keyof typeof quickActionMessages] || action;
    await sendMessage(message, { metadata: { quickAction: action, context } });
  }, [sendMessage]);

  const createConversation = useCallback(async (title?: string): Promise<string> => {
    const newId = await createConversationMutation.mutateAsync(title);
    return newId;
  }, [createConversationMutation]);

  const deleteConversation = useCallback(async () => {
    await deleteConversationMutation.mutateAsync();
  }, [deleteConversationMutation]);

  const clearMessages = useCallback(async () => {
    await clearMessagesMutation.mutateAsync();
  }, [clearMessagesMutation]);

  const refreshConversation = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', conversationId] }),
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] })
    ]);
  }, [conversationId, queryClient]);

  const retryLastMessage = useCallback(async () => {
    if (lastFailedMessage) {
      await sendMessage(lastFailedMessage.content, lastFailedMessage.options);
    }
  }, [lastFailedMessage, sendMessage]);

  return {
    conversation: conversationQuery.data || null,
    messages: messagesQuery.data || [],
    isLoading: conversationQuery.isLoading || createConversationMutation.isPending,
    isLoadingMessages: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    error: conversationQuery.error || messagesQuery.error || sendMessageMutation.error || null,
    sendMessage,
    sendQuickAction,
    createConversation,
    deleteConversation,
    clearMessages,
    refreshConversation,
    retryLastMessage,
  };
};

/**
 * Hook for managing multiple conversations
 */
export const useConversationList = (farmId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-conversations-list', user?.id, farmId],
    queryFn: async (): Promise<ChatConversation[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (farmId) {
        query = query.eq('farm_id', farmId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      return data.map(conv => ({
        id: conv.id,
        userId: conv.user_id,
        farmId: conv.farm_id,
        title: conv.title,
        context: conv.context,
        messages: [], // Messages loaded separately when needed
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      }));
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};