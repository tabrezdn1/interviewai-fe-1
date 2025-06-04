import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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