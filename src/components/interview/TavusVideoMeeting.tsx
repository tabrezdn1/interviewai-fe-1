import React, { useEffect, useRef, useState } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, 
  Volume2, VolumeX, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';

interface TavusVideoMeetingProps {
  conversationUrl: string;
  participantName: string;
  onMeetingEnd: () => void;
  onError: (error: string) => void;
  className?: string;
}

const TavusVideoMeeting: React.FC<TavusVideoMeetingProps> = ({
  conversationUrl,
  participantName,
  onMeetingEnd,
  onError,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);

  // Handle iframe load event
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('Tavus iframe loaded successfully');
      setIsLoading(false);
    };

    const handleError = () => {
      const errorMsg = 'Failed to load Tavus video conversation';
      console.error(errorMsg);
      setError(errorMsg);
      onError(errorMsg);
      setIsLoading(false);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [onError]);

  // Handle message events from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from Tavus
      if (event.origin !== 'https://tavus.io') return;
      
      try {
        const data = event.data;
        console.log('Received message from Tavus:', data);
        
        // Handle different message types
        if (data.type === 'connectionStatus') {
          // Update connection status
        } else if (data.type === 'meetingEnded') {
          onMeetingEnd();
        } else if (data.type === 'error') {
          setError(data.message || 'An error occurred with the video call');
          onError(data.message || 'An error occurred with the video call');
        }
      } catch (error) {
        console.error('Error processing message from Tavus:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMeetingEnd, onError]);

  // Toggle video
  const toggleVideo = () => {
    setHasVideo(!hasVideo);
    
    // Send message to Tavus iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'toggleVideo', enabled: !hasVideo },
          '*'
        );
      } catch (error) {
        console.warn('Could not send toggleVideo message to Tavus iframe:', error);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setHasAudio(!hasAudio);
    
    // Send message to Tavus iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'toggleAudio', enabled: !hasAudio },
          '*'
        );
      } catch (error) {
        console.warn('Could not send toggleAudio message to Tavus iframe:', error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Send message to Tavus iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'toggleMute', muted: !isMuted },
          '*'
        );
      } catch (error) {
        console.warn('Could not send toggleMute message to Tavus iframe:', error);
      }
    }
  };

  // End meeting
  const endMeeting = () => {
    onMeetingEnd();
  };

  // Check if this is a mock conversation URL
  const isMockConversation = !conversationUrl || 
                            conversationUrl.includes('mock-conversation-') || 
                            conversationUrl === 'https://tavus.io/conversations/mock-conversation';

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center text-white p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Error</h3>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isMockConversation) {
    // Render a mock AI interviewer UI for development/testing
    return (
      <div className={`relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl overflow-hidden ${className}`}>
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Video className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">AI Interviewer</h3>
          <p className="text-blue-200 text-sm mb-4 text-center">
            Demo Mode: AI interviewer simulation
          </p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-xs mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
          
          <p className="text-white/70 text-sm text-center max-w-md mb-6">
            In demo mode, the AI interviewer is simulated. Add your Tavus API key to enable real AI video interviews.
          </p>
          
          {/* Mock conversation controls */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={toggleVideo}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {hasVideo ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
              {hasVideo ? 'Camera On' : 'Camera Off'}
            </Button>
            
            <Button
              onClick={toggleAudio}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {hasAudio ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
              {hasAudio ? 'Mic On' : 'Mic Off'}
            </Button>
            
            <Button
              onClick={endMeeting}
              variant="destructive"
              size="sm"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Tavus iframe */}
      <iframe
        ref={iframeRef}
        src={conversationUrl}
        className="w-full h-full min-h-[400px] border-0"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture"
        allowFullScreen
        title="Tavus AI Interviewer"
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
      
      {/* Control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="sm"
              className={`p-2 rounded-full ${
                hasVideo ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {hasVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="sm"
              className={`p-2 rounded-full ${
                hasAudio ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {hasAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          
          <Button
            onClick={endMeeting}
            variant="destructive"
            size="sm"
            className="p-2 rounded-full"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TavusVideoMeeting;