import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Volume2, VolumeX, Video, Play } from 'lucide-react';
import { Button } from '../ui/button';

interface TavusVideoPlayerProps {
  conversationUrl?: string;
  isLoading?: boolean;
  error?: string;
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
  className?: string;
  isMockMode?: boolean;
}

const TavusVideoPlayer: React.FC<TavusVideoPlayerProps> = ({
  conversationUrl,
  isLoading = false,
  error,
  onVideoReady,
  onVideoError,
  className = '',
  isMockMode = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    console.log('TavusVideoPlayer props:', {
      conversationUrl,
      isLoading,
      error,
      hasConversationUrl: !!conversationUrl
    });
  }, [conversationUrl, isLoading, error]);

  useEffect(() => {
    if (conversationUrl && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const handleLoad = () => {
        console.log('Tavus iframe loaded successfully');
        setIsVideoLoaded(true);
        onVideoReady?.();
      };

      const handleError = () => {
        const errorMsg = 'Failed to load Tavus video conversation';
        console.error(errorMsg);
        onVideoError?.(errorMsg);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Set a timeout to detect if iframe fails to load
      const loadTimeout = setTimeout(() => {
        if (!isVideoLoaded) {
          console.warn('Tavus iframe taking longer than expected to load');
        }
      }, 10000);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        clearTimeout(loadTimeout);
      };
    }
  }, [conversationUrl, onVideoReady, onVideoError, isVideoLoaded]);

  const toggleMute = () => {
    if (iframeRef.current && conversationUrl && !conversationUrl.includes('mock-conversation-url')) {
      // Send message to Tavus iframe to toggle mute
      try {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'toggleMute', muted: !isMuted },
          '*'
        );
        setIsMuted(!isMuted);
      } catch (error) {
        console.warn('Could not communicate with Tavus iframe:', error);
      }
    } else {
      // Mock mode toggle
      setIsMuted(!isMuted);
    }
  };

  const startConversation = () => {
    if (iframeRef.current && conversationUrl && !conversationUrl.includes('mock-conversation-url')) {
      // Send message to Tavus iframe to start conversation
      try {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'startConversation' },
          '*'
        );
        setHasStarted(true);
      } catch (error) {
        console.warn('Could not communicate with Tavus iframe:', error);
      }
    } else {
      // Mock mode start
      setHasStarted(true);
    }
  };

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

  if (isLoading || !conversationUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center text-white p-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {conversationUrl ? 'Loading AI Interviewer...' : 'Preparing Interview...'}
          </h3>
          <p className="text-gray-300 text-sm">
            Setting up your personalized interview experience
          </p>
        </div>
      </div>
    );
  }

  // Check if this is a mock conversation URL
  const isMockConversation = conversationUrl.includes('mock-conversation-') || 
                            conversationUrl.includes('mock-conversation-url');

  if (isMockConversation) {
    return (
      <div className={`relative bg-gray-800 rounded-xl overflow-hidden ${className}`}>
        {/* Mock AI Interviewer Video */}
        <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
          <div className="text-center text-white p-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Video className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Interviewer</h3>
            <p className="text-blue-200 text-sm mb-4">Ready to conduct your interview</p>
            
            {!hasStarted ? (
              <Button 
                onClick={startConversation}
                className="mb-4 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-xs mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live
              </div>
            )}
            
            <div className="text-xs text-blue-300">
              {isMockMode ? 'Demo Mode - Add your Tavus API key to enable real AI video' : 'Demo Mode - Check Tavus configuration'}
            </div>
          </div>
        </div>
        
        {/* Video Controls Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mock conversation indicator */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-xs">
          Demo Mode
        </div>
      </div>
    );
  }

  console.log('Rendering real Tavus iframe with URL:', conversationUrl);

  return (
    <div className={`relative bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      <iframe
        ref={iframeRef}
        src={conversationUrl}
        className="w-full h-full min-h-[400px] border-0"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture"
        allowFullScreen
        title="Tavus AI Interviewer"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        onLoad={() => {
          console.log('Iframe onLoad event fired');
          setIsVideoLoaded(true);
        }}
        onError={(e) => {
          console.error('Iframe onError event fired:', e);
          onVideoError?.('Failed to load video conversation');
        }}
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleMute}
          className="bg-black/50 hover:bg-black/70 text-white border-0"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loading overlay for iframe */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Connecting to AI interviewer...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-xs">
        {isVideoLoaded ? 'Connected' : 'Connecting...'}
      </div>
    </div>
  );
};

export default TavusVideoPlayer;