import { useState, useEffect, useCallback } from 'react';
import { tavusService, TavusConversationConfig, TavusConnectionStatus } from '../services/TavusService';
import { getReplicaForInterviewType } from '../lib/tavus';

interface UseTavusVideoMeetingOptions {
  interviewType: string;
  participantName: string;
  role: string;
  company?: string;
  autoStart?: boolean;
}

interface UseTavusVideoMeetingReturn {
  conversationUrl: string | null;
  connectionStatus: TavusConnectionStatus;
  isLoading: boolean;
  error: string | null;
  startMeeting: () => Promise<void>;
  endMeeting: () => Promise<void>;
  checkPermissions: () => Promise<{ camera: boolean; microphone: boolean; error?: string }>;
  testConnection: () => Promise<TavusConnectionStatus['quality']>;
  getRecording: () => Promise<string | null>;
  getTranscript: () => Promise<string | null>;
}

export const useTavusVideoMeeting = (options: UseTavusVideoMeetingOptions): UseTavusVideoMeetingReturn => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<TavusConnectionStatus>({
    status: 'disconnected',
    quality: 'good'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to connection status updates
  useEffect(() => {
    const unsubscribe = tavusService.onStatusChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  // Check device permissions
  const checkPermissions = useCallback(async () => {
    try {
      return await tavusService.checkDevicePermissions();
    } catch (error) {
      console.error('Permission check failed:', error);
      return { 
        camera: false, 
        microphone: false, 
        error: 'Failed to check device permissions' 
      };
    }
  }, []);

  // Test connection quality
  const testConnection = useCallback(async () => {
    try {
      return await tavusService.testConnectionQuality();
    } catch (error) {
      console.error('Connection test failed:', error);
      return 'poor' as const;
    }
  }, []);

  // Start video meeting
  const startMeeting = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting Tavus video meeting...');

      // Check permissions first
      const permissions = await checkPermissions();
      if (!permissions.camera && !permissions.microphone) {
        throw new Error(permissions.error || 'Camera and microphone access required');
      }

      // Get replica and persona for interview type
      const { replicaId, personaId } = getReplicaForInterviewType(options.interviewType);
      
      if (!replicaId || !personaId) {
        throw new Error(`No AI interviewer available for ${options.interviewType} interviews`);
      }

      // Configure conversation
      const config: TavusConversationConfig = {
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name: `${options.role} Interview - ${options.participantName}`,
        participant: {
          name: options.participantName,
          role: 'candidate'
        },
        properties: {
          max_call_duration: 3600, // 1 hour
          participant_left_timeout: 30,
          participant_absent_timeout: 60,
          enable_recording: true,
          enable_transcription: true,
          language: 'en'
        }
      };

      // Initialize conversation
      const { joinLink } = await tavusService.initializeConversation(config);
      
      setConversationUrl(joinLink);
      console.log('Video meeting started successfully');

    } catch (error) {
      console.error('Failed to start video meeting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video meeting';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, checkPermissions]);

  // End video meeting
  const endMeeting = useCallback(async () => {
    try {
      console.log('Ending video meeting...');
      await tavusService.endConversation();
      setConversationUrl(null);
      setError(null);
      console.log('Video meeting ended successfully');
    } catch (error) {
      console.error('Failed to end video meeting:', error);
      // Don't throw error for ending meeting - just log it
    }
  }, []);

  // Get recording
  const getRecording = useCallback(async () => {
    try {
      return await tavusService.getRecording();
    } catch (error) {
      console.error('Failed to get recording:', error);
      return null;
    }
  }, []);

  // Get transcript
  const getTranscript = useCallback(async () => {
    try {
      return await tavusService.getTranscript();
    } catch (error) {
      console.error('Failed to get transcript:', error);
      return null;
    }
  }, []);

  // Auto-start if requested
  useEffect(() => {
    if (options.autoStart && !conversationUrl && !isLoading && !error) {
      startMeeting().catch(console.error);
    }
  }, [options.autoStart, conversationUrl, isLoading, error, startMeeting]);

  return {
    conversationUrl,
    connectionStatus,
    isLoading,
    error,
    startMeeting,
    endMeeting,
    checkPermissions,
    testConnection,
    getRecording,
    getTranscript
  };
};