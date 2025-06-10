import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code, Briefcase, User, Clock, Check, ChevronRight, ChevronLeft, 
  MessageSquare, Users, Phone, Plus, Trash2, Info, Lightbulb, 
  CheckCircle, ArrowRight, Smartphone, Laptop, Building, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { interviewTips } from '../data/feedback';
import { useAuth } from '../hooks/useAuth';
import { fetchInterviewTypes, fetchExperienceLevels, fetchDifficultyLevels } from '../lib/utils';
import { createInterview, InterviewFormData } from '../services/InterviewService';
import { getInterviewRounds } from '../lib/tavus';
import BackButton from '../components/layout/BackButton';
import Breadcrumb from '../components/layout/Breadcrumb';

interface InterviewType {
  id?: number;
  type: string;
  title: string;
  description: string;
  icon: string;
}

interface LevelOption {
  id?: number;
  value: string;
  label: string;
}

interface InterviewMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rounds: string[];
  duration: number;
}

interface InterviewRound {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  isSelected?: boolean;
  count?: number;
}

const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<LevelOption[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<LevelOption[]>([]);
  const [availableRounds, setAvailableRounds] = useState<any[]>([]);
  const [interviewModes, setInterviewModes] = useState<InterviewMode[]>([]);
  const [customRounds, setCustomRounds] = useState<InterviewRound[]>([]);
  
  // Suggestions for job titles and companies
  const jobTitleSuggestions = [
    'Software Engineer', 'Full Stack Developer', 'Backend Engineer', 
    'Frontend Engineer', 'Product Manager', 'UI/UX Designer'
  ];
  
  const companySuggestions = [
    'Google', 'Meta', 'Netflix', 'Amazon', 'Apple'
  ];
  
  const [formData, setFormData] = useState<InterviewFormData>({
    type: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20,
    interviewMode: '', // 'single' or 'complete'
    selectedRounds: [], // for custom selection
    roundDurations: {}, // durations for each round
  });
  
  // Define available round types
  const roundTypes: InterviewRound[] = [
    {
      id: 'phone-screening',
      type: 'screening',
      name: 'Phone Screening',
      description: 'Initial screening call with recruiter',
      icon: <Phone className="h-6 w-6" />,
      duration: 15,
      isSelected: false,
      count: 1
    },
    {
      id: 'technical',
      type: 'technical',
      name: 'Technical Round',
      description: 'Technical skills assessment',
      icon: <Code className="h-6 w-6" />,
      duration: 45,
      isSelected: false,
      count: 1
    },
    {
      id: 'behavioral',
      type: 'behavioral',
      name: 'Behavioral Round',
      description: 'Behavioral and cultural fit assessment',
      icon: <User className="h-6 w-6" />,
      duration: 30,
      isSelected: false,
      count: 1
    }
  ];
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [types, expLevels, diffLevels] = await Promise.all([
          fetchInterviewTypes(),
          fetchExperienceLevels(),
          fetchDifficultyLevels()
        ]);
        
        setInterviewTypes(types);
        setExperienceLevels(expLevels);
        setDifficultyLevels(diffLevels);
        
        // Load available Tavus rounds
        const rounds = getInterviewRounds();
        setAvailableRounds(rounds);
        
        // Setup interview modes based on available rounds
        const modes: InterviewMode[] = [
          {
            id: 'single',
            name: 'Single Round',
            description: 'Practice one specific interview round',
            icon: <User className="h-6 w-6" />,
            rounds: ['single'],
            duration: 20
          },
          {
            id: 'complete',
            name: 'Complete Interview',
            description: 'Full interview process with multiple rounds',
            icon: <Users className="h-6 w-6" />,
            rounds: roundTypes.map(r => r.id),
            duration: roundTypes.reduce((total, round) => total + round.duration, 0)
          }
        ];
        
        setInterviewModes(modes);
        
        // Initialize custom rounds with default selections
        setCustomRounds(roundTypes.map(round => ({
          ...round,
          isSelected: true
        })));
        
      } catch (error) {
        console.error('Error loading setup data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleModeSelect = (mode: string) => {
    setFormData(prev => ({ 
      ...prev, 
      interviewMode: mode,
      // Reset duration based on mode
      duration: mode === 'complete' 
        ? customRounds.filter(r => r.isSelected).reduce((total, round) => total + (round.duration * (round.count || 1)), 0)
        : 20
    }));
    
    // If single mode is selected, reset to step 2
    if (mode === 'single') {
      setStep(2);
    } else {
      // For complete mode, go directly to step 3 (job details)
      setStep(3);
    }
  };
  
  const handleRoundTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    
    // Move to next step
    setStep(3);
  };
  
  const handleRoundToggle = (roundId: string) => {
    setCustomRounds(prev => 
      prev.map(round => 
        round.id === roundId 
          ? { ...round, isSelected: !round.isSelected }
          : round
      )
    );
    
    // Update selected rounds in form data
    const updatedRounds = customRounds.map(round => 
      round.id === roundId ? { ...round, isSelected: !round.isSelected } : round
    );
    
    setFormData(prev => ({
      ...prev,
      selectedRounds: updatedRounds.filter(r => r.isSelected).map(r => r.id),
      duration: updatedRounds.filter(r => r.isSelected).reduce((total, round) => 
        total + (round.duration * (round.count || 1)), 0)
    }));
  };
  
  const handleAddRound = (roundId: string) => {
    setCustomRounds(prev => 
      prev.map(round => 
        round.id === roundId 
          ? { ...round, count: (round.count || 1) + 1 }
          : round
      )
    );
    
    // Update duration in form data
    const updatedRounds = customRounds.map(round => 
      round.id === roundId ? { ...round, count: (round.count || 1) + 1 } : round
    );
    
    setFormData(prev => ({
      ...prev,
      duration: updatedRounds.filter(r => r.isSelected).reduce((total, round) => 
        total + (round.duration * (round.count || 1)), 0)
    }));
  };
  
  const handleRemoveRound = (roundId: string) => {
    setCustomRounds(prev => 
      prev.map(round => 
        round.id === roundId && (round.count || 1) > 1
          ? { ...round, count: (round.count || 1) - 1 }
          : round
      )
    );
    
    // Update duration in form data
    const updatedRounds = customRounds.map(round => 
      round.id === roundId && (round.count || 1) > 1 
        ? { ...round, count: (round.count || 1) - 1 } 
        : round
    );
    
    setFormData(prev => ({
      ...prev,
      duration: updatedRounds.filter(r => r.isSelected).reduce((total, round) => 
        total + (round.duration * (round.count || 1)), 0)
    }));
  };
  
  const handleRoundDurationChange = (roundId: string, duration: number) => {
    // Update round duration in custom rounds
    setCustomRounds(prev => 
      prev.map(round => 
        round.id === roundId 
          ? { ...round, duration }
          : round
      )
    );
    
    // Update round durations in form data
    setFormData(prev => ({
      ...prev,
      roundDurations: {
        ...prev.roundDurations,
        [roundId]: duration
      },
      duration: customRounds
        .filter(r => r.isSelected)
        .reduce((total, round) => 
          total + ((round.id === roundId ? duration : round.duration) * (round.count || 1)), 0)
    }));
  };
  
  const handleSuggestionClick = (field: 'role' | 'company', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit and navigate to interview
      setSubmitting(true);
      try {
        if (user) {
          // Prepare form data with selected rounds
          const interviewData = {
            ...formData,
            selectedRounds: customRounds
              .filter(r => r.isSelected)
              .flatMap(r => Array(r.count || 1).fill(r.id))
          };
          
          const interview = await createInterview(user.id, interviewData);
          navigate(`/interview/${interview.id}`);
        }
      } catch (error) {
        console.error('Error creating interview:', error);
        // Handle error - show message to user
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const isStepValid = () => {
    if (step === 1) return formData.interviewMode !== '';
    if (step === 2) {
      if (formData.interviewMode === 'single') return formData.type !== '';
      return customRounds.some(r => r.isSelected);
    }
    if (step === 3) return formData.role !== '';
    return true;
  };
  
  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="h-6 w-6" />;
      case 'User':
        return <User className="h-6 w-6" />;
      case 'Briefcase':
        return <Briefcase className="h-6 w-6" />;
      default:
        return <Code className="h-6 w-6" />;
    }
  };
  
  // Calculate total duration for complete interview
  const getTotalDuration = useCallback(() => {
    return customRounds
      .filter(r => r.isSelected)
      .reduce((total, round) => total + (round.duration * (round.count || 1)), 0);
  }, [customRounds]);
  
  // Get sidebar content based on current step
  const getSidebarContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Interview Mode</h3>
            <p className="text-sm text-gray-600">
              Choose between a single round or a complete multi-round interview experience.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Complete Interview</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The complete interview option simulates a real hiring process with multiple rounds, giving you the most comprehensive practice experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return formData.interviewMode === 'single' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Round Type</h3>
            <p className="text-sm text-gray-600">
              Select the specific type of interview round you want to practice.
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium">Phone Screening</p>
                </div>
                <p className="text-xs text-blue-700 mt-1 ml-6">
                  Initial call to assess basic qualifications and fit
                </p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-800">
                  <Code className="h-4 w-4 text-indigo-600" />
                  <p className="text-sm font-medium">Technical Round</p>
                </div>
                <p className="text-xs text-indigo-700 mt-1 ml-6">
                  In-depth assessment of technical skills and problem-solving
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-800">
                  <User className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium">Behavioral Round</p>
                </div>
                <p className="text-xs text-purple-700 mt-1 ml-6">
                  Evaluation of soft skills, cultural fit, and past experiences
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customize Rounds</h3>
            <p className="text-sm text-gray-600">
              Select which rounds to include in your complete interview process.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Pro Tip</p>
                  <p className="text-xs text-blue-700 mt-1">
                    You can add multiple technical rounds to simulate different interviewers or focus areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
            <p className="text-sm text-gray-600">
              Provide information about the position you're interviewing for to make the simulation more realistic.
            </p>
            <div className="mt-4 space-y-3">
              {formData.role && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 text-green-800">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">{formData.role}</p>
                  </div>
                  {formData.company && (
                    <p className="text-xs text-green-700 mt-1 ml-6">
                      at {formData.company}
                    </p>
                  )}
                </div>
              )}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Why this matters</p>
                    <p className="text-xs text-blue-700 mt-1">
                      The AI interviewer will tailor questions based on the role, company, and experience level you specify.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Duration Settings</h3>
            <p className="text-sm text-gray-600">
              Configure how long each interview round should last.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Recommended Durations</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Phone Screening: 15-20 minutes</li>
                    <li>• Technical Round: 45-60 minutes</li>
                    <li>• Behavioral Round: 30-45 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
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
        <Breadcrumb />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold mb-2">Setup Interview</h1>
          <p className="text-gray-600">
            Configure your AI interview session based on your needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-8">
                  {/* Progress indicator */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step > 1 ? <Check className="h-5 w-5" /> : 1}
                      </div>
                      <div className={`h-1 flex-1 mx-2 ${
                        step > 1 ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step > 2 ? <Check className="h-5 w-5" /> : 2}
                      </div>
                      <div className={`h-1 flex-1 mx-2 ${
                        step > 2 ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step > 3 ? <Check className="h-5 w-5" /> : 3}
                      </div>
                      <div className={`h-1 flex-1 mx-2 ${
                        step > 3 ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        4
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>Interview Mode</span>
                      <span>Round Type</span>
                      <span>Job Details</span>
                      <span>Duration</span>
                    </div>
                  </div>
                  
                  {/* Step 1: Interview Mode */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Select Interview Mode</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {interviewModes.map((mode) => (
                          <div
                            key={mode.id}
                            className={`border rounded-lg p-6 cursor-pointer transition-all ${
                              formData.interviewMode === mode.id
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleModeSelect(mode.id)}
                          >
                            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                              formData.interviewMode === mode.id ? 'bg-primary/20' : 'bg-gray-100'
                            }`}>
                              <div className={formData.interviewMode === mode.id ? 'text-primary' : 'text-gray-600'}>
                                {mode.icon}
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{mode.name}</h3>
                            <p className="text-gray-600 mb-4">{mode.description}</p>
                            
                            {mode.id === 'complete' && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                <span>Multiple interview rounds</span>
                              </div>
                            )}
                            
                            {mode.id === 'single' && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                <span>Focus on one specific round</span>
                              </div>
                            )}
                            
                            {formData.interviewMode === mode.id && (
                              <div className="mt-4 text-primary text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Selected
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Round Type Selection */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formData.interviewMode === 'single' ? (
                        <>
                          <h2 className="text-xl font-semibold mb-6">Select Round Type</h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {roundTypes.map((round) => (
                              <div
                                key={round.id}
                                className={`border rounded-lg p-5 cursor-pointer transition-all ${
                                  formData.type === round.type
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => handleRoundTypeSelect(round.type)}
                              >
                                <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center ${
                                  formData.type === round.type ? 'bg-primary/20' : 'bg-gray-100'
                                }`}>
                                  <div className={formData.type === round.type ? 'text-primary' : 'text-gray-600'}>
                                    {round.icon}
                                  </div>
                                </div>
                                <h3 className="font-medium mb-1">{round.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{round.description}</p>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{round.duration} minutes</span>
                                </div>
                                
                                {formData.type === round.type && (
                                  <div className="mt-3 text-primary text-sm font-medium flex items-center gap-1">
                                    <Check className="h-4 w-4" />
                                    Selected
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold mb-6">Customize Interview Rounds</h2>
                          
                          <p className="text-gray-600 mb-6">
                            Your complete interview will include the following rounds. You can customize which rounds to include.
                          </p>
                          
                          <div className="space-y-4 mb-8">
                            {customRounds.map((round) => (
                              <div 
                                key={round.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      {round.icon}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{round.name}</h3>
                                      <p className="text-sm text-gray-600">{round.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {round.isSelected && (round.count || 1) > 1 && (
                                      <Badge variant="outline" className="bg-blue-50">
                                        {round.count}x
                                      </Badge>
                                    )}
                                    
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={round.isSelected}
                                        onChange={() => handleRoundToggle(round.id)}
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus: