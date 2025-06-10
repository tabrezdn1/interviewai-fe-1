// Tavus API integration for AI video interviews
interface TavusConfig {
  apiKey: string;
  baseUrl: string;
}

interface TavusConversationRequest {
  replica_id: string;
  persona_id: string; // Added persona_id as required
  conversation_name?: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
    language?: string;
  };
}

interface InterviewRound {
  id: string;
  name: string;
  description: string;
  replicaId: string;
  personaId: string; // Added persona_id for each round
  duration: number; // in minutes
  icon: string;
}

interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
  round?: string;
}

interface TavusReplicaResponse {
  replica_id: string;
  replica_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  video_url?: string;
  thumbnail_url?: string;
}

interface TavusPersonaResponse {
  persona_id: string;
  persona_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interview round configurations
export const getInterviewRounds = (): InterviewRound[] => {
  const hrReplicaId = import.meta.env.VITE_TAVUS_HR_REPLICA_ID;
  const hrPersonaId = import.meta.env.VITE_TAVUS_HR_PERSONA_ID;
  const technicalReplicaId = import.meta.env.VITE_TAVUS_TECHNICAL_REPLICA_ID;
  const technicalPersonaId = import.meta.env.VITE_TAVUS_TECHNICAL_PERSONA_ID;
  const behavioralReplicaId = import.meta.env.VITE_TAVUS_BEHAVIORAL_REPLICA_ID;
  const behavioralPersonaId = import.meta.env.VITE_TAVUS_BEHAVIORAL_PERSONA_ID;

  const rounds: InterviewRound[] = [];

  if (hrReplicaId && hrReplicaId !== 'your_hr_replica_id_here' && 
      hrPersonaId && hrPersonaId !== 'your_hr_persona_id_here') {
    rounds.push({
      id: 'screening',
      name: 'HR Screening',
      description: 'Initial screening with HR representative',
      replicaId: hrReplicaId,
      personaId: hrPersonaId,
      duration: 15,
      icon: 'User'
    });
  }

  if (technicalReplicaId && technicalReplicaId !== 'your_technical_replica_id_here' &&
      technicalPersonaId && technicalPersonaId !== 'your_technical_persona_id_here') {
    rounds.push({
      id: 'technical',
      name: 'Technical Round',
      description: 'Technical interview with engineering lead',
      replicaId: technicalReplicaId,
      personaId: technicalPersonaId,
      duration: 45,
      icon: 'Code'
    });
  }

  if (behavioralReplicaId && behavioralReplicaId !== 'your_behavioral_replica_id_here' &&
      behavioralPersonaId && behavioralPersonaId !== 'your_behavioral_persona_id_here') {
    rounds.push({
      id: 'behavioral',
      name: 'Behavioral Round',
      description: 'Behavioral interview with hiring manager',
      replicaId: behavioralReplicaId,
      personaId: behavioralPersonaId,
      duration: 30,
      icon: 'MessageSquare'
    });
  }

  return rounds;
};

// Get replica and persona IDs for specific interview type
export const getReplicaForInterviewType = (interviewType: string): { replicaId: string | null; personaId: string | null } => {
  const rounds = getInterviewRounds();
  console.log('Getting replica for interview type:', interviewType, 'Available rounds:', rounds);
  
  // Map interview types to rounds
  const typeToRoundMap: Record<string, string> = {
    'screening': 'screening',
    'technical': 'technical',
    'behavioral': 'behavioral',
    'mixed': 'technical', // Default to technical for mixed interviews
    'phone': 'screening' // Map phone to screening
  };

  // Default to technical if the interview type isn't recognized
  const roundId = typeToRoundMap[interviewType] || 'technical';
  const round = rounds.find(r => r.id === roundId);
  console.log('Selected round:', round);
  
  if (round) {
    return {
      replicaId: round.replicaId,
      personaId: round.personaId
    };
  }
  
  // If no matching round found, try to use any available round
  if (rounds.length > 0) {
    console.log('No matching round found, using first available round:', rounds[0]);
    return {
      replicaId: rounds[0].replicaId,
      personaId: rounds[0].personaId
    };
  }
  
  // If no rounds available, return null values
  console.warn('No rounds available for interview type:', interviewType);
  return {
    replicaId: null,
    personaId: null
  };
};

class TavusAPI {
  private config: TavusConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://tavusapi.com'
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    console.log('Making Tavus API request:', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!this.config.apiKey
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Tavus API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      throw new Error(`Tavus API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Tavus API raw response:', responseText);
      
      if (responseText.trim() === '') {
        // Handle empty response body
        data = {};
      } else {
        data = JSON.parse(responseText);
      }
    } catch (jsonError) {
      console.error('Failed to parse Tavus API response as JSON:', jsonError);
      throw new Error(`Invalid JSON response from Tavus API: ${jsonError.message}`);
    }
    
    console.log('Tavus API success response:', data);
    return data;
  }

  // Get available replicas
  async getReplicas(): Promise<TavusReplicaResponse[]> {
    try {
      const response = await this.makeRequest<any>('/v2/replicas');
      
      // Handle different possible response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Check common response wrapper patterns
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response.replicas)) {
          return response.replicas;
        } else if (Array.isArray(response.results)) {
          return response.results;
        }
      }
      
      console.warn('Unexpected replicas response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching replicas:', error);
      throw error;
    }
  }

  // Get available personas
  async getPersonas(): Promise<TavusPersonaResponse[]> {
    try {
      const response = await this.makeRequest<any>('/v2/personas');
      
      // Handle different possible response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Check common response wrapper patterns
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response.personas)) {
          return response.personas;
        } else if (Array.isArray(response.results)) {
          return response.results;
        }
      }
      
      console.warn('Unexpected personas response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(
    request: TavusConversationRequest, 
    round?: string
  ): Promise<TavusConversationResponse> {
    try {
      console.log('Creating Tavus conversation with request:', request);
      
      // Validate required fields
      if (!request.replica_id) {
        throw new Error('replica_id is required for Tavus conversation');
      }
      if (!request.persona_id) {
        throw new Error('persona_id is required for Tavus conversation');
      }

      // Create conversation request with proper properties for Daily.co integration
      const conversationRequest = {
        replica_id: request.replica_id,
        persona_id: request.persona_id,
        conversation_name: request.conversation_name,
        callback_url: request.callback_url,
        properties: {
          max_call_duration: request.properties?.max_call_duration || 3600,
          participant_left_timeout: request.properties?.participant_left_timeout || 60,
          participant_absent_timeout: request.properties?.participant_absent_timeout || 60,
          enable_recording: request.properties?.enable_recording ?? true,
          enable_transcription: request.properties?.enable_transcription ?? true,
          language: request.properties?.language || 'English',
          apply_greenscreen: true, // Enable green screen for chroma key effect
        }
      };
      
      const response = await this.makeRequest<TavusConversationResponse>('/v2/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationRequest),
      });
      
      return {
        ...response,
        round
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get conversation details
  async getConversation(conversationId: string): Promise<TavusConversationResponse> {
    try {
      return await this.makeRequest<TavusConversationResponse>(`/v2/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // End a conversation
  async endConversation(conversationId: string): Promise<void> {
    try {
      await this.makeRequest(`/v2/conversations/${conversationId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }

  // Get conversation recording (if enabled)
  async getConversationRecording(conversationId: string): Promise<{ recording_url: string }> {
    try {
      return await this.makeRequest<{ recording_url: string }>(`/v2/conversations/${conversationId}/recording`);
    } catch (error) {
      console.error('Error fetching recording:', error);
      throw error;
    }
  }

  // Get conversation transcript (if enabled)
  async getConversationTranscript(conversationId: string): Promise<{ transcript: string }> {
    try {
      return await this.makeRequest<{ transcript: string }>(`/v2/conversations/${conversationId}/transcript`);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  }
}

// Create singleton instance
let tavusInstance: TavusAPI | null = null;

export const getTavusAPI = (): TavusAPI => {
  if (!tavusInstance) {
    const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
    if (!apiKey || apiKey === 'your_tavus_api_key_here') {
      throw new Error('VITE_TAVUS_API_KEY environment variable is required');
    }
    tavusInstance = new TavusAPI(apiKey);
  }
  return tavusInstance;
};

// Helper function to check if Tavus is properly configured
export const isTavusConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
  const hasValidApiKey = !!(apiKey && apiKey !== 'your_tavus_api_key_here');
  
  // Check if at least one complete round is configured (replica + persona)
  const rounds = getInterviewRounds();
  const hasValidRounds = rounds.length > 0;
  
  console.log('Tavus configuration check:', {
    hasApiKey: !!apiKey,
    isValidApiKey: hasValidApiKey,
    apiKeyLength: apiKey?.length || 0,
    availableRounds: rounds.length,
    hasValidRounds
  });
  
  return hasValidApiKey && hasValidRounds;
};

// Debug function to check environment variables
export const debugTavusConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_TAVUS_API_KEY,
    hrReplicaId: import.meta.env.VITE_TAVUS_HR_REPLICA_ID,
    hrPersonaId: import.meta.env.VITE_TAVUS_HR_PERSONA_ID,
    technicalReplicaId: import.meta.env.VITE_TAVUS_TECHNICAL_REPLICA_ID,
    technicalPersonaId: import.meta.env.VITE_TAVUS_TECHNICAL_PERSONA_ID,
    behavioralReplicaId: import.meta.env.VITE_TAVUS_BEHAVIORAL_REPLICA_ID,
    behavioralPersonaId: import.meta.env.VITE_TAVUS_BEHAVIORAL_PERSONA_ID
  };
  
  console.log('Tavus Environment Variables:', {
    hasApiKey: !!config.apiKey,
    apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set',
    hasHrReplica: !!config.hrReplicaId,
    hasHrPersona: !!config.hrPersonaId,
    hasTechnicalReplica: !!config.technicalReplicaId,
    hasTechnicalPersona: !!config.technicalPersonaId,
    hasBehavioralReplica: !!config.behavioralReplicaId,
    hasBehavioralPersona: !!config.behavioralPersonaId,
    availableRounds: getInterviewRounds().length
  });
  
  return config;
};

export type { 
  TavusConversationRequest, 
  TavusConversationResponse, 
  TavusReplicaResponse,
  TavusPersonaResponse,
  InterviewRound 
};