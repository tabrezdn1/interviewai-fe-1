import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Volume2, VolumeX, Video } from 'lucide-react';
import { Button } from '../ui/button';

interface TavusVideoPlayerProps {
  conversationUrl?: string;
  isLoading?: boolean;
  error?: string;
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
  className?: string;
}

const TavusVideoPlayer: React.FC<TavusVideoPlayerProps> = ({
  conversationUrl,
  isLoading = false,
  error,
  onVideoReady,
  onVideoError,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (conversationUrl && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const handleLoad = () => {
        setIsVideoLoaded(true);
        onVideoReady?.();
      };

      const handleError = () => {
        const errorMsg = 'Failed to load Tavus video conversation';
        onVideoError?.(errorMsg);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };
    }
  }, [conversationUrl, onVideoReady, onVideoError]);

  const toggleMute = () => {
    if (iframeRef.current) {
      // Send message to iframe to toggle mute
      iframeRef.current.contentWindow?.postMessage(
        { type: 'toggleMute', muted: !isMuted },
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center text-white p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Error</h3>
          <p className="text-gray-300 text-sm">{error}</p>
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
  const isMockConversation = conversationUrl.includes('mock-conversation-url');

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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live
            </div>
            <div className="mt-4 text-xs text-blue-300">
              Demo Mode - Add your Tavus API key to enable real AI video
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

  return (
    <div className={`relative bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      <iframe
        ref={iframeRef}
        src={conversationUrl}
        className="w-full h-full min-h-[400px] border-0"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title="Tavus AI Interviewer"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TavusVideoPlayer;