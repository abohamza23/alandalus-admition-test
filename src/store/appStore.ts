import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Student, Settings, ActivityLog, Role } from '../types';
import { generateId } from '../lib/utils';

interface AppState {
  users: User[];
  students: Student[];
  settings: Settings;
  activityLogs: ActivityLog[];
  
  // Actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>, actor: User) => void;
  updateUser: (id: string, data: Partial<User>, actor: User) => void;
  deleteUser: (id: string, actor: User) => void;
  
  addStudent: (student: Omit<Student, 'id' | 'studentNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'statusUpdatedBy'>, actor: User) => void;
  updateStudent: (id: string, data: Partial<Student>, actor: User) => void;
  deleteStudent: (id: string, actor: User) => void;
  
  updateSettings: (settings: Settings, actor: User) => void;
  logActivity: (userId: string, userName: string, action: string, details: string) => void;
}

const defaultSettings: Settings = {
  passingScore: 50,
  subjectClassifications: {
    excellent: 90,
    veryGood: 80,
    good: 70,
    acceptable: 50,
  },
  totalClassifications: {
    excellent: 90,
    veryGood: 80,
    good: 70,
    acceptable: 50,
  }
};

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'مدير النظام',
  email: 'admin@alandalus.edu',
  password: 'admin',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [defaultAdmin],
      students: [],
      settings: defaultSettings,
      activityLogs: [],

      logActivity: (userId, userName, action, details) => {
        const newLog: ActivityLog = {
          id: generateId(),
          userId,
          userName,
          action,
          details,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activityLogs: [newLog, ...state.activityLogs] }));
      },

      addUser: (userData, actor) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
        get().logActivity(actor.id, actor.name, 'إضافة مستخدم', `تمت إضافة المستخدم: ${newUser.name}`);
      },

      updateUser: (id, data, actor) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
        get().logActivity(actor.id, actor.name, 'تعديل مستخدم', `تم تعديل بيانات المستخدم ID: ${id}`);
      },

      deleteUser: (id, actor) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
        get().logActivity(actor.id, actor.name, 'حذف مستخدم', `تم حذف المستخدم ID: ${id}`);
      },

      addStudent: (studentData, actor) => {
        set((state) => {
          const nextStudentNumber = state.students.length > 0 
            ? Math.max(...state.students.map(s => s.studentNumber)) + 1 
            : 1000;
            
          const newStudent: Student = {
            ...studentData,
            id: generateId(),
            studentNumber: nextStudentNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: actor.id,
            updatedBy: actor.id,
            statusUpdatedBy: '',
          };
          
          // Calculate totals if scores exist
          newStudent.totalWritten = (newStudent.arabicScore || 0) + (newStudent.englishScore || 0) + (newStudent.mathScore || 0);
          newStudent.totalFinal = newStudent.totalWritten + (newStudent.interviewScore || 0) + (newStudent.certificateScore || 0);
          
          get().logActivity(actor.id, actor.name, 'إضافة طالب', `تمت إضافة الطالب: ${newStudent.name}`);
          
          return { students: [...state.students, newStudent] };
        });
      },

      updateStudent: (id, data, actor) => {
        set((state) => {
          const students = state.students.map((s) => {
            if (s.id === id) {
              const updated = { ...s, ...data, updatedAt: new Date().toISOString(), updatedBy: actor.id };
              
              // Recalculate totals
              const arabic = updated.retakeSubjectScores?.arabic ?? updated.arabicScore ?? 0;
              const english = updated.retakeSubjectScores?.english ?? updated.englishScore ?? 0;
              const math = updated.retakeSubjectScores?.math ?? updated.mathScore ?? 0;
              const interview = updated.retakeInterviewScore ?? updated.interviewScore ?? 0;
              const cert = updated.certificateScore ?? 0;
              
              updated.totalWritten = arabic + english + math;
              updated.totalFinal = updated.totalWritten + interview + cert;
              
              if (data.status && data.status !== s.status) {
                updated.statusUpdatedBy = actor.id;
              }
              
              return updated;
            }
            return s;
          });
          
          get().logActivity(actor.id, actor.name, 'تعديل طالب', `تم تعديل بيانات الطالب ID: ${id}`);
          return { students };
        });
      },

      deleteStudent: (id, actor) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
        get().logActivity(actor.id, actor.name, 'حذف طالب', `تم حذف الطالب ID: ${id}`);
      },

      updateSettings: (settings, actor) => {
        set({ settings });
        get().logActivity(actor.id, actor.name, 'تعديل الإعدادات', `تم تعديل إعدادات النظام`);
      },
    }),
    {
      name: 'alandalus-storage',
    }
  )
);
