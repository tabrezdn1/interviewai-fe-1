import { useState, useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';
import { getTavusAPI } from '../lib/tavus';
import { getReplicaForInterviewType } from '../lib/tavus';

interface UseDailyVideoCallOptions {
  interviewType: string;
  participantName: string;
  role: string;
  company?: string;
}

interface UseDailyVideoCallReturn {
  conversationUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  dailyCall: any;
}

export const useDailyVideoCall = (options: UseDailyVideoCallOptions): UseDailyVideoCallReturn => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the Daily React hook to get the call object
  const daily = useDaily();
  
  // Check if we're connected by looking at the call state with proper type checking
  const isConnected = daily && typeof daily.callState === 'function' && daily.callState() === 'joined';

  const startCall = useCallback(async () => {
    if (!daily) {
      setError('Video calling not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting video call for interview...');

      // Get replica and persona for interview type
      const { replicaId, personaId } = getReplicaForInterviewType(options.interviewType);
      
      if (!replicaId || !personaId) {
        throw new Error(`No AI interviewer available for ${options.interviewType} interviews`);
      }

      // For demo purposes, create a mock conversation URL
      // In a real implementation, this would come from your video API
      const mockUrl = `https://demo-interview.daily.co/${options.interviewType}-${Date.now()}`;
      console.log('Created mock video call URL:', mockUrl);

      // Join the Daily call using the conversation URL
      await daily.join({ 
        url: mockUrl,
        userName: options.participantName
      });

      setConversationUrl(mockUrl);
      console.log('Successfully joined Daily call');

    } catch (error) {
      console.error('Failed to start video call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video call';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [daily, options]);

  const endCall = useCallback(async () => {
    if (!daily) return;

    try {
      console.log('Ending Daily call...');
      await daily.leave();
      
      // End Tavus conversation if we have the conversation URL
      if (conversationUrl) {
        try {
          const tavusAPI = getTavusAPI();
          // Extract conversation ID from URL if needed
          const conversationId = conversationUrl.split('/').pop();
          if (conversationId) {
            await tavusAPI.endConversation(conversationId);
          }
        } catch (error) {
          console.warn('Failed to end Tavus conversation:', error);
        }
      }
      
      setConversationUrl(null);
      setError(null);
      console.log('Video call ended successfully');
    } catch (error) {
      console.error('Failed to end video call:', error);
    }
  }, [daily, conversationUrl]);

  return {
    conversationUrl,
    isLoading,
    error,
    isConnected,
    startCall,
    endCall,
    dailyCall: daily
  };
};