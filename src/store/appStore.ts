import { create } from 'zustand';
import { User, Student, Settings, ActivityLog, Role } from '../types';
import { generateId } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from '../../firebase-applet-config.json';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';

// Secondary app for creating users without logging out
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

interface AppState {
  users: User[];
  students: Student[];
  settings: Settings;
  activityLogs: ActivityLog[];
  isInitialized: boolean;
  unsubscribers: (() => void)[];
  
  // Actions
  initialize: () => void;
  cleanup: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>, actor: User) => Promise<void>;
  updateUser: (id: string, data: Partial<User>, actor: User) => Promise<void>;
  deleteUser: (id: string, actor: User) => Promise<void>;
  
  addStudent: (student: Omit<Student, 'id' | 'studentNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'statusUpdatedBy'>, actor: User) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>, actor: User) => Promise<void>;
  deleteStudent: (id: string, actor: User) => Promise<void>;
  
  updateSettings: (settings: Settings, actor: User) => Promise<void>;
  logActivity: (userId: string, userName: string, action: string, details: string) => Promise<void>;
}

export const defaultSettings: Settings = {
  passingScore: 50,
  academicYear: '2026-2027',
  subjectClassifications: {
    excellent: 9,
    veryGood: 8,
    good: 7,
    acceptable: 5,
  },
  totalClassifications: {
    excellent: 90,
    veryGood: 80,
    good: 70,
    acceptable: 50,
  }
};

export const defaultAdmin: User = {
  id: 'admin-1',
  name: 'مدير النظام',
  email: 'admin@alandalus.app',
  password: 'admin',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const useAppStore = create<AppState>()((set, get) => ({
  users: [],
  students: [],
  settings: defaultSettings,
  activityLogs: [],
  isInitialized: false,
  unsubscribers: [],

  initialize: () => {
    if (get().isInitialized) return;
    
    // Listeners for realtime sync
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          ...data,
          email: data.email || (data.username ? `${data.username}@alandalus.app` : '')
        } as User);
      });
      set({ users: usersData });
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users"));

    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      const studentsData: Student[] = [];
      snapshot.forEach((doc) => studentsData.push(doc.data() as Student));
      // Sort by student number
      studentsData.sort((a, b) => a.studentNumber - b.studentNumber);
      set({ students: studentsData });
    }, (error) => handleFirestoreError(error, OperationType.LIST, "students"));

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        set({ settings: snapshot.data() as Settings });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/global"));

    const unsubActivity = onSnapshot(query(collection(db, "activity_logs"), orderBy("timestamp", "desc")), (snapshot) => {
      const logsData: ActivityLog[] = [];
      snapshot.forEach((doc) => logsData.push(doc.data() as ActivityLog));
      set({ activityLogs: logsData });
    }, (error) => handleFirestoreError(error, OperationType.LIST, "activity_logs"));

    set({ isInitialized: true, unsubscribers: [unsubUsers, unsubStudents, unsubSettings, unsubActivity] });
  },

  cleanup: () => {
    get().unsubscribers.forEach(unsub => unsub());
    set({ isInitialized: false, unsubscribers: [], users: [], students: [], activityLogs: [] });
  },

  logActivity: async (userId, userName, action, details) => {
    try {
      const id = generateId();
      const newLog: ActivityLog = {
        id,
        userId,
        userName,
        action,
        details,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, "activity_logs", id), newLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "activity_logs");
    }
  },

  addUser: async (userData, actor) => {
    try {
      // 1. Create in Firebase Auth
      const email = userData.email;
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, userData.password || '123456');
      
      const id = cred.user.uid;
      const newUser: User = {
        ...userData,
        id,
        createdAt: new Date().toISOString(),
      };
      
      // 2. Set to Firestore
      await setDoc(doc(db, "users", id), newUser);
      await get().logActivity(actor.id, actor.name, 'إضافة مستخدم', `تمت إضافة المستخدم: ${newUser.name}`);
    } catch (e) {
      console.error("Error creating user:", e);
      throw e;
    }
  },

  updateUser: async (id, data, actor) => {
    await updateDoc(doc(db, "users", id), data);
    await get().logActivity(actor.id, actor.name, 'تعديل مستخدم', `تم تعديل بيانات المستخدم ID: ${id}`);
  },

  deleteUser: async (id, actor) => {
    await deleteDoc(doc(db, "users", id));
    await get().logActivity(actor.id, actor.name, 'حذف مستخدم', `تم حذف المستخدم ID: ${id}`);
  },

  addStudent: async (studentData, actor) => {
    const state = get();
    const nextStudentNumber = state.students.length > 0 
      ? Math.max(...state.students.map(s => s.studentNumber)) + 1 
      : 1000;
      
    const id = generateId();
    const newStudent: Student = {
      ...studentData,
      id,
      academicYear: state.settings.academicYear,
      studentNumber: nextStudentNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actor.id,
      updatedBy: actor.id,
      statusUpdatedBy: '',
    };
    
    newStudent.totalWritten = (newStudent.arabicScore || 0) + (newStudent.englishScore || 0) + (newStudent.mathScore || 0);
    newStudent.totalFinal = newStudent.totalWritten + (newStudent.interviewScore || 0) + (newStudent.certificateScore || 0);
    
    await setDoc(doc(db, "students", id), newStudent);
    await get().logActivity(actor.id, actor.name, 'إضافة طالب', `تمت إضافة الطالب: ${newStudent.name}`);
  },

  updateStudent: async (id, data, actor) => {
    const state = get();
    const currentStudent = state.students.find(s => s.id === id);
    if (!currentStudent) return;

    const updated = { ...currentStudent, ...data, updatedAt: new Date().toISOString(), updatedBy: actor.id };
    
    const arabic = updated.retakeSubjectScores?.arabic ?? updated.arabicScore ?? 0;
    const english = updated.retakeSubjectScores?.english ?? updated.englishScore ?? 0;
    const math = updated.retakeSubjectScores?.math ?? updated.mathScore ?? 0;
    const interview = updated.retakeInterviewScore ?? updated.interviewScore ?? 0;
    const cert = updated.certificateScore ?? 0;
    
    updated.totalWritten = arabic + english + math;
    updated.totalFinal = updated.totalWritten + interview + cert;
    
    if (data.status && data.status !== currentStudent.status) {
      updated.statusUpdatedBy = actor.id;
    }
    
    await updateDoc(doc(db, "students", id), updated);
    await get().logActivity(actor.id, actor.name, 'تعديل طالب', `تم تعديل بيانات الطالب ID: ${id}`);
  },

  deleteStudent: async (id, actor) => {
    await deleteDoc(doc(db, "students", id));
    await get().logActivity(actor.id, actor.name, 'حذف طالب', `تم حذف الطالب ID: ${id}`);
  },

  updateSettings: async (settings, actor) => {
    await setDoc(doc(db, "settings", "global"), settings);
    await get().logActivity(actor.id, actor.name, 'تعديل الإعدادات', `تم تعديل إعدادات النظام`);
  },
}));
