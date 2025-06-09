import { useState, useEffect, useCallback } from 'react';
import { 
  getTavusAPI, 
  TavusConversationResponse, 
  TavusReplicaResponse, 
  TavusPersonaResponse,
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
  personas: TavusPersonaResponse[];
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
  const [personas, setPersonas] = useState<TavusPersonaResponse[]>([]);
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

      const isConfigured = isTavusConfigured();
      console.log('Tavus configuration status:', isConfigured);
      
      if (!isConfigured) {
        console.warn('Tavus API key not configured or missing replica/persona IDs. Using mock AI interviewer.');
        setIsMockMode(true);
        
        // Create mock replicas and personas for each round
        const mockReplicas: TavusReplicaResponse[] = rounds.map(round => ({
          replica_id: `mock-${round.id}-replica`,
          replica_name: `${round.name} (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }));
        
        const mockPersonas: TavusPersonaResponse[] = rounds.map(round => ({
          persona_id: `mock-${round.id}-persona`,
          persona_name: `${round.name} Persona (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setReplicas(mockReplicas);
        setPersonas(mockPersonas);
        return;
      }

      console.log('Tavus is properly configured, attempting to fetch real data...');
      try {
        setIsLoading(true);
        const tavusAPI = getTavusAPI();
        console.log('Fetching Tavus replicas and personas...');
        
        // Fetch both replicas and personas
        const [replicaResponse, personaResponse] = await Promise.all([
          tavusAPI.getReplicas(),
          tavusAPI.getPersonas()
        ]);
        
        console.log('Raw replica response:', replicaResponse);
        console.log('Raw persona response:', personaResponse);
        
        // Handle different possible response formats for replicas
        let replicaList: TavusReplicaResponse[] = [];
        if (Array.isArray(replicaResponse)) {
          replicaList = replicaResponse;
        } else if (replicaResponse && typeof replicaResponse === 'object') {
          if (Array.isArray(replicaResponse.data)) {
            replicaList = replicaResponse.data;
          } else if (Array.isArray(replicaResponse.replicas)) {
            replicaList = replicaResponse.replicas;
          } else {
            console.warn('Unexpected replica response format:', replicaResponse);
            replicaList = [];
          }
        }
        
        // Handle different possible response formats for personas
        let personaList: TavusPersonaResponse[] = [];
        if (Array.isArray(personaResponse)) {
          personaList = personaResponse;
        } else if (personaResponse && typeof personaResponse === 'object') {
          if (Array.isArray(personaResponse.data)) {
            personaList = personaResponse.data;
          } else if (Array.isArray(personaResponse.personas)) {
            personaList = personaResponse.personas;
          } else {
            console.warn('Unexpected persona response format:', personaResponse);
            personaList = [];
          }
        }
        
        console.log('Processed replica list:', replicaList);
        console.log('Processed persona list:', personaList);
        
        setReplicas(replicaList);
        setPersonas(personaList);
        
        if (replicaList.length === 0 || personaList.length === 0) {
          console.warn('Missing replicas or personas, switching to mock mode');
          setIsMockMode(true);
          setError('Missing AI interviewers or personas. Using demo mode.');
          
          // Create mock data as fallback
          const mockReplicas: TavusReplicaResponse[] = rounds.map(round => ({
            replica_id: `mock-${round.id}-replica`,
            replica_name: `${round.name} (Demo Mode)`,
            status: 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            visibility: 'private'
          }));
          
          const mockPersonas: TavusPersonaResponse[] = rounds.map(round => ({
            persona_id: `mock-${round.id}-persona`,
            persona_name: `${round.name} Persona (Demo Mode)`,
            status: 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          setReplicas(mockReplicas);
          setPersonas(mockPersonas);
        }
      } catch (err) {
        console.error('Failed to load Tavus replicas/personas:', err);
        setError(err instanceof Error ? err.message : 'Failed to load AI interviewers');
        
        setIsMockMode(true);
        console.log('Switching to mock mode due to API error');
        
        // Fallback to mock data if API fails
        const mockReplicas: TavusReplicaResponse[] = rounds.map(round => ({
          replica_id: `mock-${round.id}-replica`,
          replica_name: `${round.name} (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'private'
        }));
        
        const mockPersonas: TavusPersonaResponse[] = rounds.map(round => ({
          persona_id: `mock-${round.id}-persona`,
          persona_name: `${round.name} Persona (Demo Mode)`,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setReplicas(mockReplicas);
        setPersonas(mockPersonas);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviewData();
  }, []);

  // Select appropriate replica and persona for a specific round
  const selectReplicaAndPersonaForRound = useCallback((roundId?: string): { 
    replicaId: string | null; 
    personaId: string | null; 
    round: InterviewRound | null 
  } => {
    console.log('selectReplicaAndPersonaForRound called with:', { 
      roundId, 
      availableRounds: availableRounds.length, 
      replicas: replicas.length,
      personas: personas.length 
    });
    
    if (!Array.isArray(availableRounds) || availableRounds.length === 0) {
      console.warn('No available rounds configured');
      return { replicaId: null, personaId: null, round: null };
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
      console.warn('No target round found');
      return { replicaId: null, personaId: null, round: null };
    }

    console.log('Selected round:', targetRound);

    // Ensure replicas and personas are always arrays before using find
    if (!Array.isArray(replicas)) {
      console.error('Replicas is not an array:', typeof replicas, replicas);
      return { replicaId: null, personaId: null, round: null };
    }
    
    if (!Array.isArray(personas)) {
      console.error('Personas is not an array:', typeof personas, personas);
      return { replicaId: null, personaId: null, round: null };
    }
    
    if (isMockMode) {
      return { 
        replicaId: `mock-${targetRound.id}-replica`, 
        personaId: `mock-${targetRound.id}-persona`,
        round: targetRound 
      };
    }

    // Find matching replica and persona
    const availableReplica = replicas.find(r => 
      r && r.replica_id === targetRound!.replicaId && r.status === 'ready'
    );
    
    const availablePersona = personas.find(p => 
      p && p.persona_id === targetRound!.personaId && p.status === 'ready'
    );

    if (availableReplica && availablePersona) {
      console.log('Found matching replica and persona:', { availableReplica, availablePersona });
      return { 
        replicaId: availableReplica.replica_id,
        personaId: availablePersona.persona_id,
        round: targetRound 
      };
    }

    console.warn('No matching replica/persona found for round:', targetRound);
    // Fallback to mock mode if no replica/persona found
    return { 
      replicaId: `mock-${targetRound.id}-replica`,
      personaId: `mock-${targetRound.id}-persona`,
      round: targetRound 
    };
  }, [availableRounds, replicas, personas, isMockMode, options.interviewType]);

  const startConversation = useCallback(async (roundId?: string) => {
    console.log('Starting Tavus conversation...', { 
      roundId, 
      isMockMode, 
      replicasLength: replicas.length,
      personasLength: personas.length 
    });
    setIsLoading(true);
    setError(null);

    try {
      const { replicaId, personaId, round } = selectReplicaAndPersonaForRound(roundId);
      
      if (!replicaId || !personaId || !round) {
        throw new Error(`No AI interviewer available for ${roundId || 'this interview type'}. Please check your Tavus configuration.`);
      }

      console.log('Selected replica, persona and round:', { replicaId, personaId, round });
      setCurrentRound(round);

      // Check if this is a mock replica/persona
      if (replicaId.startsWith('mock-') || personaId.startsWith('mock-')) {
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
      
      // Create conversation with round-specific settings including both replica_id and persona_id
      const conversationRequest = {
        replica_id: replicaId,
        persona_id: personaId, // Now including persona_id as required
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to start interview';
      setError(errorMessage);
      
      // If real API fails, fallback to mock mode
      if (!isMockMode && !errorMessage.includes('mock')) {
        console.log('Falling back to mock mode due to error');
        setIsMockMode(true);
        
        // Try again with mock mode
        const { round } = selectReplicaAndPersonaForRound(roundId);
        if (round) {
          const mockConversation: TavusConversationResponse = {
            conversation_id: `mock-conversation-${round.id}-${Date.now()}`,
            conversation_url: `https://tavus.io/conversations/mock-conversation-${round.id}`,
            status: 'active',
            created_at: new Date().toISOString(),
            round: round.id
          };
          
          setConversation(mockConversation);
          setIsConversationActive(true);
          setCurrentRound(round);
          setError('Using demo mode - add Tavus API key and configure replicas/personas for real AI video');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectReplicaAndPersonaForRound, options.role, isMockMode, replicas.length, personas.length]);

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
      // Don't set error for ending conversation, just log it
      console.warn('Conversation may not have ended properly, but continuing...');
      
      // Force cleanup even if API call fails
      setConversation(null);
      setCurrentRound(null);
      setIsConversationActive(false);
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
    if (options.autoStart && availableRounds.length > 0 && !conversation && !isLoading && 
        replicas.length > 0 && personas.length > 0) {
      console.log('Auto-starting conversation');
      startConversation();
    }
  }, [options.autoStart, availableRounds.length, conversation, isLoading, startConversation, 
      replicas.length, personas.length]);

  return {
    conversation,
    currentRound,
    availableRounds,
    replicas,
    personas,
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