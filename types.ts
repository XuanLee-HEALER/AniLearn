
export enum LearningStatus {
  LOCKED = 'LOCKED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark';

export interface TaskLink {
  label: string;
  url: string;
}

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  estimatedMinutes: number;
  links?: TaskLink[]; // Specific resources for this task
  verificationQuestion?: string; // A question to test understanding
  userAnswer?: string;
  aiFeedback?: string;
  isVerified?: boolean;
}

export interface LearningDay {
  dayNumber: number;
  topic: string;
  summary: string;
  tasks: Task[];
  status: LearningStatus;
  userNotes?: string;
  completionDate?: string;
  mood?: 'happy' | 'neutral' | 'tired' | 'confused';
}

export interface LearningPlanMetadata {
  id: string;
  title: string;
  topic: string;
  totalDays: number;
  createdAt: string;
  progress: number; // 0-100
}

export interface LearningPlan extends LearningPlanMetadata {
  days: LearningDay[];
  context?: string;
}
