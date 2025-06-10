import { useState, useEffect, useCallback } from 'react';
import { getTavusAPI } from '../lib/tavus';

interface UseTavusVideoMeetingOptions {
  interviewType: string;
  participantName: string;
  role: string;
  company?: string;
  autoStart?: boolean;
}

interface UseTavusVideoMeetingReturn {
  conversationUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
}

export const useTavusVideoMeeting = (options: UseTavusVideoMeetingOptions): UseTavusVideoMeetingReturn => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Start a new Tavus conversation
  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating Tavus conversation...');
      
      // For demo purposes, we'll use a stock demo persona
      // In production, you would use your own replica and persona IDs
      const tavusAPI = getTavusAPI();
      
      // Create conversation with green screen enabled
      const conversationRequest = {
        // Use the stock demo persona if available, or mock one
        persona_id: "p9a95912", // Stock demo persona
        properties: {
          // Apply greenscreen to the background for chroma key effect
          apply_greenscreen: true,
          max_call_duration: 3600, // 1 hour
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: true,
          enable_transcription: true,
          language: 'English'
        }
      };
      
      console.log('Sending conversation request to Tavus API');
      const response = await tavusAPI.createConversation(conversationRequest);
      
      console.log('Tavus conversation created:', response);
      setConversationId(response.conversation_id);
      setConversationUrl(response.conversation_url);
      setIsConnected(true);
      
    } catch (err) {
      console.error('Failed to create Tavus conversation:', err);
      
      // Create a mock conversation URL for development/testing
      console.log('Creating mock conversation URL for development');
      const mockUrl = `https://tavus.io/conversations/mock-conversation-${Date.now()}`;
      setConversationUrl(mockUrl);
      setConversationId(`mock-${Date.now()}`);
      setIsConnected(true);
      
      // Set error message but don't throw - we'll use the mock URL
      setError('Using demo mode - add your Tavus API key for real AI video');
    } finally {
      setIsLoading(false);
    }
  }, [options.role, options.company]);

  // End the current Tavus conversation
  const endConversation = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      console.log('Ending Tavus conversation:', conversationId);
      
      // Only try to end real conversations, not mock ones
      if (!conversationId.startsWith('mock-')) {
        const tavusAPI = getTavusAPI();
        await tavusAPI.endConversation(conversationId);
      }
      
      setConversationId(null);
      setConversationUrl(null);
      setIsConnected(false);
      
    } catch (err) {
      console.error('Failed to end Tavus conversation:', err);
      // Still reset state even if API call fails
      setConversationId(null);
      setConversationUrl(null);
      setIsConnected(false);
    }
  }, [conversationId]);

  // Auto-start if requested
  useEffect(() => {
    if (options.autoStart && !conversationUrl && !isLoading) {
      startConversation();
    }
  }, [options.autoStart, conversationUrl, isLoading, startConversation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (conversationId) {
        endConversation();
      }
    };
  }, [conversationId, endConversation]);

  return {
    conversationUrl,
    isLoading,
    error,
    isConnected,
    startConversation,
    endConversation
  };
};