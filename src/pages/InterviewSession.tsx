import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DailyProvider } from '@daily-co/daily-react';
import { useDailyVideoCall } from '../hooks/useDailyVideoCall';
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, Shield,
  Clock, X, AlertCircle, PauseCircle, PlayCircle, Settings, ChevronRight, Users, Code
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getInterview, completeInterview } from '../services/InterviewService';
import { useMediaAccess } from '../hooks/useMediaAccess';
import TavusVideoCall from '../components/interview/TavusVideoCall';
import VideoInterviewSetup from '../components/interview/VideoInterviewSetup';
import TavusVideoMeeting from '../components/interview/TavusVideoMeeting';
import UserVideoFeed from '../components/interview/UserVideoFeed';
import AudioVisualizer from '../components/interview/AudioVisualizer';

interface Question {
  id: number;
  text: string;
  hint?: string;
}

interface InterviewData {
  id: string;
  title: string;
  company?: string | null;
  role: string;
  interview_types?: {
    type: string;
    title: string;
  };
  difficulty_levels?: {
    value: string;
    label: string;
  };
  questions: Question[];
  duration: number;
}

const InterviewSessionContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showVideoSetup, setShowVideoSetup] = useState(true);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);
  
  // Daily video call integration
  const {
    conversationUrl,
    isLoading: videoLoading,
    error: videoError,
    isConnected,
    endCall,
    dailyCall
  } = useDailyVideoCall({
    interviewType: interviewData?.interview_types?.type || 'technical',
    participantName: 'AI Interviewer',
    role: interviewData?.role,
    company: interviewData?.company || undefined
  });

  // Use isConnected from Daily call
  const isConversationActive = isConnected;
  
  // Media access for user video/audio
  const {
    hasVideoPermission,
    hasAudioPermission,
    videoStream,
    audioStream,
    isRequestingPermissions,
    error: mediaError,
    isRecording,
    requestPermissions,
    startRecording,
    stopRecording,
    toggleVideo,
    toggleAudio,
    cleanup: cleanupMedia
  } = useMediaAccess();
  
  // Debug media state
  useEffect(() => {
    console.log('Media state updated:', {
      hasVideoPermission,
      hasAudioPermission,
      hasVideoStream: !!videoStream,
      hasAudioStream: !!audioStream,
      isRecording
    });
  }, [hasVideoPermission, hasAudioPermission, videoStream, audioStream, isRecording]);
  
  // Handle video setup completion
  const handleVideoSetupComplete = (url: string) => {
    console.log('Video setup completed with URL:', url);
    setShowVideoSetup(false);
  };

  const handleVideoError = (error: string) => {
    console.error('Video error:', error);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Load interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getInterview(id);
          setInterviewData(data);
          
          // Set timer based on interview duration if available
          if (data.duration) {
            setTimeRemaining(data.duration * 60);
          }
        }
      } catch (error) {
        console.error('Error fetching interview data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviewData();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!loading && !isPaused && timeRemaining > 0 && isConversationActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, isPaused, timeRemaining, conversationUrl]);
  
  // Handle permissions request
  const handleRequestPermissions = async () => {
    try {
      console.log('Requesting permissions...');
      await requestPermissions();
      setHasRequestedPermissions(true);
      setShowPermissionsDialog(false);
      
      // Start conversation after permissions are granted
    } catch (error) {
      console.error('Failed to get permissions:', error);
    }
  };
  
  const handleSkipPermissions = () => {
    console.log('Skipping permissions');
    setHasRequestedPermissions(true);
    setShowPermissionsDialog(false);
    
  };
  
  const handleNextQuestion = async () => {
    if (!interviewData) return;
    
    // Stop recording and save audio for this question
    if (isRecording) {
      const audioBlob = stopRecording();
      if (audioBlob) {
        console.log('Saved audio for question', currentQuestion + 1, 'Size:', audioBlob.size);
        // Here you could upload the audio to your backend or process it
      }
    }
    // Save the response for the current question
    setResponses(prev => ({
      ...prev,
      [currentQuestion]: `Response for question ${currentQuestion + 1}`
    }));
    
    if (currentQuestion < interviewData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Last question, complete the interview
      await handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    try {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
      
      if (id && interviewData) {
        // Prepare mock feedback data
        const feedbackData = {
          overallScore: Math.floor(Math.random() * 30) + 70,
          questions: Object.entries(responses).map(([qIndex, response]) => {
            const questionIndex = Number(qIndex);
            const question = interviewData.questions[questionIndex];
            return {
              id: question.id,
              text: question.text,
              answer: response,
              score: Math.floor(Math.random() * 30) + 70,
              analysis: "The candidate showed good understanding of the topic.",
              feedback: "Consider providing more concrete examples next time."
            };
          }),
          feedback: {
            summary: "Overall good performance with room for improvement in specific areas.",
            overallScore: Math.floor(Math.random() * 30) + 70,
            strengths: ["Clear communication", "Good technical knowledge", "Structured answers"],
            improvements: ["More detailed examples", "Deeper technical explanations"],
            skillAssessment: {
              technical: { score: Math.floor(Math.random() * 30) + 70, feedback: "Good technical foundation." },
              communication: { score: Math.floor(Math.random() * 30) + 70, feedback: "Clear communication skills." },
              problemSolving: { score: Math.floor(Math.random() * 30) + 70, feedback: "Solid problem-solving approach." },
              experience: { score: Math.floor(Math.random() * 30) + 70, feedback: "Good experience demonstration." }
            }
          }
        };
        
        await completeInterview(id, feedbackData);
      }
      
      navigate(`/feedback/${id}`);
    } catch (error) {
      console.error('Error completing interview:', error);
      navigate(`/feedback/${id}`); // Navigate anyway for demo purposes
    }
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  const confirmExit = async () => {
    // Cleanup media streams
    cleanupMedia();
    
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Preparing Your Interview</h2>
        <p className="text-gray-400">Setting up the AI interviewer...</p>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Interview Not Found</h2>
        <p className="text-gray-400 mb-6">The interview session could not be loaded.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Show video setup if not completed
  if (showVideoSetup && interviewData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container-custom mx-auto">
          <VideoInterviewSetup
            interviewType={interviewData.interview_types?.type || 'technical'}
            participantName="AI Interviewer"
            role={interviewData.role}
            company={interviewData.company || undefined}
            onSetupComplete={handleVideoSetupComplete}
            onError={handleVideoError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top controls */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 py-3 px-4 z-20">
        <div className="container-custom mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Exit interview"
            >
              <X className="h-5 w-5" />
            </button>
            <h1 className="font-medium truncate">
              {interviewData.title} 
              {interviewData.company && <span className="text-gray-400"> • {interviewData.company}</span>}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className={`font-medium ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <button
              onClick={togglePause}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label={isPaused ? "Resume interview" : "Pause interview"}
            >
              {isPaused ? (
                <PlayCircle className="h-5 w-5 text-green-500" />
              ) : (
                <PauseCircle className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-16 pb-24 min-h-screen flex flex-col">
        <div className="flex-1 container-custom mx-auto flex flex-col md:flex-row gap-4 p-4">
          {/* Video area with Tavus integration */}
          <div className="md:w-2/3 relative">
            <TavusVideoMeeting
              conversationUrl={conversationUrl || ''}
              participantName="AI Interviewer"
              onMeetingEnd={() => navigate('/dashboard')}
              onError={handleVideoError}
              className="w-full h-full min-h-[400px]"
            />
          </div>
          
          {/* Question and response area */}
          <div className="md:w-1/3 flex flex-col">
            <div className="bg-gray-800 rounded-xl p-6 mb-4 flex-1">
              <h2 className="text-lg font-semibold mb-4">Current Question</h2>
              
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <p className="text-lg mb-4">
                  {interviewData.questions[currentQuestion]?.text}
                </p>
                
                {interviewData.questions[currentQuestion]?.hint && (
                  <div className="bg-gray-700 p-3 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-yellow-500 block mb-1">Hint:</span>
                      {interviewData.questions[currentQuestion].hint}
                    </p>
                  </div>
                )}
              </motion.div>
              
              <div className="text-sm text-gray-400 mt-auto">
                Question {currentQuestion + 1} of {interviewData.questions.length}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Your Response</h2>
              
              {hasAudioPermission && isConversationActive ? (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <AudioVisualizer
                    audioStream={audioStream}
                    isRecording={isRecording}
                    className="mb-3"
                  />
                  <p className="text-gray-300">
                    {isRecording 
                      ? 'Recording your response...'
                      : 'Ready to record your response'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <MicOff className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {isConversationActive 
                      ? 'Microphone access not granted'
                      : 'Waiting for interview to start...'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 py-4 px-4 z-20">
        <div className="container-custom mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log('Bottom audio button clicked');
                toggleAudio();
              }}
              className={`p-3 rounded-full ${
                hasAudioPermission ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
              } transition-colors`}
              aria-label={hasAudioPermission ? "Disable microphone" : "Enable microphone"}
            >
              {hasAudioPermission ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => {
                console.log('Bottom video button clicked');
                toggleVideo();
              }}
              className={`p-3 rounded-full ${
                hasVideoPermission ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
              } transition-colors`}
              aria-label={hasVideoPermission ? "Disable video" : "Enable video"}
            >
              {hasVideoPermission ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            
            <button
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Show transcript"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Show next round button if in complete interview mode */}
            {false && (
              <div className="text-sm text-gray-400">
                Round 1 of 1
              </div>
            )}
            
            <Button
              onClick={handleNextQuestion}
              className="btn-primary"
              disabled={!conversationUrl || isRequestingPermissions}
            >
              {currentQuestion < interviewData.questions.length - 1 
                ? 'Next Question' 
                  : 'Finish Interview'
              }
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4">End Interview?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this interview? Your progress will not be saved.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowExitConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Continue Interview
              </Button>
              <Button
                onClick={confirmExit}
                variant="destructive"
                className="flex-1"
              >
                End Interview
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Camera & Microphone Access
            </DialogTitle>
            <DialogDescription>
              To provide the best interview experience, we need access to your camera and microphone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Why we need these permissions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Camera:</strong> Show your video to the AI interviewer</li>
                <li>• <strong>Microphone:</strong> Record your responses for analysis</li>
                <li>• <strong>Privacy:</strong> All data stays on your device during the interview</li>
              </ul>
            </div>
            
            {mediaError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{mediaError}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRequestPermissions}
                disabled={isRequestingPermissions}
                className="w-full"
              >
                {isRequestingPermissions ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Requesting Access...
                  </div>
                ) : (
                  'Allow Camera & Microphone'
                )}
              </Button>
              
              <Button 
                onClick={handleSkipPermissions}
                variant="outline"
                className="w-full"
                disabled={isRequestingPermissions}
              >
                Continue Without Permissions
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              You can change these permissions later in your browser settings
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
// Main component wrapped with DailyProvider
const InterviewSession: React.FC = () => {
  return (
    <DailyProvider>
      <InterviewSessionContent />
    </DailyProvider>
  );
};

export default InterviewSession;