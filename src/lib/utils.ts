import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
}

export function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981"; // success-500
  if (score >= 75) return "#3b82f6"; // primary-500
  if (score >= 60) return "#f59e0b"; // warning-500
  return "#ef4444"; // error-500
}

export function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-success-600";
  if (score >= 75) return "text-primary-600";
  if (score >= 60) return "text-warning-600";
  return "text-error-600";
}

export function getScoreBackgroundColor(score: number): string {
  if (score >= 90) return "bg-success-500";
  if (score >= 75) return "bg-primary-500";
  if (score >= 60) return "bg-warning-500";
  return "bg-error-500";
}

export function getScoreRating(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Satisfactory";
  return "Needs Improvement";
}

// Supabase utility functions
export async function fetchInterviewTypes() {
  try {
    const { data, error } = await supabase
      .from('interview_types')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interview types:', error);
    // Fall back to the static data
    return [
      {
        type: "technical",
        title: "Technical",
        description: "Coding, system design, and technical knowledge questions",
        icon: "Code",
      },
      {
        type: "behavioral", 
        title: "Behavioral",
        description: "Questions about your past experiences and situations",
        icon: "User",
      },
      {
        type: "mixed",
        title: "Mixed",
        description: "Combination of technical and behavioral questions",
        icon: "Briefcase",
      },
    ];
  }
}

export async function fetchExperienceLevels() {
  try {
    const { data, error } = await supabase
      .from('experience_levels')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching experience levels:', error);
    // Fall back to the static data
    return [
      { value: "entry", label: "Entry Level (0-2 years)" },
      { value: "mid", label: "Mid Level (3-5 years)" },
      { value: "senior", label: "Senior Level (6+ years)" },
    ];
  }
}

export async function fetchDifficultyLevels() {
  try {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching difficulty levels:', error);
    // Fall back to the static data
    return [
      { value: "easy", label: "Easy - Beginner friendly questions" },
      { value: "medium", label: "Medium - Standard interview difficulty" },
      { value: "hard", label: "Hard - Challenging interview questions" },
    ];
  }
}

export async function fetchUserInterviews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        interview_types (type, title),
        experience_levels (value, label),
        difficulty_levels (value, label)
      `)
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
}

export async function fetchInterviewQuestions(interviewId: string) {
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .select(`
        *,
        questions (id, text, hint)
      `)
      .eq('interview_id', interviewId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return [];
  }
}

export async function fetchInterviewFeedback(interviewId: string) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('interview_id', interviewId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }
}