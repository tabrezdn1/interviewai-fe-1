import { useState, useEffect, useCallback } from 'react';
import { DailyCall } from '@daily-co/daily-js';
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
  dailyCall: DailyCall | null;
}

export const useDailyVideoCall = (options: UseDailyVideoCallOptions): UseDailyVideoCallReturn => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dailyCall, setDailyCall] = useState<DailyCall | null>(null);

  // Initialize Daily call instance
  useEffect(() => {
    const initializeDaily = async () => {
      try {
        const { DailyIframe } = await import('@daily-co/daily-js');
        const call = DailyIframe.createCallObject();
        setDailyCall(call);

        // Set up event listeners
        call.on('joined-meeting', () => {
          console.log('Joined Daily meeting');
          setIsConnected(true);
        });

        call.on('left-meeting', () => {
          console.log('Left Daily meeting');
          setIsConnected(false);
        });

        call.on('error', (error) => {
          console.error('Daily call error:', error);
          setError(error.errorMsg || 'Video call error occurred');
        });

        return () => {
          call.destroy();
        };
      } catch (error) {
        console.error('Failed to initialize Daily:', error);
        setError('Failed to initialize video calling');
      }
    };

    initializeDaily();
  }, []);

  const startCall = useCallback(async () => {
    if (!dailyCall) {
      setError('Video calling not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting Tavus conversation for Daily call...');

      // Get replica and persona for interview type
      const { replicaId, personaId } = getReplicaForInterviewType(options.interviewType);
      
      if (!replicaId || !personaId) {
        throw new Error(`No AI interviewer available for ${options.interviewType} interviews`);
      }

      // Create Tavus conversation
      const tavusAPI = getTavusAPI();
      const conversationRequest = {
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name: `${options.role} Interview - ${options.participantName}`,
        callback_url: `${window.location.origin}/api/tavus/callback`,
        properties: {
          max_call_duration: 3600, // 1 hour
          participant_left_timeout: 30,
          participant_absent_timeout: 60,
          enable_recording: true,
          enable_transcription: true,
          language: 'English',
          apply_greenscreen: true, // Enable green screen for chroma key
        },
      };

      const conversation = await tavusAPI.createConversation(conversationRequest);
      console.log('Tavus conversation created:', conversation);

      // Join the Daily call using the conversation URL
      await dailyCall.join({ 
        url: conversation.conversation_url,
        userName: options.participantName
      });

      setConversationUrl(conversation.conversation_url);
      console.log('Successfully joined Daily call');

    } catch (error) {
      console.error('Failed to start video call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video call';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dailyCall, options]);

  const endCall = useCallback(async () => {
    if (!dailyCall) return;

    try {
      console.log('Ending Daily call...');
      await dailyCall.leave();
      
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
  }, [dailyCall, conversationUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dailyCall) {
        dailyCall.destroy();
      }
    };
  }, [dailyCall]);

  return {
    conversationUrl,
    isLoading,
    error,
    isConnected,
    startCall,
    endCall,
    dailyCall,
  };
};