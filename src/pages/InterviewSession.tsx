import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTavusVideoMeeting } from '../hooks/useTavusVideoMeeting';
import { 
  Clock, X, AlertCircle, PauseCircle, PlayCircle, Settings, ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getInterview, completeInterview } from '../services/InterviewService';
import { useMediaAccess } from '../hooks/useMediaAccess';
import TavusVideoCall from '../components/interview/TavusVideoCall';
import VideoInterviewSetup from '../components/interview/VideoInterviewSetup';
import TavusVideoMeeting from '../components/interview/TavusVideoMeeting';
import BackButton from '../components/layout/BackButton';
import Breadcrumb from '../components/layout/Breadcrumb';

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
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  
  // Tavus video call integration
  const {
    conversationUrl,
    isLoading: videoLoading,
    error: videoError,
    isConnected,
    endConversation
  } = useTavusVideoMeeting({
    interviewType: interviewData?.interview_types?.type || 'technical',
    participantName: 'Candidate',
    role: interviewData?.role || 'Software Engineer',
    company: interviewData?.company || undefined
  });

  // Use isConnected from Tavus
  const isConversationActive = isConnected;
  
  // Media access for user video/audio
  const {
    cleanup: cleanupMedia
  } = useMediaAccess();
  
  // Handle video setup completion
  const handleVideoSetupComplete = (url: string) => {
    console.log('Video setup completed with URL:', url);
    setShowVideoSetup(false);
  };

  const handleVideoError = (error: string) => {
    console.error('Video error:', error);
    // Don't show error dialog for demo mode message
    if (error.includes('demo mode')) {
      console.log('Using demo mode, continuing with mock interview');
    }
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

  const handleCompleteInterview = async () => {
    try {
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

  const handleEndCallRequest = () => {
    setShowEndCallConfirm(true);
  };

  const confirmEndCall = async () => {
    setShowEndCallConfirm(false);
    await handleCompleteInterview();
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
          <Breadcrumb />
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold mb-6">Interview Setup</h1>
          <VideoInterviewSetup
            interviewType={interviewData.interview_types?.type || 'technical'}
            participantName="Candidate"
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
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div>
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
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Exit interview"
            >
              <X className="h-5 w-5" />
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
      
      {/* Main video area - now full width */}
      <div className="pt-16 min-h-screen">
        <div className="h-full p-4">
          <TavusVideoMeeting
            conversationUrl={conversationUrl || ''}
            participantName="Candidate"
            onMeetingEnd={handleEndCallRequest}
            onError={handleVideoError}
            className="w-full h-[calc(100vh-6rem)]"
          />
          
          {isPaused && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
              <div className="text-center">
                <PauseCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interview Paused</h3>
                <p className="text-gray-400 mb-6">Take a moment to collect your thoughts</p>
                <Button
                  onClick={togglePause}
                  variant="interview"
                  className="flex-1 text-base"
                >
                  <PlayCircle className="h-5 w-5" />
                  Resume Interview
                </Button>
              </div>
            </div>
          )}
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
      
      {/* End Call Confirmation Dialog */}
      <Dialog open={showEndCallConfirm} onOpenChange={setShowEndCallConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this interview? This will complete the session and generate your feedback report.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => setShowEndCallConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Continue Interview
            </Button>
            <Button
              onClick={confirmEndCall}
              variant="interview"
              className="flex-1 font-medium"
            >
              End & Get Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main component - no longer needs DailyProvider
const InterviewSession: React.FC = () => {
  return <InterviewSessionContent />;
};

export default InterviewSession;