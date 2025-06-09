import { useState, useEffect, useCallback } from 'react';
import { getTavusAPI, TavusConversationResponse, TavusReplicaResponse } from '../lib/tavus';

interface UseTavusInterviewOptions {
  interviewType?: string;
  role?: string;
  difficulty?: string;
  autoStart?: boolean;
}

interface UseTavusInterviewReturn {
  conversation: TavusConversationResponse | null;
  replicas: TavusReplicaResponse[];
  isLoading: boolean;
  error: string | null;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  isConversationActive: boolean;
}

export const useTavusInterview = (options: UseTavusInterviewOptions = {}): UseTavusInterviewReturn => {
  const [conversation, setConversation] = useState<TavusConversationResponse | null>(null);
  const [replicas, setReplicas] = useState<TavusReplicaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConversationActive, setIsConversationActive] = useState(false);

  // Load available replicas on mount
  useEffect(() => {
    const loadReplicas = async () => {
      // Check if Tavus API key is configured
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (!apiKey || apiKey === 'your_tavus_api_key_here') {
        console.warn('Tavus API key not configured. Using mock AI interviewer.');
        // Create a mock replica for development
        setReplicas([{
          replica_id: 'mock-replica-123',
          replica_name: 'AI Interviewer',
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }]);
        return;
      }

      try {
        setIsLoading(true);
        const tavusAPI = getTavusAPI();
        const replicaList = await tavusAPI.getReplicas();
        setReplicas(replicaList);
        
        if (replicaList.length === 0) {
          setError('No AI interviewers available. Please contact support.');
        }
      } catch (err) {
        console.error('Failed to load Tavus replicas:', err);
        setError(err instanceof Error ? err.message : 'Failed to load AI interviewers');
        
        // Fallback to mock replica if API fails
        setReplicas([{
          replica_id: 'mock-replica-123',
          replica_name: 'AI Interviewer (Demo)',
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReplicas();
  }, []);

  // Select appropriate replica based on interview options
  const selectReplica = useCallback((): string | null => {
    if (replicas.length === 0) return null;

    // For now, select the first available replica
    // In the future, you could implement logic to select based on:
    // - Interview type (technical vs behavioral)
    // - Role (engineering vs product management)
    // - Difficulty level
    const availableReplicas = replicas.filter(r => r.status === 'ready');
    return availableReplicas.length > 0 ? availableReplicas[0].replica_id : null;
  }, [replicas]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const replicaId = selectReplica();
      if (!replicaId) {
        throw new Error('No AI interviewer available. Please try again later.');
      }

      // Check if this is a mock replica
      if (replicaId === 'mock-replica-123') {
        // Create a mock conversation for development
        const mockConversation: TavusConversationResponse = {
          conversation_id: 'mock-conversation-123',
          conversation_url: 'https://tavus.io/conversations/mock-conversation-123',
          status: 'active',
          created_at: new Date().toISOString()
        };
        
        setConversation(mockConversation);
        setIsConversationActive(true);
        return;
      }

      const tavusAPI = getTavusAPI();
      
      // Create conversation with interview-specific settings
      const conversationRequest = {
        replica_id: replicaId,
        conversation_name: `Interview - ${options.role || 'General'} - ${new Date().toISOString()}`,
        properties: {
          max_call_duration: 3600, // 1 hour max
          participant_left_timeout: 30,
          participant_absent_timeout: 60,
          enable_recording: true,
          enable_transcription: true,
          language: 'en',
        },
      };

      const newConversation = await tavusAPI.createConversation(conversationRequest);
      setConversation(newConversation);
      setIsConversationActive(true);
    } catch (err) {
      console.error('Failed to start Tavus conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  }, [selectReplica, options.role]);

  const endConversation = useCallback(async () => {
    if (!conversation) return;

    setIsLoading(true);
    try {
      // Check if this is a mock conversation
      if (conversation.conversation_id === 'mock-conversation-123') {
        setConversation(null);
        setIsConversationActive(false);
        return;
      }

      const tavusAPI = getTavusAPI();
      await tavusAPI.endConversation(conversation.conversation_id);
      setConversation(null);
      setIsConversationActive(false);
    } catch (err) {
      console.error('Failed to end Tavus conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to end interview');
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  // Auto-start conversation if requested
  useEffect(() => {
    if (options.autoStart && replicas.length > 0 && !conversation && !isLoading) {
      startConversation();
    }
  }, [options.autoStart, replicas.length, conversation, isLoading, startConversation]);

  return {
    conversation,
    replicas,
    isLoading,
    error,
    startConversation,
    endConversation,
    isConversationActive,
  };
};