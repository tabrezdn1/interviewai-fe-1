import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code, Briefcase, User, Clock, Check, ChevronRight, ChevronLeft, 
  MessageSquare, Users, Phone, Calendar, Building, Cpu
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  isSelected: boolean;
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
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([
    {
      id: 'phone',
      name: 'Phone Screening',
      description: 'Initial screening call with recruiter',
      icon: <Phone className="h-6 w-6" />,
      duration: 15,
      isSelected: false
    },
    {
      id: 'technical',
      name: 'Technical Round',
      description: 'Technical skills assessment',
      icon: <Code className="h-6 w-6" />,
      duration: 45,
      isSelected: false
    },
    {
      id: 'behavioral',
      name: 'Behavioral Round',
      description: 'Behavioral and cultural fit assessment',
      icon: <User className="h-6 w-6" />,
      duration: 30,
      isSelected: false
    }
  ]);
  
  const [formData, setFormData] = useState<InterviewFormData>({
    type: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20,
    interviewMode: '', // 'complete' or 'single'
    selectedRounds: [], // for custom selection
    roundDurations: {
      phone: 15,
      technical: 45,
      behavioral: 30
    }
  });
  
  // Job title suggestions
  const jobTitleSuggestions = [
    'Software Engineer',
    'Full Stack Developer',
    'Backend Engineer',
    'Frontend Engineer',
    'Product Manager',
    'UI/UX Designer'
  ];
  
  // Company suggestions
  const companySuggestions = [
    'Google',
    'Meta',
    'Netflix',
    'Amazon',
    'Apple'
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
            description: 'Full interview process with all rounds',
            icon: <Users className="h-6 w-6" />,
            rounds: ['phone', 'technical', 'behavioral'],
            duration: 90
          }
        ];
        
        setInterviewModes(modes);
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
  
  const handleRoundDurationChange = (roundId: string, duration: number) => {
    setFormData(prev => ({
      ...prev,
      roundDurations: {
        ...prev.roundDurations,
        [roundId]: duration
      }
    }));
  };
  
  const handleModeSelect = (mode: string) => {
    setFormData(prev => {
      // Reset selected rounds when changing modes
      let selectedRounds: string[] = [];
      let totalDuration = 0;
      
      if (mode === 'complete') {
        // For complete mode, select all rounds
        selectedRounds = interviewRounds.map(round => round.id);
        
        // Calculate total duration from all rounds
        totalDuration = interviewRounds.reduce((total, round) => {
          return total + (prev.roundDurations[round.id] || round.duration);
        }, 0);
        
        // Update round selection state
        setInterviewRounds(interviewRounds.map(round => ({
          ...round,
          isSelected: true
        })));
      } else {
        // For single mode, reset to default duration
        totalDuration = 20;
        
        // Reset round selection state
        setInterviewRounds(interviewRounds.map(round => ({
          ...round,
          isSelected: false
        })));
      }
      
      return { 
        ...prev, 
        interviewMode: mode,
        selectedRounds,
        duration: totalDuration
      };
    });
  };
  
  const handleRoundSelect = (roundId: string) => {
    setInterviewRounds(prev => prev.map(round => ({
      ...round,
      isSelected: round.id === roundId ? !round.isSelected : round.isSelected
    })));
    
    setFormData(prev => {
      const isSelected = !interviewRounds.find(r => r.id === roundId)?.isSelected;
      let selectedRounds = [...prev.selectedRounds];
      
      if (isSelected && !selectedRounds.includes(roundId)) {
        selectedRounds.push(roundId);
      } else if (!isSelected) {
        selectedRounds = selectedRounds.filter(id => id !== roundId);
      }
      
      // Calculate total duration based on selected rounds
      const totalDuration = interviewRounds
        .filter(round => selectedRounds.includes(round.id))
        .reduce((total, round) => {
          return total + (prev.roundDurations[round.id] || round.duration);
        }, 0);
      
      return {
        ...prev,
        selectedRounds,
        duration: totalDuration || 20 // Default to 20 if no rounds selected
      };
    });
  };
  
  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit and navigate to interview
      setSubmitting(true);
      try {
        if (user) {
          const interview = await createInterview(user.id, formData);
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
      if (formData.interviewMode === 'single') {
        return interviewRounds.some(round => round.isSelected);
      }
      return true; // Complete mode is always valid for step 2
    }
    if (step === 3) return formData.role !== '';
    if (step === 4) {
      if (formData.interviewMode === 'single') {
        return formData.duration >= 10; // Minimum 10 minutes
      } else {
        // For complete mode, ensure all rounds have valid durations
        return interviewRounds
          .filter(round => round.isSelected)
          .every(round => formData.roundDurations[round.id] >= 5); // Minimum 5 minutes per round
      }
    }
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
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step > 1 ? <Check className="h-5 w-5" /> : 1}
                        </div>
                        <div className={`h-1 w-12 ${
                          step > 1 ? 'bg-primary-600' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step > 2 ? <Check className="h-5 w-5" /> : 2}
                        </div>
                        <div className={`h-1 w-12 ${
                          step > 2 ? 'bg-primary-600' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step > 3 ? <Check className="h-5 w-5" /> : 3}
                        </div>
                        <div className={`h-1 w-12 ${
                          step > 3 ? 'bg-primary-600' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
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
                  
                  {/* Step 1: Interview Mode Selection */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Select Interview Mode</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Complete Interview Option */}
                        <div
                          className={`border rounded-lg p-6 cursor-pointer transition-all ${
                            formData.interviewMode === 'complete'
                              ? 'border-primary-600 bg-primary-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleModeSelect('complete')}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              formData.interviewMode === 'complete' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">Complete Interview</h3>
                              <p className="text-gray-600 text-sm">Includes all interview rounds</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <Phone className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-sm">Phone Screening</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                <Code className="h-3 w-3 text-purple-600" />
                              </div>
                              <span className="text-sm">Technical Round</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-sm">Behavioral Round</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            Estimated duration: 90 minutes
                          </div>
                          
                          {formData.interviewMode === 'complete' && (
                            <div className="mt-4 text-primary-600 text-sm font-medium flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              Selected
                            </div>
                          )}
                        </div>
                        
                        {/* Single Round Option */}
                        <div
                          className={`border rounded-lg p-6 cursor-pointer transition-all ${
                            formData.interviewMode === 'single'
                              ? 'border-primary-600 bg-primary-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleModeSelect('single')}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              formData.interviewMode === 'single' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">Single Round</h3>
                              <p className="text-gray-600 text-sm">Focus on one specific round</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <p className="text-sm text-gray-600">
                              Choose from:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                              <li>Phone Screening</li>
                              <li>Technical Round</li>
                              <li>Behavioral Round</li>
                            </ul>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            Estimated duration: 20-45 minutes
                          </div>
                          
                          {formData.interviewMode === 'single' && (
                            <div className="mt-4 text-primary-600 text-sm font-medium flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              Selected
                            </div>
                          )}
                        </div>
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
                      <h2 className="text-xl font-semibold mb-6">
                        {formData.interviewMode === 'single' 
                          ? 'Select Round Type' 
                          : 'Customize Interview Rounds'}
                      </h2>
                      
                      {formData.interviewMode === 'single' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          {interviewRounds.map((round) => (
                            <div
                              key={round.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                round.isSelected
                                  ? 'border-primary-600 bg-primary-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                // For single mode, deselect all other rounds first
                                setInterviewRounds(interviewRounds.map(r => ({
                                  ...r,
                                  isSelected: false
                                })));
                                handleRoundSelect(round.id);
                              }}
                            >
                              <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center ${
                                round.isSelected ? 'bg-primary-100' : 'bg-gray-100'
                              }`}>
                                <div className={round.isSelected ? 'text-primary-600' : 'text-gray-600'}>
                                  {round.icon}
                                </div>
                              </div>
                              <h3 className="font-medium mb-1">{round.name}</h3>
                              <p className="text-sm text-gray-600">{round.description}</p>
                              {round.isSelected && (
                                <div className="mt-3 text-primary-600 text-sm font-medium flex items-center gap-1">
                                  <Check className="h-4 w-4" />
                                  Selected
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4 mb-8">
                          <p className="text-gray-600 mb-4">
                            Your complete interview will include the following rounds. You can customize which rounds to include.
                          </p>
                          
                          {interviewRounds.map((round) => (
                            <div
                              key={round.id}
                              className={`border rounded-lg p-4 transition-all ${
                                round.isSelected
                                  ? 'border-primary-200 bg-primary-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    round.isSelected ? 'bg-primary-100' : 'bg-gray-100'
                                  }`}>
                                    <div className={round.isSelected ? 'text-primary-600' : 'text-gray-400'}>
                                      {round.icon}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{round.name}</h3>
                                    <p className="text-sm text-gray-600">{round.description}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={round.isSelected}
                                      onChange={() => handleRoundSelect(round.id)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Step 3: Job Details */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Job Details</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title / Role
                          </label>
                          <input
                            type="text"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder="e.g. Software Engineer, Product Manager"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                            list="job-suggestions"
                          />
                          <datalist id="job-suggestions">
                            {jobTitleSuggestions.map((title, index) => (
                              <option key={index} value={title} />
                            ))}
                          </datalist>
                          
                          {/* Job title suggestions */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {jobTitleSuggestions.map((title, index) => (
                              <button
                                key={index}
                                type="button"
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                onClick={() => setFormData(prev => ({ ...prev, role: title }))}
                              >
                                {title}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                            Company (Optional)
                          </label>
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="e.g. Google, Amazon, Startup"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            list="company-suggestions"
                          />
                          <datalist id="company-suggestions">
                            {companySuggestions.map((company, index) => (
                              <option key={index} value={company} />
                            ))}
                          </datalist>
                          
                          {/* Company suggestions */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {companySuggestions.map((company, index) => (
                              <button
                                key={index}
                                type="button"
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                onClick={() => setFormData(prev => ({ ...prev, company }))}
                              >
                                {company}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Experience Level
                          </label>
                          <select
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Select experience level</option>
                            {experienceLevels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty Level
                          </label>
                          <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {difficultyLevels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 4: Duration Configuration */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Duration Configuration</h2>
                      
                      <div className="space-y-6">
                        {formData.interviewMode === 'complete' ? (
                          <div className="space-y-6">
                            <p className="text-gray-600">
                              Set the duration for each interview round:
                            </p>
                            
                            {interviewRounds.filter(round => round.isSelected).map((round) => (
                              <div key={round.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                      <div className="text-primary-600">
                                        {round.icon}
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{round.name}</h3>
                                      <p className="text-sm text-gray-600">{round.description}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <label className="text-sm font-medium text-gray-700">
                                    Duration (minutes):
                                  </label>
                                  <div className="flex-1 flex items-center gap-4">
                                    <input
                                      type="range"
                                      min="5"
                                      max="60"
                                      step="5"
                                      value={formData.roundDurations[round.id] || round.duration}
                                      onChange={(e) => handleRoundDurationChange(round.id, parseInt(e.target.value))}
                                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="w-12 text-center font-medium">
                                      {formData.roundDurations[round.id] || round.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-primary-600" />
                                  <span className="font-medium">Total Duration:</span>
                                </div>
                                <span className="font-bold text-lg">
                                  {interviewRounds
                                    .filter(round => round.isSelected)
                                    .reduce((total, round) => {
                                      return total + (formData.roundDurations[round.id] || round.duration);
                                    }, 0)} minutes
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                              Interview Duration (minutes)
                            </label>
                            <div className="flex items-center gap-4 mb-6">
                              <input
                                type="range"
                                name="duration"
                                min="10"
                                max="60"
                                step="5"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="w-12 text-center font-bold text-lg">{formData.duration}</span>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2 mb-4">
                              {[10, 20, 30, 45, 60].map((duration) => (
                                <button
                                  key={duration}
                                  type="button"
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    formData.duration === duration
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                  onClick={() => setFormData(prev => ({ ...prev, duration }))}
                                >
                                  {duration} min
                                </button>
                              ))}
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Recommended:</span> 20-30 minutes for most interview rounds. Longer durations allow for more in-depth discussions.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 p-4 rounded-lg mt-6">
                          <h3 className="font-medium mb-2">Interview Summary</h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex justify-between">
                              <span>Mode:</span>
                              <span className="font-medium text-gray-900">{formData.interviewMode === 'complete' ? 'Complete Interview' : 'Single Round'}</span>
                            </li>
                            {formData.interviewMode === 'single' && (
                              <li className="flex justify-between">
                                <span>Round:</span>
                                <span className="font-medium text-gray-900">
                                  {interviewRounds.find(r => r.isSelected)?.name || 'None selected'}
                                </span>
                              </li>
                            )}
                            {formData.interviewMode === 'complete' && (
                              <li className="flex justify-between">
                                <span>Rounds:</span>
                                <span className="font-medium text-gray-900">
                                  {interviewRounds.filter(r => r.isSelected).length} selected
                                </span>
                              </li>
                            )}
                            <li className="flex justify-between">
                              <span>Role:</span>
                              <span className="font-medium text-gray-900">{formData.role || 'Not specified'}</span>
                            </li>
                            {formData.company && (
                              <li className="flex justify-between">
                                <span>Company:</span>
                                <span className="font-medium text-gray-900">{formData.company}</span>
                              </li>
                            )}
                            <li className="flex justify-between">
                              <span>Experience Level:</span>
                              <span className="font-medium text-gray-900 capitalize">{formData.experience || 'Not specified'}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Difficulty:</span>
                              <span className="font-medium text-gray-900 capitalize">{formData.difficulty}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Total Duration:</span>
                              <span className="font-medium text-gray-900">
                                {formData.interviewMode === 'complete'
                                  ? interviewRounds
                                      .filter(round => round.isSelected)
                                      .reduce((total, round) => {
                                        return total + (formData.roundDurations[round.id] || round.duration);
                                      }, 0)
                                  : formData.duration} minutes
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-between">
                    {step > 1 ? (
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid() || submitting}
                      className={`flex items-center gap-2 ${step === 4 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105' : ''} ${
                        !isStepValid() || submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      variant={step === 4 ? 'interview' : 'default'}
                    >
                      {submitting && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      )}
                      {step < 4 ? 'Continue' : 'Start Interview'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Interview Guide</h3>
                  
                  {step === 1 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Choosing the Right Mode</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Users className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Complete Interview</span>
                            Simulates a full interview process with multiple rounds. Great for comprehensive practice.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <User className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Single Round</span>
                            Focus on one specific type of interview. Perfect for targeted practice.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Round Types Explained</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Phone className="h-3 w-3 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Phone Screening</span>
                            Initial call with a recruiter to assess basic qualifications and fit.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Code className="h-3 w-3 text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Technical Round</span>
                            In-depth assessment of technical skills, problem-solving, and domain knowledge.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <User className="h-3 w-3 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Behavioral Round</span>
                            Focuses on soft skills, past experiences, and cultural fit.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 3 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Job Details Tips</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Briefcase className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Be Specific</span>
                            The more specific your job title and company, the more tailored your interview will be.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Building className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Company Research</span>
                            Adding a company name will include company-specific questions in your interview.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Cpu className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Difficulty Level</span>
                            Choose a difficulty that matches your target position's seniority level.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 4 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Duration Guidelines</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Phone className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Phone Screening</span>
                            Typically 15-20 minutes. Focus on basic qualifications and fit.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Code className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Technical Round</span>
                            Usually 45-60 minutes. Allows time for complex problem-solving.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <User className="h-3 w-3 text-primary-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">Behavioral Round</span>
                            Typically 30-45 minutes. Covers various scenarios and experiences.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <h4 className="font-medium">Interview Tips</h4>
                    </div>
                    <ul className="space-y-3">
                      {interviewTips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-success-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <Check className="h-4 w-4 text-success-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block">{tip.title}</span>
                            {tip.description}
                          </p>
                        </li>
                      ))}
                    </ul>
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

export default InterviewSetup;