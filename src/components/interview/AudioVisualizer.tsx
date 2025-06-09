import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioStream: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioStream,
  isRecording,
  className = ''
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  useEffect(() => {
    if (!audioStream || !isRecording) {
      // Reset to zero when not recording
      setAudioLevels(new Array(20).fill(0));
      return;
    }

    let animationFrame: number;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    try {
      // Create audio context and analyser
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);
          
          // Convert frequency data to visual levels
          const levels = [];
          const step = Math.floor(dataArray.length / 20);
          
          for (let i = 0; i < 20; i++) {
            const start = i * step;
            const end = Math.min(start + step, dataArray.length);
            let sum = 0;
            
            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }
            
            const average = sum / (end - start);
            levels.push(Math.min(100, (average / 255) * 100));
          }
          
          setAudioLevels(levels);
        }
        
        animationFrame = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioStream, isRecording]);

  return (
    <div className={`flex items-end justify-center h-12 gap-1 ${className}`}>
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className="bg-primary-500 w-1 rounded-full transition-all duration-100 ease-out"
          style={{
            height: `${Math.max(4, level)}%`,
            opacity: isRecording ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;