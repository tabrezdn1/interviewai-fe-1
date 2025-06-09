import { useState, useEffect, useCallback } from 'react';
import { 
  getTavusAPI, 
  TavusConversationResponse, 
  TavusReplicaResponse, 
  InterviewRound,
  isTavusConfigured,
  getInterviewRounds,
  getReplicaForInterviewType
} from '../lib/tavus';

interface UseTavusInterviewOptions {
  interviewType?: string;
  role?: string;
  difficulty?: string;
  interviewRound?: string; // 'screening', 'technical', 'behavioral', or 'complete'
  autoStart?: boolean;
}

interface UseTavusInterviewReturn {
  conversation: TavusConversationResponse | null;
  currentRound: InterviewRound | null;
  availableRounds: InterviewRound[];
  replicas: TavusReplicaResponse[];
  isLoading: boolean;
  error: string | null;
  startConversation: (roundId?: string) => Promise<void>;
  endConversation: () => Promise<void>;
  switchToNextRound: () => Promise<void>;
  isConversationActive: boolean;
  isMockMode: boolean;
  completedRounds: string[];
}

export const useTavusInterview = (options: UseTavusInterviewOptions = {}): UseTavusInterviewReturn => {
  const [conversation, setConversation] = useState<TavusConversationResponse | null>(null);
  const [currentRound, setCurrentRound] = useState<InterviewRound | null>(null);
  const [availableRounds, setAvailableRounds] = useState<InterviewRound[]>([]);
  const [replicas, setReplicas] = useState<TavusReplicaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<string[]>([]);

  // Load available rounds and replicas on mount
  useEffect(() => {
    const loadInterviewData = async () => {
      // Load available interview rounds
      const rounds = getInterviewRounds();
      setAvailableRounds(rounds);

      if (!isTavusConfigured()) {
        console.warn('Tavus API key not configured. Using mock AI interviewer.');
        setIsMockMode(true);
        
        // Create mock replicas for each round
        const mockReplicas = rounds.map(round => ({
          replica_id: `mock-${round.id}-replica`,
          replica_name: `${round.name} (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }));
        
        setReplicas(mockReplicas);
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
        
        setIsMockMode(true);
        // Fallback to mock replicas if API fails
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

    loadInterviewData();
  }, []);

  // Select appropriate replica for a specific round
  const selectReplicaForRound = useCallback((roundId?: string): { replicaId: string | null; round: InterviewRound | null } => {
    if (!Array.isArray(availableRounds) || availableRounds.length === 0) {
      console.warn('No available rounds configured');
      return null;
    }

    let targetRound: InterviewRound | null = null;

    if (roundId) {
      // Use specific round if provided
      targetRound = availableRounds.find(r => r.id === roundId) || null;
    } else if (options.interviewType) {
      // Map interview type to round
      const typeToRoundMap: Record<string, string> = {
        'screening': 'screening',
        'technical': 'technical', 
        'behavioral': 'behavioral',
        'mixed': 'technical' // Default to technical for mixed
      };
      
      const mappedRoundId = typeToRoundMap[options.interviewType];
      targetRound = availableRounds.find(r => r.id === mappedRoundId) || null;
    }

    // If no specific round found, use first available
    if (!targetRound && availableRounds.length > 0) {
      targetRound = availableRounds[0];
    }

    if (!targetRound) {
      return { replicaId: null, round: null };
    }

    // Check if replica is available
    if (isMockMode) {
      return { 
        replicaId: `mock-${targetRound.id}-replica`, 
        round: targetRound 
      };
    }

    const availableReplica = replicas.find(r => 
      r.replica_id === targetRound.replicaId && r.status === 'ready'
    );

    if (availableReplica) {
      return { 
        replicaId: availableReplica.replica_id, 
        round: targetRound 
      };
    }

    return { replicaId: null, round: null };
  }, [availableRounds, replicas, isMockMode, options.interviewType]);

  const startConversation = useCallback(async (roundId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { replicaId, round } = selectReplicaForRound(roundId);
      
      if (!replicaId || !round) {
        throw new Error(`No AI interviewer available for ${roundId || 'this interview type'}. Please try again later.`);
      }

      setCurrentRound(round);

      // Check if this is a mock replica
      if (replicaId.startsWith('mock-')) {
        // Create a mock conversation for development
        const mockConversation: TavusConversationResponse = {
          conversation_id: `mock-conversation-${round.id}-${Date.now()}`,
          conversation_url: `https://tavus.io/conversations/mock-conversation-${round.id}`,
          status: 'active',
          created_at: new Date().toISOString(),
          round: round.id
        };
        
        setConversation(mockConversation);
        setIsConversationActive(true);
        return;
      }

      const tavusAPI = getTavusAPI();
      
      // Create conversation with round-specific settings
      const conversationRequest = {
        replica_id: replicaId,
        conversation_name: `${round.name} - ${options.role || 'General'} - ${new Date().toISOString()}`,
        callback_url: `${window.location.origin}/api/tavus/callback`,
        properties: {
          max_call_duration: round.duration * 60, // Convert minutes to seconds
          participant_left_timeout: 30,
          participant_absent_timeout: 60,
          enable_recording: true,
          enable_transcription: true,
          language: 'en',
        },
      };

      const newConversation = await tavusAPI.createConversation(conversationRequest, round.id);
      setConversation(newConversation);
      setIsConversationActive(true);
    } catch (err) {
      console.error('Failed to start Tavus conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  }, [selectReplicaForRound, options.role]);

  const endConversation = useCallback(async () => {
    if (!conversation) return;

    setIsLoading(true);
    try {
      // Mark current round as completed
      if (currentRound) {
        setCompletedRounds(prev => [...prev, currentRound.id]);
      }

      // Check if this is a mock conversation
      if (conversation.conversation_id.startsWith('mock-conversation-')) {
        setConversation(null);
        setCurrentRound(null);
        setIsConversationActive(false);
        return;
      }

      const tavusAPI = getTavusAPI();
      await tavusAPI.endConversation(conversation.conversation_id);
      setConversation(null);
      setCurrentRound(null);
      setIsConversationActive(false);
    } catch (err) {
      console.error('Failed to end Tavus conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to end interview');
    } finally {
      setIsLoading(false);
    }
  }, [conversation, currentRound]);

  const switchToNextRound = useCallback(async () => {
    if (!currentRound) return;

    // End current conversation
    await endConversation();

    // Find next round
    const currentIndex = availableRounds.findIndex(r => r.id === currentRound.id);
    const nextRound = availableRounds[currentIndex + 1];

    if (nextRound) {
      // Start next round after a brief delay
      setTimeout(() => {
        startConversation(nextRound.id);
      }, 2000);
    }
  }, [currentRound, availableRounds, endConversation, startConversation]);

  // Auto-start conversation if requested
  useEffect(() => {
    if (options.autoStart && availableRounds.length > 0 && !conversation && !isLoading) {
      startConversation();
    }
  }, [options.autoStart, availableRounds.length, conversation, isLoading, startConversation]);

  return {
    conversation,
    currentRound,
    availableRounds,
    replicas,
    isLoading,
    error,
    startConversation,
    endConversation,
    switchToNextRound,
    isConversationActive,
    isMockMode,
    completedRounds,
  };
};