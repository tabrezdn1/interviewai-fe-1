import { getTavusAPI, TavusConversationRequest, TavusConversationResponse } from '../lib/tavus';

export interface TavusParticipant {
  name: string;
  email?: string;
  role: 'interviewer' | 'candidate';
}

export interface TavusConversationConfig {
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  participant: TavusParticipant;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
    language?: string;
  };
}

export interface TavusConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed' | 'reconnecting';
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  camera: boolean;
  microphone: boolean;
  latency?: number;
  error?: string;
}

class TavusService {
  private conversationId: string | null = null;
  private joinLink: string | null = null;
  private connectionStatus: TavusConnectionStatus = { 
    status: 'disconnected', 
    quality: 'good',
    camera: false,
    microphone: false
  };
  private statusCallbacks: ((status: TavusConnectionStatus) => void)[] = [];

  /**
   * Initialize a new Tavus conversation
   */
  async initializeConversation(config: TavusConversationConfig): Promise<{
    conversationId: string;
    joinLink: string;
  }> {
    try {
      console.log('Initializing Tavus conversation with config:', config);
      
      const tavusAPI = getTavusAPI();
      
      const conversationRequest: TavusConversationRequest = {
        replica_id: config.replica_id,
        persona_id: config.persona_id,
        conversation_name: config.conversation_name,
        callback_url: `${window.location.origin}/api/tavus/callback`,
        properties: {
          max_call_duration: config.properties?.max_call_duration || 3600, // 1 hour default
          participant_left_timeout: config.properties?.participant_left_timeout || 30,
          participant_absent_timeout: config.properties?.participant_absent_timeout || 60,
          enable_recording: config.properties?.enable_recording ?? true,
          enable_transcription: config.properties?.enable_transcription ?? true,
          language: config.properties?.language || 'English',
          ...config.properties
        }
      };

      const response = await tavusAPI.createConversation(conversationRequest);
      
      this.conversationId = response.conversation_id;
      this.joinLink = response.conversation_url;
      
      console.log('Conversation initialized successfully:', {
        conversationId: this.conversationId,
        joinLink: this.joinLink
      });

      return {
        conversationId: this.conversationId,
        joinLink: this.joinLink
      };
    } catch (error) {
      console.error('Failed to initialize Tavus conversation:', error);
      throw new Error(`Failed to initialize video interview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current conversation details
   */
  getConversationDetails() {
    return {
      conversationId: this.conversationId,
      joinLink: this.joinLink,
      status: this.connectionStatus
    };
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(status: Partial<TavusConnectionStatus>) {
    this.connectionStatus = { ...this.connectionStatus, ...status };
    this.statusCallbacks.forEach(callback => callback(this.connectionStatus));
  }

  /**
   * Subscribe to connection status updates
   */
  onStatusChange(callback: (status: TavusConnectionStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * End the current conversation
   */
  async endConversation(): Promise<void> {
    if (!this.conversationId) {
      console.warn('No active conversation to end');
      return;
    }

    try {
      console.log('Ending Tavus conversation:', this.conversationId);
      
      const tavusAPI = getTavusAPI();
      await tavusAPI.endConversation(this.conversationId);
      
      this.conversationId = null;
      this.joinLink = null;
      this.updateConnectionStatus({ 
        status: 'disconnected',
        camera: false,
        microphone: false
      });
      
      console.log('Conversation ended successfully');
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation recording (if available)
   */
  async getRecording(): Promise<string | null> {
    if (!this.conversationId) {
      return null;
    }

    try {
      const tavusAPI = getTavusAPI();
      const recording = await tavusAPI.getConversationRecording(this.conversationId);
      return recording.recording_url;
    } catch (error) {
      console.error('Failed to get recording:', error);
      return null;
    }
  }

  /**
   * Get conversation transcript (if available)
   */
  async getTranscript(): Promise<string | null> {
    if (!this.conversationId) {
      return null;
    }

    try {
      const tavusAPI = getTavusAPI();
      const transcript = await tavusAPI.getConversationTranscript(this.conversationId);
      return transcript.transcript;
    } catch (error) {
      console.error('Failed to get transcript:', error);
      return null;
    }
  }

  /**
   * Check device permissions
   */
  async checkDevicePermissions(): Promise<{
    camera: boolean;
    microphone: boolean;
    error?: string;
  }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
      
      const permissions = { camera: true, microphone: true };
      
      // Update connection status with device permissions
      this.updateConnectionStatus({
        camera: permissions.camera,
        microphone: permissions.microphone
      });
      
      return permissions;
    } catch (error) {
      console.error('Device permission check failed:', error);
      
      let errorMessage = 'Failed to access camera and microphone';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera and microphone not supported in this browser.';
        }
      }
      
      const permissions = { 
        camera: false, 
        microphone: false, 
        error: errorMessage 
      };
      
      // Update connection status with failed permissions
      this.updateConnectionStatus({
        camera: permissions.camera,
        microphone: permissions.microphone
      });
      
      return permissions;
    }
  }

  /**
   * Test connection quality
   */
  async testConnectionQuality(): Promise<TavusConnectionStatus['quality']> {
    try {
      const startTime = Date.now();
      
      // Simple ping test to estimate latency
      await fetch(window.location.origin, { method: 'HEAD' });
      
      const latency = Date.now() - startTime;
      
      let quality: TavusConnectionStatus['quality'] = 'excellent';
      if (latency > 200) quality = 'good';
      if (latency > 500) quality = 'fair';
      if (latency > 1000) quality = 'poor';
      
      this.updateConnectionStatus({ quality, latency });
      
      return quality;
    } catch (error) {
      console.error('Connection quality test failed:', error);
      this.updateConnectionStatus({ quality: 'poor' });
      return 'poor';
    }
  }
}

// Export singleton instance
export const tavusService = new TavusService();
export default TavusService;