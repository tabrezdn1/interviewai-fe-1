import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Briefcase, User, Clock, Check, ChevronRight, ChevronLeft, MessageSquare, Users } from 'lucide-react';
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
  
  const [formData, setFormData] = useState<InterviewFormData>({
    type: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20,
    interviewMode: 'single', // 'single' or 'complete'
    selectedRounds: [], // for custom selection
  });
  
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
          }
        ];
        
        if (rounds.length >= 2) {
          modes.push({
            id: 'complete',
            name: 'Complete Interview',
            description: 'Full interview process with all rounds',
            icon: <Users className="h-6 w-6" />,
            rounds: rounds.map(r => r.id),
            duration: rounds.reduce((total, round) => total + round.duration, 0)
          });
        }
        
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
  
  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleModeSelect = (mode: string) => {
    setFormData(prev => ({ 
      ...prev, 
      interviewMode: mode,
      // Reset duration based on mode
      duration: mode === 'complete' 
        ? availableRounds.reduce((total, round) => total + round.duration, 0)
        : 20
    }));
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
    if (step === 1) return formData.type !== '';
    if (step === 2) return formData.interviewMode !== '';
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
                      <span>Interview Type</span>
                      <span>Interview Mode</span>
                      <span>Job Details</span>
                      <span>Settings</span>
                    </div>
                  </div>
                  
                  {/* Step 1: Interview Type */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Select Interview Type</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {interviewTypes.map((type) => (
                          <InterviewTypeCard
                            key={type.type}
                            type={type.type}
                            title={type.title}
                            description={type.description}
                            icon={getIconComponent(type.icon)}
                            selected={formData.type === type.type}
                            onSelect={handleTypeSelect}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Interview Mode */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Select Interview Mode</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {interviewModes.map((mode) => (
                          <InterviewModeCard
                            key={mode.id}
                            mode={mode}
                            selected={formData.interviewMode === mode.id}
                            onSelect={handleModeSelect}
                            availableRounds={availableRounds}
                          />
                        ))}
                      </div>
                      
                      {formData.interviewMode === 'complete' && availableRounds.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-900 mb-2">Complete Interview Process</h3>
                          <div className="space-y-2">
                            {availableRounds.map((round, index) => (
                              <div key={round.id} className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="font-medium">{round.name}</span>
                                <span className="text-gray-600">({round.duration} min)</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-blue-700">
                            Total duration: {availableRounds.reduce((total, round) => total + round.duration, 0)} minutes
                          </div>
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
                            placeholder="e.g. Frontend Developer, Product Manager"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
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
                          />
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
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 4: Settings */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold mb-6">Interview Settings</h2>
                      
                      <div className="space-y-6">
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
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formData.interviewMode === 'complete' ? 'Total Duration' : 'Interview Duration'} (minutes)
                          </label>
                          {formData.interviewMode === 'complete' ? (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="text-lg font-medium">{formData.duration} minutes</span>
                              <p className="text-sm text-gray-600 mt-1">
                                Duration is automatically calculated based on selected rounds
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                name="duration"
                                min="10"
                                max="60"
                                step="5"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="w-12 text-center font-medium">{formData.duration}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mt-6">
                          <h3 className="font-medium mb-2">Interview Summary</h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium text-gray-900 capitalize">{formData.type}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Mode:</span>
                              <span className="font-medium text-gray-900">{formData.interviewMode === 'complete' ? 'Complete Interview' : 'Single Round'}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Role:</span>
                              <span className="font-medium text-gray-900">{formData.role}</span>
                            </li>
                            {formData.company && (
                              <li className="flex justify-between">
                                <span>Company:</span>
                                <span className="font-medium text-gray-900">{formData.company}</span>
                              </li>
                            )}
                            <li className="flex justify-between">
                              <span>Experience Level:</span>
                              <span className="font-medium text-gray-900 capitalize">{formData.experience}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Difficulty:</span>
                              <span className="font-medium text-gray-900 capitalize">{formData.difficulty}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Duration:</span>
                              <span className="font-medium text-gray-900">{formData.duration} minutes</span>
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
                      <div></div>
                    )}
                    
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid() || submitting}
                     className={`flex items-center gap-2 ${step === 4 ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20' : ''} ${
                        !isStepValid() || submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                     variant={step === 4 ? 'gradient' : 'default'}
                    >
                      {submitting && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      )}
                      {step === 3 ? 'Start Interview' : 'Continue'}
                      {step === 4 ? 'Start Interview' : 'Continue'}
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
                  <h3 className="text-lg font-semibold mb-4">Tips for Success</h3>
                  <ul className="space-y-3">
                    {interviewTips.slice(0, 4).map((tip, index) => (
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
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <h4 className="font-medium">Average Duration</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Most users spend between 20-30 minutes on a practice interview, but you can adjust the duration based on your availability.
                    </p>
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

interface InterviewTypeCardProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: (type: string) => void;
}

const InterviewTypeCard: React.FC<InterviewTypeCardProps> = ({
  type,
  title,
  description,
  icon,
  selected,
  onSelect,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selected
          ? 'border-primary-600 bg-primary-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(type)}
    >
      <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center ${
        selected ? 'bg-primary-100' : 'bg-gray-100'
      }`}>
        <div className={selected ? 'text-primary-600' : 'text-gray-600'}>
          {icon}
        </div>
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {selected && (
        <div className="mt-3 text-primary-600 text-sm font-medium flex items-center gap-1">
          <Check className="h-4 w-4" />
          Selected
        </div>
      )}
    </div>
  );
};

interface InterviewModeCardProps {
  mode: InterviewMode;
  selected: boolean;
  onSelect: (modeId: string) => void;
  availableRounds: any[];
}

const InterviewModeCard: React.FC<InterviewModeCardProps> = ({
  mode,
  selected,
  onSelect,
  availableRounds,
}) => {
  const isDisabled = mode.id === 'complete' && availableRounds.length < 2;
  
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isDisabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : selected
            ? 'border-primary-600 bg-primary-50 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => !isDisabled && onSelect(mode.id)}
    >
      <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center ${
        isDisabled
          ? 'bg-gray-200'
          : selected 
            ? 'bg-primary-100' 
            : 'bg-gray-100'
      }`}>
        <div className={
          isDisabled
            ? 'text-gray-400'
            : selected 
              ? 'text-primary-600' 
              : 'text-gray-600'
        }>
          {mode.icon}
        </div>
      </div>
      <h3 className="font-medium mb-1">{mode.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{mode.description}</p>
      
      {mode.id === 'complete' && (
        <div className="text-xs text-gray-500">
          {isDisabled 
            ? 'Requires multiple AI interviewers' 
            : `${availableRounds.length} rounds available`
          }
        </div>
      )}
      
      {selected && !isDisabled && (
        <div className="mt-3 text-primary-600 text-sm font-medium flex items-center gap-1">
          <Check className="h-4 w-4" />
          Selected
        </div>
      )}
    </div>
  );
};

export default InterviewSetup;