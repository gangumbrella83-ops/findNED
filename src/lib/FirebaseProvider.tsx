import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (identifier: string, securityKey: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (userData: { name: string, rollNumber: string, department: string, securityKey: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            setUser({ id: fUser.uid, ...userDoc.data() } as User);
          } else {
            // If they used Google but don't have a record, create a compliant one
            const isAdmin = fUser.email?.endsWith('@cloud.neduet.edu.pk');
            const newUser = {
              name: fUser.displayName || 'NED Student',
              email: fUser.email || '',
              rollNumber: 'G-' + fUser.uid.substring(0, 5), // Placeholder for google users
              department: 'General',
              role: isAdmin ? 'admin' : 'student',
              status: 'Active',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', fUser.uid), newUser);
            // Manually build the user object for immediate state update
            const userForState: User = { id: fUser.uid, ...newUser } as any;
            // Since serverTimestamp() is NOT a string, we might need to be careful.
            // But usually the app handles its own Date objects or strings.
            // Let's at least set what we can.
            setUser(userForState);
          }
        } catch (error: any) {
          if (error.code === 'permission-denied') {
             console.warn("User profile document not yet accessible or missing.");
          } else {
             console.error("Error fetching user profile:", error);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    if (!email || !email.endsWith('@cloud.neduet.edu.pk')) {
      await signOut(auth);
      throw new Error('Only @cloud.neduet.edu.pk accounts are allowed for Google Login.');
    }
  };

  const login = async (identifier: string, securityKey: string) => {
    let email = identifier;
    
    // roll number mapping
    if (!identifier.includes('@')) {
      email = `${identifier.toLowerCase()}@findned.local`;
    } 

    await signInWithEmailAndPassword(auth, email, securityKey);
  };

  const signup = async (data: { name: string, rollNumber: string, department: string, securityKey: string }) => {
    const email = `${data.rollNumber.toLowerCase()}@findned.local`;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.securityKey);
    
    const newUser = {
      name: data.name,
      email: email,
      rollNumber: data.rollNumber,
      department: data.department,
      role: 'student',
      status: 'Active',
      createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
