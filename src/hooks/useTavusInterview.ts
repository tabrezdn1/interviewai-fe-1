import { useState, useEffect, useCallback } from 'react';
import { 
  getTavusAPI, 
  TavusConversationResponse, 
  TavusReplicaResponse, 
  InterviewRound,
  isTavusConfigured,
  getInterviewRounds,
  getReplicaForInterviewType,
  debugTavusConfig
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
      console.log('Loading Tavus interview data...');
      
      // Debug configuration
      debugTavusConfig();
      
      // Load available interview rounds
      const rounds = getInterviewRounds();
      setAvailableRounds(rounds);
      console.log('Available rounds:', rounds);

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
        console.log('Fetching Tavus replicas...');
        
        const replicaList = await tavusAPI.getReplicas();
        console.log('Fetched replicas:', replicaList);
        
        // Ensure replicaList is always an array to prevent "find is not a function" errors
        const safeReplicaList = Array.isArray(replicaList) ? replicaList : [];
        setReplicas(safeReplicaList);
        
        if (safeReplicaList.length === 0) {
          console.warn('No replicas found, switching to mock mode');
          setIsMockMode(true);
          setError('No AI interviewers available. Using demo mode.');
        }
      } catch (err) {
        console.error('Failed to load Tavus replicas:', err);
        setError(err instanceof Error ? err.message : 'Failed to load AI interviewers');
        
        setIsMockMode(true);
        console.log('Switching to mock mode due to API error');
        
        // Fallback to mock replicas if API fails
        const mockReplicas = rounds.map(round => ({
          replica_id: `mock-${round.id}-replica`,
          replica_name: `${round.name} (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }));
        
        setReplicas(mockReplicas);
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
      return { replicaId: null, round: null };
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

    console.log('Selected round:', targetRound);

    // Check if replica is available - ensure replicas is always an array
    const safeReplicas = Array.isArray(replicas) ? replicas : [];
    
    if (isMockMode) {
      return { 
        replicaId: `mock-${targetRound.id}-replica`, 
        round: targetRound 
      };
    }

    const availableReplica = safeReplicas.find(r => 
      r.replica_id === targetRound.replicaId && r.status === 'ready'
    );

    if (availableReplica) {
      console.log('Found matching replica:', availableReplica);
      return { 
        replicaId: availableReplica.replica_id, 
        round: targetRound 
      };
    }

    console.warn('No matching replica found for round:', targetRound);
    return { replicaId: null, round: null };
  }, [availableRounds, replicas, isMockMode, options.interviewType]);

  const startConversation = useCallback(async (roundId?: string) => {
    console.log('Starting Tavus conversation...', { roundId, isMockMode });
    setIsLoading(true);
    setError(null);

    try {
      const { replicaId, round } = selectReplicaForRound(roundId);
      
      if (!replicaId || !round) {
        throw new Error(`No AI interviewer available for ${roundId || 'this interview type'}. Please check your Tavus configuration.`);
      }

      console.log('Selected replica and round:', { replicaId, round });
      setCurrentRound(round);

      // Check if this is a mock replica
      if (replicaId.startsWith('mock-')) {
        console.log('Creating mock conversation');
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
        console.log('Mock conversation created:', mockConversation);
        return;
      }

      console.log('Creating real Tavus conversation...');
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

      console.log('Sending conversation request:', conversationRequest);
      const newConversation = await tavusAPI.createConversation(conversationRequest, round.id);
      console.log('Conversation created successfully:', newConversation);
      
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

    console.log('Ending Tavus conversation:', conversation.conversation_id);
    setIsLoading(true);
    
    try {
      // Mark current round as completed
      if (currentRound) {
        setCompletedRounds(prev => [...prev, currentRound.id]);
      }

      // Check if this is a mock conversation
      if (conversation.conversation_id.startsWith('mock-conversation-')) {
        console.log('Ending mock conversation');
        setConversation(null);
        setCurrentRound(null);
        setIsConversationActive(false);
        return;
      }

      const tavusAPI = getTavusAPI();
      await tavusAPI.endConversation(conversation.conversation_id);
      console.log('Conversation ended successfully');
      
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

    console.log('Switching to next round from:', currentRound.id);
    
    // End current conversation
    await endConversation();

    // Find next round
    const currentIndex = availableRounds.findIndex(r => r.id === currentRound.id);
    const nextRound = availableRounds[currentIndex + 1];

    if (nextRound) {
      console.log('Starting next round:', nextRound.id);
      // Start next round after a brief delay
      setTimeout(() => {
        startConversation(nextRound.id);
      }, 2000);
    } else {
      console.log('No more rounds available');
    }
  }, [currentRound, availableRounds, endConversation, startConversation]);

  // Auto-start conversation if requested
  useEffect(() => {
    if (options.autoStart && availableRounds.length > 0 && !conversation && !isLoading) {
      console.log('Auto-starting conversation');
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