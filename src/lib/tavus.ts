// Tavus API integration for AI video interviews
interface TavusConfig {
  apiKey: string;
  baseUrl: string;
}

interface TavusConversationRequest {
  replica_id: string;
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

// Interview round configurations
export const getInterviewRounds = (): InterviewRound[] => {
  const hrReplicaId = import.meta.env.VITE_TAVUS_HR_REPLICA_ID;
  const technicalReplicaId = import.meta.env.VITE_TAVUS_TECHNICAL_REPLICA_ID;
  const behavioralReplicaId = import.meta.env.VITE_TAVUS_BEHAVIORAL_REPLICA_ID;

  const rounds: InterviewRound[] = [];

  if (hrReplicaId && hrReplicaId !== 'your_hr_replica_id_here') {
    rounds.push({
      id: 'screening',
      name: 'HR Screening',
      description: 'Initial screening with HR representative',
      replicaId: hrReplicaId,
      duration: 15,
      icon: 'User'
    });
  }

  if (technicalReplicaId && technicalReplicaId !== 'your_technical_replica_id_here') {
    rounds.push({
      id: 'technical',
      name: 'Technical Round',
      description: 'Technical interview with engineering lead',
      replicaId: technicalReplicaId,
      duration: 45,
      icon: 'Code'
    });
  }

  if (behavioralReplicaId && behavioralReplicaId !== 'your_behavioral_replica_id_here') {
    rounds.push({
      id: 'behavioral',
      name: 'Behavioral Round',
      description: 'Behavioral interview with hiring manager',
      replicaId: behavioralReplicaId,
      duration: 30,
      icon: 'MessageSquare'
    });
  }

  return rounds;
};

// Get replica ID for specific interview type
export const getReplicaForInterviewType = (interviewType: string): string | null => {
  const rounds = getInterviewRounds();
  
  // Map interview types to rounds
  const typeToRoundMap: Record<string, string> = {
    'screening': 'screening',
    'technical': 'technical',
    'behavioral': 'behavioral',
    'mixed': 'technical' // Default to technical for mixed interviews
  };

  const roundId = typeToRoundMap[interviewType];
  const round = rounds.find(r => r.id === roundId);
  
  return round?.replicaId || null;
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

    const data = await response.json();
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

  // Create a new conversation
  async createConversation(
    request: TavusConversationRequest, 
    round?: string
  ): Promise<TavusConversationResponse> {
    try {
      console.log('Creating Tavus conversation with request:', request);
      
      const response = await this.makeRequest<TavusConversationResponse>('/v2/conversations', {
        method: 'POST',
        body: JSON.stringify(request),
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
  
  console.log('Tavus configuration check:', {
    hasApiKey: !!apiKey,
    isValidApiKey: hasValidApiKey,
    apiKeyLength: apiKey?.length || 0
  });
  
  return hasValidApiKey;
};

// Debug function to check environment variables
export const debugTavusConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_TAVUS_API_KEY,
    hrReplicaId: import.meta.env.VITE_TAVUS_HR_REPLICA_ID,
    technicalReplicaId: import.meta.env.VITE_TAVUS_TECHNICAL_REPLICA_ID,
    behavioralReplicaId: import.meta.env.VITE_TAVUS_BEHAVIORAL_REPLICA_ID
  };
  
  console.log('Tavus Environment Variables:', {
    hasApiKey: !!config.apiKey,
    apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set',
    hasHrReplica: !!config.hrReplicaId,
    hasTechnicalReplica: !!config.technicalReplicaId,
    hasBehavioralReplica: !!config.behavioralReplicaId,
    availableRounds: getInterviewRounds().length
  });
  
  return config;
};

export type { 
  TavusConversationRequest, 
  TavusConversationResponse, 
  TavusReplicaResponse,
  InterviewRound 
};