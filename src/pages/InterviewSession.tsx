import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, 
  Clock, X, AlertCircle, PauseCircle, PlayCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { mockQuestions } from '../data/questions';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  
  // Mock interview data - in a real app this would come from API based on interview ID
  const interviewData = {
    title: 'Frontend Developer Interview',
    company: 'Tech Solutions Inc.',
    interviewer: {
      name: 'Alex Chen',
      role: 'Senior Frontend Engineer',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    questions: mockQuestions.technical,
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Simulate loading the interview data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Timer countdown
  useEffect(() => {
    if (!loading && !isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, isPaused, timeRemaining]);
  
  const handleNextQuestion = () => {
    if (currentQuestion < interviewData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // End interview and go to feedback
      navigate(`/feedback/${id}`);
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
  
  const confirmExit = () => {
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
          </div>
        </div>
      </div>
      
      <div className="pt-16 pb-24 min-h-screen flex flex-col">
        <div className="flex-1 container-custom mx-auto flex flex-col md:flex-row gap-4 p-4">
          {/* Video area */}
          <div className="md:w-2/3 bg-gray-800 rounded-xl overflow-hidden relative">
            {videoEnabled ? (
              <div 
                className="w-full h-full min-h-[400px]"
                style={{
                  backgroundImage: `url(${interviewData.interviewer.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>
            ) : (
              <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-700">
                <div className="text-center">
                  <VideoOff className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Video is disabled</p>
                </div>
              </div>
            )}
            
            {/* Interviewer info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-gray-900 bg-opacity-75 p-2 rounded-lg">
              <img 
                src={interviewData.interviewer.avatar} 
                alt={interviewData.interviewer.name} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{interviewData.interviewer.name}</p>
                <p className="text-sm text-gray-400">{interviewData.interviewer.role}</p>
              </div>
            </div>
            
            {/* Self video */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600">
              {videoEnabled ? (
                <div className="w-full h-full bg-gray-800"></div>
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
                  {interviewData.questions[currentQuestion].text}
                </p>
                
                <div className="bg-gray-700 p-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-yellow-500 block mb-1">Hint:</span>
                    {interviewData.questions[currentQuestion].hint}
                  </p>
                </div>
              </motion.div>
              
              <div className="text-sm text-gray-400 mt-auto">
                Question {currentQuestion + 1} of {interviewData.questions.length}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Your Response</h2>
              
              {micEnabled ? (
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
                  <p className="text-gray-300">Listening to your response...</p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <MicOff className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Microphone is disabled</p>
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