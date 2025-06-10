import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, ThumbsUp, ThumbsDown, Award, 
  BarChart2, ArrowUpRight, Download, Share2, Clock, MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getFeedback } from '../services/InterviewService';
import { getScoreColor, getScoreTextColor, getScoreBackgroundColor, getScoreRating } from '../lib/utils';
import { nextStepsRecommendations } from '../data/feedback';
import BackButton from '../components/layout/BackButton';
import Breadcrumb from '../components/layout/Breadcrumb';

interface FeedbackData {
  interviewId: string;
  title: string;
  date: string;
  duration: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionResponses: {
    question: string;
    analysis: string;
    score: number;
    feedback: string;
  }[];
  skillAssessment: {
    technical: {
      score: number;
      feedback: string;
    };
    communication: {
      score: number;
      feedback: string;
    };
    problemSolving: {
      score: number;
      feedback: string;
    };
    experience: {
      score: number;
      feedback: string;
    };
  };
}

const FeedbackAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getFeedback(id);
          setFeedbackData(data);
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
      } finally {
        // Simulate a minimum loading time for better UX
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    
    loadFeedback();
  }, [id]);
  
  if (loading || !feedbackData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Analyzing Your Interview</h2>
          <p className="text-gray-600">Generating comprehensive feedback...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom mx-auto">
        <Breadcrumb />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
          <p className="text-gray-600">
            {feedbackData.title} • {new Date(feedbackData.date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      className={`px-6 py-4 font-medium text-sm ${
                        activeTab === 'summary'
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('summary')}
                    >
                      Summary
                    </button>
                    <button
                      className={`px-6 py-4 font-medium text-sm ${
                        activeTab === 'questions'
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('questions')}
                    >
                      Question Analysis
                    </button>
                    <button
                      className={`px-6 py-4 font-medium text-sm ${
                        activeTab === 'skills'
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('skills')}
                    >
                      Skills Assessment
                    </button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  {/* Summary Tab */}
                  {activeTab === 'summary' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-3">Overall Performance</h2>
                        <p className="text-gray-700 mb-6">{feedbackData.summary}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                              <ThumbsUp className="h-5 w-5" />
                              Strengths
                            </h3>
                            <ul className="space-y-2">
                              {feedbackData.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                    <span className="text-green-700 text-xs">✓</span>
                                  </div>
                                  <span className="text-gray-700">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-3 text-amber-700 flex items-center gap-2">
                              <ThumbsDown className="h-5 w-5" />
                              Areas for Improvement
                            </h3>
                            <ul className="space-y-2">
                              {feedbackData.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                    <span className="text-amber-700 text-xs">!</span>
                                  </div>
                                  <span className="text-gray-700">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="font-medium mb-4">Key Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MetricCard 
                            label="Overall Score" 
                            value={`${feedbackData.overallScore}%`} 
                            icon={<Award className="h-5 w-5 text-primary-600" />}
                          />
                          <MetricCard 
                            label="Duration" 
                            value={`${feedbackData.duration} min`} 
                            icon={<Clock className="h-5 w-5 text-primary-600" />}
                          />
                          <MetricCard 
                            label="Questions" 
                            value={feedbackData.questionResponses.length.toString()} 
                            icon={<MessageSquare className="h-5 w-5 text-primary-600" />}
                          />
                          <MetricCard 
                            label="Top Skill" 
                            value="Communication" 
                            icon={<Star className="h-5 w-5 text-primary-600" />}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Question Analysis Tab */}
                  {activeTab === 'questions' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-6">
                        {feedbackData.questionResponses.map((response, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">Question {index + 1}</h3>
                                <Badge variant={response.score >= 90 ? "success" : response.score >= 70 ? "default" : "warning"}>
                                  Score: {response.score}%
                                </Badge>
                              </div>
                              <p className="mt-2 text-gray-800">{response.question}</p>
                            </div>
                            <div className="p-4">
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Analysis</h4>
                                <p className="text-sm text-gray-600">{response.analysis}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                                <p className="text-sm text-gray-600">{response.feedback}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Skills Assessment Tab */}
                  {activeTab === 'skills' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
                        
                        <div className="space-y-6">
                          <SkillBar 
                            label="Technical Knowledge" 
                            score={feedbackData.skillAssessment.technical.score} 
                            feedback={feedbackData.skillAssessment.technical.feedback}
                          />
                          
                          <SkillBar 
                            label="Communication" 
                            score={feedbackData.skillAssessment.communication.score} 
                            feedback={feedbackData.skillAssessment.communication.feedback}
                          />
                          
                          <SkillBar 
                            label="Problem Solving" 
                            score={feedbackData.skillAssessment.problemSolving.score} 
                            feedback={feedbackData.skillAssessment.problemSolving.feedback}
                          />
                          
                          <SkillBar 
                            label="Experience" 
                            score={feedbackData.skillAssessment.experience.score} 
                            feedback={feedbackData.skillAssessment.experience.feedback}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">AI-Powered Recommendation</h3>
                        <p className="text-gray-700 text-sm">
                          Based on your performance, we recommend focusing on improving your system design skills and practicing more complex technical scenarios. Consider reviewing our advanced system design course and practicing with more challenging interview questions.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg">Overall Score</h3>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <BarChart2 className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={getScoreColor(feedbackData.overallScore)}
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 45 * feedbackData.overallScore / 100} ${2 * Math.PI * 45 * (1 - feedbackData.overallScore / 100)}`}
                          strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{feedbackData.overallScore}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg font-medium">
                      {getScoreRating(feedbackData.overallScore)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Better than 75% of candidates
                    </p>
                  </div>
                  
                  <div className="flex justify-between gap-3">
                    <Button variant="default" className="flex-1 flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <ul className="space-y-3">
                    {nextStepsRecommendations.map((step, index) => (
                      <li key={index}>
                        <Link 
                          to={step.link} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium">{step.title}</span>
                          <ArrowUpRight className="h-4 w-4 text-gray-600" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      asChild
                      variant="default"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Link to="/setup">
                        Schedule New Interview
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
};

interface SkillBarProps {
  label: string;
  score: number;
  feedback: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ label, score, feedback }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{label}</span>
        <span className={`text-sm font-medium ${getScoreTextColor(score)}`}>{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full ${getScoreBackgroundColor(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">{feedback}</p>
    </div>
  );
};

// Helper components
const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default FeedbackAnalysis;