import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useDaily,
  DailyVideo,
  useParticipantIds,
  useLocalSessionId,
  useAudioTrack,
  DailyAudio,
} from '@daily-co/daily-react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Settings, 
  Wifi, WifiOff, AlertCircle, Loader2, Monitor, Users,
  Volume2, VolumeX, Maximize, Minimize
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

/**
 * WebGL Shader Programs for Chroma Key Effect
 */
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform vec3 u_keyColor;
  uniform float u_threshold;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float diff = length(color.rgb - u_keyColor);
    gl_FragColor = diff < u_threshold ? vec4(0.0) : color;
  }
`;

/**
 * Helper function to create and compile a WebGL shader
 */
const initShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/**
 * Initialize WebGL context for chroma key effect
 */
const initWebGL = (gl: WebGLRenderingContext) => {
  const program = gl.createProgram()!;
  gl.attachShader(program, initShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    program,
    texture,
    imageLocation: gl.getUniformLocation(program, "u_image"),
    keyColorLocation: gl.getUniformLocation(program, "u_keyColor"),
    thresholdLocation: gl.getUniformLocation(program, "u_threshold"),
  };
};

/**
 * Video component with chroma key effect for AI interviewer
 */
const AIInterviewerVideo: React.FC<{ id: string }> = ({ id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  const webGLContext = useMemo(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const gl = canvas.getContext("webgl", {
        premultipliedAlpha: false,
        alpha: true,
      });
      if (gl) {
        glRef.current = gl;
        return initWebGL(gl);
      }
    }
    return null;
  }, [canvasRef.current]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const checkVideoReady = () => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          setIsVideoReady(true);
          video.removeEventListener("canplay", checkVideoReady);
        }
      };
      video.addEventListener("canplay", checkVideoReady);
      return () => video.removeEventListener("canplay", checkVideoReady);
    }
  }, []);

  useEffect(() => {
    if (!isVideoReady || !webGLContext) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!video || !canvas || !gl) return;

    const {
      program,
      texture,
      imageLocation,
      keyColorLocation,
      thresholdLocation,
    } = webGLContext;

    let animationFrameId: number;
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const applyChromaKey = (currentTime: number) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(applyChromaKey);
        return;
      }

      lastFrameTime = currentTime;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );

        gl.uniform1i(imageLocation, 0);
        gl.uniform3f(keyColorLocation, 3 / 255, 255 / 255, 156 / 255);
        gl.uniform1f(thresholdLocation, 0.3);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(applyChromaKey);
    };

    applyChromaKey(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl && program && texture) {
        gl.deleteProgram(program);
        gl.deleteTexture(texture);
      }
    };
  }, [isVideoReady, webGLContext]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
      <DailyVideo
        sessionId={id}
        type="video"
        ref={videoRef}
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* AI Interviewer Label */}
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
  );
};

/**
 * Main video call component
 */
interface TavusVideoCallProps {
  onLeave: () => void;
  className?: string;
}

const TavusVideoCall: React.FC<TavusVideoCallProps> = ({ onLeave, className = '' }) => {
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const localParticipantId = useLocalSessionId();
  const localAudio = useAudioTrack(localParticipantId);
  const daily = useDaily();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const isMicEnabled = !localAudio.isOff;

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled);
  };

  const toggleVideo = () => {
    daily?.setLocalVideo(!daily?.localVideo());
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    // This would control the AI interviewer's audio
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(console.error);
    }
  };

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Main video area */}
      <div className="relative w-full h-full min-h-[500px]">
        {remoteParticipantIds.length > 0 ? (
          <AIInterviewerVideo id={remoteParticipantIds[0]} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connecting to AI Interviewer</h3>
              <p className="text-gray-400">Please wait while we establish the connection...</p>
            </div>
          </div>
        )}
        
        {/* Local video feed */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <DailyVideo
            sessionId={localParticipantId || ''}
            type="video"
            mirror={true}
            className="w-full h-full object-cover"
          />
          
          {/* Local video label */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
            You
          </div>
          
          {/* Media status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            <div className={`w-2 h-2 rounded-full ${daily?.localVideo() ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </div>
        
        {/* Connection status */}
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm font-medium text-green-400">Connected</span>
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
                daily?.localVideo() 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {daily?.localVideo() ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={toggleMicrophone}
              variant="ghost"
              size="sm"
              className={`p-3 rounded-full ${
                isMicEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
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
          
          {/* Center - Interview status */}
          <div className="text-white text-sm font-medium">
            AI Interview Session
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
              onClick={onLeave}
              variant="destructive"
              size="sm"
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Daily Audio component for audio handling */}
      <DailyAudio />
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Settings</DialogTitle>
            <DialogDescription>
              Adjust your video and audio settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Media Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Camera</span>
                  <Badge variant={daily?.localVideo() ? "default" : "destructive"}>
                    {daily?.localVideo() ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone</span>
                  <Badge variant={isMicEnabled ? "default" : "destructive"}>
                    {isMicEnabled ? 'On' : 'Off'}
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

export default TavusVideoCall;