import { create } from 'zustand';
import { User } from '../types';
import { db, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { defaultAdmin, useAppStore } from './appStore';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          set({ user: userDoc.data() as User, isAuthenticated: true, isInitializing: false });
        } else {
          signOut(auth).catch(console.error);
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'users');
        signOut(auth).catch(console.error);
        set({ user: null, isAuthenticated: false, isInitializing: false });
      }
    } else {
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  });

  return {
    user: null,
    isAuthenticated: false,
    isInitializing: true,

    login: async (emailInput, password) => {
      try {
        // Fallback for demo users typing 'admin'
        const email = emailInput === 'admin' ? 'admin@alandalus.app' : emailInput;
        // Firebase requires at least 6 characters. If they use the default 'admin' / 'admin', pad it secretly.
        const isAdminLogin = (emailInput === 'admin' || emailInput === 'admin@alandalus.app') && password === 'admin';
        const safePassword = isAdminLogin ? 'admin123' : password;

        try {
          const cred = await signInWithEmailAndPassword(auth, email, safePassword);
          // Check if firestore doc exists, if not and it's admin, recreate it
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (!userDoc.exists() && (emailInput === 'admin' || email === 'admin@alandalus.app')) {
            const newAdmin = {
              ...defaultAdmin,
              id: cred.user.uid
            };
            await setDoc(doc(db, 'users', cred.user.uid), newAdmin);
          }
          return true;
        } catch (error: any) {
          // If the error means the user doesn't exist AND the username is admin, bootstrap!
          if ((emailInput === 'admin' || email === 'admin@alandalus.app') && (password === 'admin' || password === 'admin123')) {
             try {
                const cred = await createUserWithEmailAndPassword(auth, email, safePassword);
                // Bootstrap the user in firestore matching auth ID
                const newAdmin = {
                  ...defaultAdmin,
                  id: cred.user.uid
                };
                await setDoc(doc(db, 'users', cred.user.uid), newAdmin);
                set({ user: newAdmin, isAuthenticated: true, isInitializing: false });
                useAppStore.getState().initialize();
                return true;
             } catch (createErr) {
                console.error("Bootstrap error:", createErr);
             }
          }
          console.error('Login error:', error);
          return false;
        }
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    logout: async () => {
      await signOut(auth);
      set({ user: null, isAuthenticated: false });
    },
  };
});
