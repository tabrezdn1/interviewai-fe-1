import { supabase } from '../lib/supabase';
import { fetchUserInterviews, fetchInterviewQuestions, fetchInterviewFeedback } from '../lib/utils';
import { mockInterviews } from '../data/interviews';
import { mockQuestions } from '../data/questions';
import { mockFeedback } from '../data/feedback';

export interface InterviewFormData {
  type: string;
  role: string;
  company?: string;
  experience: string;
  difficulty: string;
  duration: number;
  interviewMode?: string;
  selectedRounds?: string[];
  roundDurations?: Record<string, number>;
  roundDurations?: Record<string, number>;
}

// Helper function to check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !!(url && 
           key && 
           url !== 'your-supabase-url' && 
           url.startsWith('http') &&
           key !== 'your-supabase-anon-key');
}

export async function createInterview(userId: string, formData: InterviewFormData) {
  // Check if Supabase is configured before making requests
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot create interview');
    throw new Error('Database not configured');
  }

  try {
    // Get the IDs for the selected types
    const { data: interviewTypeData, error: typeError } = await supabase
      .from('interview_types')
      .select('id')
      .eq('type', formData.type)
      .single();
    
    if (typeError) throw typeError;
    
    const { data: experienceLevelData, error: expError } = await supabase
      .from('experience_levels')
      .select('id')
      .eq('value', formData.experience)
      .single();
    
    // Experience is optional
    const experienceLevelId = expError ? null : experienceLevelData?.id;
    
    const { data: difficultyLevelData, error: diffError } = await supabase
      .from('difficulty_levels')
      .select('id')
      .eq('value', formData.difficulty)
      .single();
    
    if (diffError) throw diffError;
    
    const interviewData = {
      user_id: userId,
      title: formData.interviewMode === 'complete' 
        ? `Complete ${formData.role} Interview` 
      title: formData.interviewMode === 'complete' 
        ? `Complete ${formData.role} Interview` 
        : `${formData.role} ${formData.selectedRounds?.[0] || ''} Interview`,
      company: formData.company || null,
      role: formData.role,
      interview_type_id: interviewTypeData.id,
      experience_level_id: experienceLevelId,
      difficulty_level_id: difficultyLevelData.id,
      status: 'scheduled',
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Set to 24 hours from now
      duration: formData.duration
    };
    
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert([interviewData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Assign questions to the interview based on type
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('interview_type_id', interviewTypeData.id)
      .limit(5);
    
    if (questionsError) throw questionsError;
    
    if (questions.length > 0) {
      const interviewQuestions = questions.map((q) => ({
        interview_id: interview.id,
        question_id: q.id
      }));
      
      const { error: iqError } = await supabase
        .from('interview_questions')
        .insert(interviewQuestions);
      
      if (iqError) throw iqError;
    }
    
    return interview;
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
}

export async function getInterviews(userId: string) {
  try {
    const interviews = await fetchUserInterviews(userId);
    // Always return the interviews array, even if empty
    // The mock data fallback is handled in the Dashboard component
    return interviews;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    // Return empty array instead of mock data to let Dashboard handle fallback
    return [];
  }
}

export async function getInterview(id: string) {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format: ${id}, using mock data`);
      // Return mock interview for invalid UUIDs (like "3")
      return {
        id,
        title: 'Mock Frontend Developer Interview',
        company: 'Tech Solutions Inc.',
        role: 'Frontend Developer',
        interview_types: {
          type: 'technical',
          title: 'Technical',
          description: 'Technical interview questions',
          icon: 'Code'
        },
        difficulty_levels: {
          value: 'medium',
          label: 'Medium - Standard interview difficulty'
        },
        questions: mockQuestions.technical,
        duration: 20
      };
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock data');
      return {
        id,
        title: 'Mock Frontend Developer Interview',
        company: 'Tech Solutions Inc.',
        role: 'Frontend Developer',
        interview_types: {
          type: 'technical',
          title: 'Technical',
          description: 'Technical interview questions',
          icon: 'Code'
        },
        difficulty_levels: {
          value: 'medium',
          label: 'Medium - Standard interview difficulty'
        },
        questions: mockQuestions.technical,
        duration: 20
      };
    }

    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        interview_types (type, title, description, icon),
        experience_levels (value, label),
        difficulty_levels (value, label)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Get questions for this interview
    const questions = await fetchInterviewQuestions(id);
    
    return {
      ...data,
      questions: questions.length 
        ? questions.map((q) => q.questions) 
        : mockQuestions[data.interview_types.type] || mockQuestions.technical
    };
  } catch (error) {
    console.error('Error fetching interview:', error);
    // Return mock interview for testing
    return {
      id,
      title: 'Mock Frontend Developer Interview',
      company: 'Tech Solutions Inc.',
      role: 'Frontend Developer',
      interview_types: {
        type: 'technical',
        title: 'Technical',
        description: 'Technical interview questions',
        icon: 'Code'
      },
      difficulty_levels: {
        value: 'medium',
        label: 'Medium - Standard interview difficulty'
      },
      questions: mockQuestions.technical,
      duration: 20
    };
  }
}

export async function completeInterview(id: string, responses: any) {
  try {
    // Validate UUID format before making database calls
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format for completion: ${id}, skipping database update`);
      return true; // Return success for mock interviews
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping database update');
      return true; // Return success for mock interviews
    }

    // Update interview status to completed
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: responses.overallScore || Math.floor(Math.random() * 30) + 70 // Random score between 70-100 if not provided
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Save question responses
    if (responses.questions && responses.questions.length > 0) {
      for (const question of responses.questions) {
        const { error: responseError } = await supabase
          .from('interview_questions')
          .update({
            answer: question.answer,
            analysis: question.analysis,
            score: question.score,
            feedback: question.feedback
          })
          .eq('interview_id', id)
          .eq('question_id', question.id);
        
        if (responseError) console.error('Error saving question response:', responseError);
      }
    }
    
    // Save feedback
    if (responses.feedback) {
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert([{
          interview_id: id,
          overall_score: responses.feedback.overallScore,
          summary: responses.feedback.summary,
          strengths: responses.feedback.strengths,
          improvements: responses.feedback.improvements,
          technical_score: responses.feedback.skillAssessment?.technical?.score,
          communication_score: responses.feedback.skillAssessment?.communication?.score,
          problem_solving_score: responses.feedback.skillAssessment?.problemSolving?.score,
          experience_score: responses.feedback.skillAssessment?.experience?.score,
          technical_feedback: responses.feedback.skillAssessment?.technical?.feedback,
          communication_feedback: responses.feedback.skillAssessment?.communication?.feedback,
          problem_solving_feedback: responses.feedback.skillAssessment?.problemSolving?.feedback,
          experience_feedback: responses.feedback.skillAssessment?.experience?.feedback
        }]);
      
      if (feedbackError) console.error('Error saving feedback:', feedbackError);
    }
    
    return true;
  } catch (error) {
    console.error('Error completing interview:', error);
    return false;
  }
}

