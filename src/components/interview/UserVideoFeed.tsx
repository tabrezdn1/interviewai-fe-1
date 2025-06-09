import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

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
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

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
          <VideoOff className="h-8 w-8 text-gray-500" />
        </div>
      )}
      
      {/* Controls overlay */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        <button
          onClick={onToggleVideo}
          className={`p-1 rounded-full text-white text-xs ${
            hasVideoPermission 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          } transition-colors`}
          title={hasVideoPermission ? 'Turn off camera' : 'Turn on camera'}
        >
          {hasVideoPermission ? (
            <Video className="h-3 w-3" />
          ) : (
            <VideoOff className="h-3 w-3" />
          )}
        </button>
        
        <button
          onClick={onToggleAudio}
          className={`p-1 rounded-full text-white text-xs ${
            hasAudioPermission 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          } transition-colors`}
          title={hasAudioPermission ? 'Turn off microphone' : 'Turn on microphone'}
        >
          {hasAudioPermission ? (
            <Mic className="h-3 w-3" />
          ) : (
            <MicOff className="h-3 w-3" />
          )}
        </button>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${
          hasVideoPermission || hasAudioPermission ? 'bg-green-400' : 'bg-red-400'
        }`} />
      </div>
      
      {/* Label */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
        You
      </div>
    </div>
  );
};

export default UserVideoFeed;