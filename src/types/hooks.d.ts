/// <reference types="react" />

import { ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface UseGeminiProps {
  onMessageSent: (message: string) => void;
}

export interface UseChatHistoryProps {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
}

export interface UsePlantNetProps {
  onDetectionComplete: (result: any) => void;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