export async function getFeedback(interviewId: string) {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(interviewId)) {
      console.warn(`Invalid UUID format: ${interviewId}, using mock data`);
      return mockFeedback;
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock data');
      return mockFeedback;
    }

    // Fetch feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('interview_id', interviewId)
      .single();
    
    // Fetch interview details for title, date, and duration
    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .select('title, created_at, duration')
      .eq('id', interviewId)
      .single();
    
    // Fetch question responses
    const { data: questionResponses, error: questionsError } = await supabase
      .from('interview_questions')
      .select(`
        *,
        questions (text, hint)
      `)
      .eq('interview_id', interviewId);
    
    if (feedbackError || interviewError) {
      console.warn('Error fetching feedback or interview data:', feedbackError || interviewError);
      return mockFeedback;
    }
    
    // Combine the data into the expected format
    const combinedFeedback = {
      title: interviewData?.title || 'Interview Feedback',
      date: interviewData?.created_at || new Date().toISOString(),
      duration: interviewData?.duration || 20,
      overallScore: feedbackData?.overall_score || 0,
      summary: feedbackData?.summary || '',
      strengths: feedbackData?.strengths || [],
      improvements: feedbackData?.improvements || [],
      skillAssessment: {
        technical: { score: feedbackData?.technical_score || 0, feedback: feedbackData?.technical_feedback || '' },
        communication: { score: feedbackData?.communication_score || 0, feedback: feedbackData?.communication_feedback || '' },
        problemSolving: { score: feedbackData?.problem_solving_score || 0, feedback: feedbackData?.problem_solving_feedback || '' },
        experience: { score: feedbackData?.experience_score || 0, feedback: feedbackData?.experience_feedback || '' }
      },
      questionResponses: questionResponses?.map(qr => ({
        id: qr.question_id,
        question: qr.questions?.text || '',
        answer: qr.answer || '',
        score: qr.score || 0,
        feedback: qr.feedback || ''
      })) || []
    };
    
    return combinedFeedback;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return mockFeedback; // Fallback to mock data
  }
}

export async function cancelInterview(id: string) {
  try {
    // Validate UUID format before making database calls
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format for cancellation: ${id}, skipping database update`);
      return true; // Return success for mock interviews
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping database update');
      return true; // Return success for mock interviews
    }

    const { error } = await supabase
      .from('interviews')
      .update({ status: 'canceled' })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling interview:', error);
    return false;
  }
}

export async function deleteInterview(id: string) {
  try {
    // Validate UUID format before making database calls
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format for deletion: ${id}, skipping database update`);
      return true; // Return success for mock interviews
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping database update');
      return true; // Return success for mock interviews
    }

    // Delete the interview (this will cascade delete related records due to foreign key constraints)
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return false;
  }
}

export async function updateInterview(id: string, updates: Partial<{
  title: string;
  company: string | null;
  scheduled_at: string;
  role: string;
}>) {
  try {
    // Validate UUID format before making database calls
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format for update: ${id}, skipping database update`);
      return true; // Return success for mock interviews
    }

    // Check if Supabase is configured before making requests
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping database update');
      return true; // Return success for mock interviews
    }

    const { data, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating interview:', error);
    return null;
  }
}