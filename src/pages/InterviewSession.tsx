import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, 
  Clock, X, AlertCircle, PauseCircle, PlayCircle, Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getInterview, completeInterview } from '../services/InterviewService';
import { useTavusInterview } from '../hooks/useTavusInterview';
import TavusVideoPlayer from '../components/interview/TavusVideoPlayer';

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

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  
  // Tavus integration
  const {
    conversation,
    isLoading: tavusLoading,
    error: tavusError,
    startConversation,
    endConversation,
    isConversationActive,
    isMockMode
  } = useTavusInterview({
    interviewType: interviewData?.interview_types?.type,
    role: interviewData?.role,
    difficulty: interviewData?.difficulty_levels?.value,
    autoStart: false // We'll start manually after loading interview data
  });
  
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

  // Start Tavus conversation when interview data is loaded
  useEffect(() => {
    if (interviewData && !conversation && !tavusLoading && !loading) {
      startConversation();
    }
  }, [interviewData, conversation, tavusLoading, loading, startConversation]);
  
  // Timer countdown
  useEffect(() => {
    if (!loading && !isPaused && timeRemaining > 0 && isConversationActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, isPaused, timeRemaining, isConversationActive]);
  
  const handleNextQuestion = async () => {
    if (!interviewData) return;
    
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
      // End Tavus conversation
      if (conversation) {
        await endConversation();
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
  
  const toggleMic = () => {
    setMicEnabled(!micEnabled);
  };
  
  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };
  
  const confirmExit = async () => {
    if (conversation) {
      await endConversation();
    }
    navigate('/dashboard');
  };

  const handleTavusVideoReady = () => {
    console.log('Tavus video is ready');
  };

  const handleTavusVideoError = (error: string) => {
    console.error('Tavus video error:', error);
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
            <TavusVideoPlayer
              conversationUrl={conversation?.conversation_url}
              isLoading={tavusLoading || !conversation}
              error={tavusError || undefined}
              onVideoReady={handleTavusVideoReady}
              onVideoError={handleTavusVideoError}
              className="w-full h-full min-h-[400px]"
            />
            
            {/* Interview info overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-gray-900 bg-opacity-75 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">AI Interviewer</p>
                <p className="text-sm text-gray-400">
                  {interviewData.interview_types?.title || 'General'} Interview
                  {isMockMode && ' (Demo)'}
                </p>
              </div>
            </div>
            
            {/* Self video placeholder */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600">
              {videoEnabled ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Your Video</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
            
            {isPaused && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
                <div className="text-center">
                  <PauseCircle className="h-16 w-16 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Interview Paused</h3>
                  <p className="text-gray-400 mb-6">Take a moment to collect your thoughts</p>
                  <Button
                    onClick={togglePause}
                    className="inline-flex items-center gap-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Resume Interview
                  </Button>
                </div>
              </div>
            )}
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
              
              {micEnabled && isConversationActive ? (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="audio-visualizer flex items-end justify-center h-12 mb-3 gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className="bg-primary-500 w-1 rounded-full"
                        style={{ 
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                  <p className="text-gray-300">
                    {isMockMode ? 'Demo: Simulating audio input...' : 'Listening to your response...'}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <MicOff className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {isConversationActive ? 'Microphone is disabled' : 'Waiting for interview to start...'}
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
              onClick={toggleMic}
              className={`p-3 rounded-full ${
                micEnabled ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
              } transition-colors`}
              aria-label={micEnabled ? "Disable microphone" : "Enable microphone"}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                videoEnabled ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
              } transition-colors`}
              aria-label={videoEnabled ? "Disable video" : "Enable video"}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            
            <button
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Show transcript"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
          
          <Button
            onClick={handleNextQuestion}
            className="btn-primary"
            disabled={!isConversationActive && !isMockMode}
          >
            {currentQuestion < interviewData.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </Button>
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
    </div>
  );
};

export default InterviewSession;