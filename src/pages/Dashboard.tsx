import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Clock, CheckCircle, XCircle, BarChart2, ChevronRight, Calendar, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatDate, formatTime } from '../lib/utils';
import { getInterviews } from '../services/InterviewService';
import { interviewTips } from '../data/feedback';

interface Interview {
  id: string;
  title: string;
  company: string | null;
  scheduled_at: string;
  status: string;
  score: number | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInterviews = async () => {
      if (user) {
        try {
          const data = await getInterviews(user.id);
          setInterviews(data);
        } catch (error) {
          console.error('Failed to fetch interviews:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchInterviews();
  }, [user]);
  
  const upcomingInterviews = interviews.filter(
    interview => interview.status === 'scheduled'
  );
  
  const completedInterviews = interviews.filter(
    interview => interview.status === 'completed'
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user?.name}! Manage your interview practice sessions.
                </p>
              </div>
              <Button asChild variant="default" className="md:self-start">
                <Link to="/setup" className="gap-2 inline-flex items-center">
                  <PlusCircle className="h-4 w-4" /> New Interview
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-primary-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{upcomingInterviews.length}</div>
                <p className="text-xs text-gray-500">Scheduled interviews</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-success-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedInterviews.length}</div>
                <p className="text-xs text-gray-500">Completed interviews</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart2 className="h-4 w-4 text-accent-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {completedInterviews.length > 0
                    ? Math.round(
                        completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                          completedInterviews.length
                      )
                    : 0}%
                </div>
                <p className="text-xs text-gray-500">Performance score</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mb-8"
        >
          <Link to="/setup">
            <div className="group relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600"></div>
              
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-white rounded-full"
                    style={{
                      width: Math.random() * 100 + 50,
                      height: Math.random() * 100 + 50,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.1,
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
                <div>
                  <Badge variant="default" className="bg-white/20 text-white border-none mb-3">New Interview</Badge>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white">Ready for your next interview?</h3>
                  <p className="text-white/90 max-w-lg">Set up a new interview simulation with our AI and prepare for success</p>
                </div>
                <Button variant="white" size="lg" className="mt-4 md:mt-0 font-medium group-hover:shadow-md transition-all duration-300">
                  <span>Start now</span>
                  <PlusCircle className="ml-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                </Button>
              </div>
            </div>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'upcoming'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Interviews
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'completed'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed Interviews
                </button>
              </div>
            </div>
            
            <CardContent className="p-6">
              {activeTab === 'upcoming' && (
                <>
                  {upcomingInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingInterviews.map(interview => (
                        <motion.div
                          key={interview.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                          <div className="flex items-start md:items-center gap-4 mb-3 md:mb-0">
                            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center mt-1 md:mt-0">
                              <Calendar className="h-5 w-5 text-warning-600" />
                            </div>
                            <div>
                              <h4 className="font-medium group-hover:text-primary-700 transition-colors">{interview.title}</h4>
                              <p className="text-sm text-gray-600">{interview.company || 'No company specified'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDate(interview.scheduled_at)} at {formatTime(interview.scheduled_at)}
                              </span>
                            </div>
                            <Button asChild variant="default" size="sm">
                              <Link to={`/interview/${interview.id}`} className="flex items-center gap-1">
                                Start Interview
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No upcoming interviews scheduled</p>
                      <Button asChild>
                        <Link to="/setup" className="gap-2 inline-flex items-center">
                          <PlusCircle className="h-4 w-4" /> Schedule New Interview
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'completed' && (
                <>
                  {completedInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {completedInterviews.map(interview => (
                        <motion.div
                          key={interview.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                          <div className="flex items-start md:items-center gap-4 mb-3 md:mb-0">
                            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center mt-1 md:mt-0">
                              <CheckCircle className="h-5 w-5 text-success-500" />
                            </div>
                            <div>
                              <h4 className="font-medium group-hover:text-primary-700 transition-colors">{interview.title}</h4>
                              <p className="text-sm text-gray-600">{interview.company || 'No company specified'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
                            {interview.score && (
                              <Badge variant="success" className="h-6 flex items-center justify-center">
                                Score: {interview.score}%
                              </Badge>
                            )}
                            <div className="text-sm text-gray-600">
                              {formatDate(interview.scheduled_at)}
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/feedback/${interview.id}`} className="flex items-center gap-1">
                                View Feedback
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No completed interviews yet</p>
                      <Button asChild>
                        <Link to="/setup" className="gap-2 inline-flex items-center">
                          <PlusCircle className="h-4 w-4" /> Start Your First Interview
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Activities and Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your interview preparation progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Improved communication score by 12%</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                      <Award className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Completed your first technical interview</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                      <Badge className="h-4 w-4 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Earned 'Quick Learner' badge</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
                <CardDescription>Enhance your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewTips.slice(0, 3).map((tip, index) => (
                    <div key={index} className="p-3 rounded-lg border" 
                      style={{ 
                        backgroundColor: index === 0 ? 'rgb(239 246 255)' : index === 1 ? 'rgb(243 232 255)' : 'rgb(240 253 244)',
                        borderColor: index === 0 ? 'rgb(219 234 254)' : index === 1 ? 'rgb(233 213 255)' : 'rgb(220 252 231)'
                      }}>
                      <p className="text-sm" 
                        style={{ 
                          color: index === 0 ? 'rgb(30 64 175)' : index === 1 ? 'rgb(107 33 168)' : 'rgb(22 101 52)'
                        }}>
                        <span className="font-medium block">{tip.title}</span>
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;