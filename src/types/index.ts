export type Role = 'admin' | 'registrar' | 'coordinator' | 'data_entry' | 'academic_deputy';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for mock auth
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export type StudentStatus = 'pending' | 'ناجح' | 'إعادة' | 'مرفوض';
export type RetakeType = 'none' | 'subjects' | 'interview';

export interface Student {
  id: string;
  studentNumber: number;
  name: string;
  grade: string;
  examDate: string;
  
  // Academic Scores
  arabicScore: number | null;
  englishScore: number | null;
  mathScore: number | null;
  
  // Other Scores
  interviewScore: number | null;
  certificateScore: number | null;
  
  // Totals
  totalWritten: number | null;
  totalFinal: number | null;
  
  // Status
  status: StudentStatus;
  
  // Retake
  retakeType: RetakeType;
  retakeSubjects: string[]; // 'arabic', 'english', 'math'
  retakeInterviewScore: number | null;
  retakeSubjectScores: {
    arabic?: number;
    english?: number;
    math?: number;
  };
  
  notes: string;
  
  // Audit
  createdBy: string;
  updatedBy: string;
  statusUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  passingScore: number;
  subjectClassifications: {
    excellent: number;
    veryGood: number;
    good: number;
    acceptable: number;
  };
  totalClassifications: {
    excellent: number;
    veryGood: number;
    good: number;
    acceptable: number;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
