import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/button';

interface UserVideoFeedProps {
  videoStream: MediaStream | null;
  hasVideoPermission: boolean;
  hasAudioPermission: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  className?: string;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({
  videoStream,
  hasVideoPermission,
  hasAudioPermission,
  onToggleVideo,
  onToggleAudio,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      console.log('Setting video stream to video element');
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(console.error);
    }
  }, [videoStream]);
  
  useEffect(() => {
    console.log('UserVideoFeed state:', {
      hasVideoPermission,
      hasAudioPermission,
      hasVideoStream: !!videoStream
    });
  }, [hasVideoPermission, hasAudioPermission, videoStream]);

  return (
    <div className={`relative bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600 ${className}`}>
      {hasVideoPermission && videoStream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror the video
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <VideoOff className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              {videoStream ? 'Camera Off' : 'No Camera'}
            </p>
          </div>
        </div>
      )}
      
      {/* Controls overlay */}
      <div className="absolute bottom-2 left-2 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleVideo}
          className={`p-2 rounded-full text-white ${
            hasVideoPermission 
              ? 'bg-green-600/80 hover:bg-green-600' 
              : 'bg-red-600/80 hover:bg-red-600'
          } transition-colors border-0`}
          title={hasVideoPermission ? 'Turn off camera' : 'Turn on camera'}
        >
          {hasVideoPermission ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleAudio}
          className={`p-2 rounded-full text-white ${
            hasAudioPermission 
              ? 'bg-green-600/80 hover:bg-green-600' 
              : 'bg-red-600/80 hover:bg-red-600'
          } transition-colors border-0`}
          title={hasAudioPermission ? 'Turn off microphone' : 'Turn on microphone'}
        >
          {hasAudioPermission ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${
          hasVideoPermission || hasAudioPermission ? 'bg-green-400' : 'bg-red-400'
        } animate-pulse`} />
      </div>
      
      {/* Label */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
        You
      </div>
    </div>
  );
};

export default UserVideoFeed;