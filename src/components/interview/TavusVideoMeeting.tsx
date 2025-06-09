import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Settings, 
  Wifi, WifiOff, AlertCircle, Loader2, Monitor, Users,
  Volume2, VolumeX, Maximize, Minimize
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { tavusService, TavusConnectionStatus } from '../../services/TavusService';

interface TavusVideoMeetingProps {
  conversationUrl: string;
  participantName: string;
  onMeetingEnd: () => void;
  onError: (error: string) => void;
  className?: string;
}

interface MediaStreamState {
  video: boolean;
  audio: boolean;
  stream: MediaStream | null;
}

const TavusVideoMeeting: React.FC<TavusVideoMeetingProps> = ({
  conversationUrl,
  participantName,
  onMeetingEnd,
  onError,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<TavusConnectionStatus>({
    status: 'connecting',
    quality: 'good'
  });
  const [mediaState, setMediaState] = useState<MediaStreamState>({
    video: true,
    audio: true,
    stream: null
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize media stream
  const initializeMediaStream = useCallback(async () => {
    try {
      console.log('Initializing media stream...');
      
      const constraints = {
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setMediaState(prev => ({ ...prev, stream }));
      
      // Set up local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(console.error);
      }
      
      console.log('Media stream initialized successfully');
      tavusService.updateConnectionStatus({ status: 'connected' });
      
    } catch (error) {
      console.error('Failed to initialize media stream:', error);
      
      let errorMessage = 'Failed to access camera and microphone';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow permissions and refresh.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found on this device.';
        }
      }
      
      setError(errorMessage);
      onError(errorMessage);
      tavusService.updateConnectionStatus({ status: 'failed', error: errorMessage });
    }
  }, [onError]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('Tavus iframe loaded');
    setIsLoading(false);
    tavusService.updateConnectionStatus({ status: 'connected' });
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('Tavus iframe failed to load');
    const errorMessage = 'Failed to load video meeting interface';
    setError(errorMessage);
    onError(errorMessage);
    setIsLoading(false);
    tavusService.updateConnectionStatus({ status: 'failed', error: errorMessage });
  }, [onError]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (mediaState.stream) {
      const videoTracks = mediaState.stream.getVideoTracks();
      const newVideoState = !mediaState.video;
      
      videoTracks.forEach(track => {
        track.enabled = newVideoState;
      });
      
      setMediaState(prev => ({ ...prev, video: newVideoState }));
      
      // Send message to Tavus iframe
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({
            type: 'toggleVideo',
            enabled: newVideoState
          }, '*');
        } catch (error) {
          console.warn('Could not communicate with Tavus iframe:', error);
        }
      }
    }
  }, [mediaState.stream, mediaState.video]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (mediaState.stream) {
      const audioTracks = mediaState.stream.getAudioTracks();
      const newAudioState = !mediaState.audio;
      
      audioTracks.forEach(track => {
        track.enabled = newAudioState;
      });
      
      setMediaState(prev => ({ ...prev, audio: newAudioState }));
      
      // Send message to Tavus iframe
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({
            type: 'toggleAudio',
            enabled: newAudioState
          }, '*');
        } catch (error) {
          console.warn('Could not communicate with Tavus iframe:', error);
        }
      }
    }
  }, [mediaState.stream, mediaState.audio]);

  // Toggle mute for AI interviewer
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMutedState = !prev;
      
      // Send message to Tavus iframe
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({
            type: 'toggleMute',
            muted: newMutedState
          }, '*');
        } catch (error) {
          console.warn('Could not communicate with Tavus iframe:', error);
        }
      }
      
      return newMutedState;
    });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(console.error);
    }
  }, []);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    try {
      console.log('Leaving meeting...');
      
      // Stop local media stream
      if (mediaState.stream) {
        mediaState.stream.getTracks().forEach(track => track.stop());
      }
      
      // End Tavus conversation
      await tavusService.endConversation();
      
      // Notify parent component
      onMeetingEnd();
      
    } catch (error) {
      console.error('Error leaving meeting:', error);
      // Still call onMeetingEnd even if there's an error
      onMeetingEnd();
    }
  }, [mediaState.stream, onMeetingEnd]);

  // Initialize on mount
  useEffect(() => {
    initializeMediaStream();
    
    // Subscribe to connection status updates
    const unsubscribe = tavusService.onStatusChange(setConnectionStatus);
    
    // Test connection quality
    tavusService.testConnectionQuality();
    
    return () => {
      unsubscribe();
      // Cleanup media stream
      if (mediaState.stream) {
        mediaState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeMediaStream]);

  // Handle iframe events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', handleIframeError);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      iframe.removeEventListener('error', handleIframeError);
    };
  }, [handleIframeLoad, handleIframeError]);

  // Get connection status color
  const getStatusColor = (status: TavusConnectionStatus['status']) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'connecting': case 'reconnecting': return 'text-yellow-500';
      case 'failed': case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get quality indicator
  const getQualityIndicator = (quality: TavusConnectionStatus['quality']) => {
    const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`w-1 h-3 rounded-full ${
              i <= bars ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Card className={`${className} bg-red-50 border-red-200`}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Main video area */}
      <div className="relative w-full h-full min-h-[500px]">
        {/* Tavus AI Interviewer */}
        <iframe
          ref={iframeRef}
          src={conversationUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture"
          allowFullScreen
          title="AI Interviewer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">Connecting to AI interviewer...</p>
              <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}
        
        {/* Local video feed */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          {mediaState.video && mediaState.stream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff className="h-8 w-8 text-gray-500" />
            </div>
          )}
          
          {/* Local video label */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
            You
          </div>
          
          {/* Media status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            <div className={`w-2 h-2 rounded-full ${mediaState.video ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className={`w-2 h-2 rounded-full ${mediaState.audio ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </div>
        
        {/* Connection status */}
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus.status === 'connected' ? 'bg-green-400' : 
              connectionStatus.status === 'connecting' || connectionStatus.status === 'reconnecting' ? 'bg-yellow-400' : 
              'bg-red-400'
            } ${connectionStatus.status === 'connecting' || connectionStatus.status === 'reconnecting' ? 'animate-pulse' : ''}`} />
            <span className={`text-sm font-medium ${getStatusColor(connectionStatus.status)}`}>
              {connectionStatus.status === 'connected' ? 'Connected' :
               connectionStatus.status === 'connecting' ? 'Connecting...' :
               connectionStatus.status === 'reconnecting' ? 'Reconnecting...' :
               connectionStatus.status === 'failed' ? 'Failed' : 'Disconnected'}
            </span>
          </div>
          
          {connectionStatus.status === 'connected' && (
            <div className="flex items-center gap-2">
              {getQualityIndicator(connectionStatus.quality)}
              <span className="text-xs text-gray-300">
                {connectionStatus.latency && `${connectionStatus.latency}ms`}
              </span>
            </div>
          )}
        </div>
        
        {/* Participant info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-white">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">AI Interviewer</span>
            <Badge variant="outline" className="text-xs border-green-400 text-green-400">
              Live
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="sm"
              className={`p-3 rounded-full ${
                mediaState.video 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {mediaState.video ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="sm"
              className={`p-3 rounded-full ${
                mediaState.audio 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {mediaState.audio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Center - Participant name */}
          <div className="text-white text-sm font-medium">
            Interview with {participantName}
          </div>
          
          {/* Right controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={leaveMeeting}
              variant="destructive"
              size="sm"
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meeting Settings</DialogTitle>
            <DialogDescription>
              Adjust your video and audio settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connection Quality</h4>
              <div className="flex items-center gap-3">
                {getQualityIndicator(connectionStatus.quality)}
                <span className="text-sm text-gray-600 capitalize">
                  {connectionStatus.quality}
                </span>
                {connectionStatus.latency && (
                  <span className="text-xs text-gray-500">
                    ({connectionStatus.latency}ms latency)
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Media Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Camera</span>
                  <Badge variant={mediaState.video ? "default" : "destructive"}>
                    {mediaState.video ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone</span>
                  <Badge variant={mediaState.audio ? "default" : "destructive"}>
                    {mediaState.audio ? 'On' : 'Off'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TavusVideoMeeting;