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
import { createInterview } from '../services/InterviewService';
import { getInterviewRounds } from '../lib/tavus';
import Breadcrumb from '../components/layout/Breadcrumb';
import BackButton from '../components/layout/BackButton';

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

interface InterviewFormData {
  interviewType: string;
  role: string;
  company?: string;
  experience: string;
  difficulty: string;
  duration: number;
  interviewMode?: string;
  selectedRounds?: string[];
  roundDurations?: Record<string, number>;
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
  
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewType: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20,
    interviewMode: '',
    selectedRounds: [],
    roundDurations: {}
  });

  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, interviewType: type }));
  };

  const handleModeSelect = (mode: string) => {
    setFormData(prev => ({ ...prev, interviewMode: mode }));
  };

  const isStepValid = () => {
    if (step === 1) return formData.interviewType !== '';
    if (step === 2) return formData.interviewMode !== '';
    if (step === 3) return formData.role !== '';
    return true;
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        if (user) {
          const interview = await createInterview(user.id, formData);
          navigate(`/interview/${interview.id}`);
        }
      } catch (error) {
        console.error('Error creating interview:', error);
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
        
        const rounds = getInterviewRounds();
        setAvailableRounds(rounds);
        
      } catch (error) {
        console.error('Error loading setup data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

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
        <BackButton className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">Setup Interview</h1>
        <p className="text-gray-600">Configure your AI interview session based on your needs</p>
        
        {/* Rest of the component implementation */}
      </div>
    </div>
  );
};

export default InterviewSetup;