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

interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Tavus API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // Get available replicas
  async getReplicas(): Promise<TavusReplicaResponse[]> {
    return this.makeRequest<TavusReplicaResponse[]>('/v2/replicas');
  }

  // Create a new conversation
  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    return this.makeRequest<TavusConversationResponse>('/v2/conversations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get conversation details
  async getConversation(conversationId: string): Promise<TavusConversationResponse> {
    return this.makeRequest<TavusConversationResponse>(`/v2/conversations/${conversationId}`);
  }

  // End a conversation
  async endConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/v2/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Get conversation recording (if enabled)
  async getConversationRecording(conversationId: string): Promise<{ recording_url: string }> {
    return this.makeRequest<{ recording_url: string }>(`/v2/conversations/${conversationId}/recording`);
  }

  // Get conversation transcript (if enabled)
  async getConversationTranscript(conversationId: string): Promise<{ transcript: string }> {
    return this.makeRequest<{ transcript: string }>(`/v2/conversations/${conversationId}/transcript`);
  }
}

// Create singleton instance
let tavusInstance: TavusAPI | null = null;

export const getTavusAPI = (): TavusAPI => {
  if (!tavusInstance) {
    const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_TAVUS_API_KEY environment variable is required');
    }
    tavusInstance = new TavusAPI(apiKey);
  }
  return tavusInstance;
};

export type { TavusConversationRequest, TavusConversationResponse, TavusReplicaResponse };