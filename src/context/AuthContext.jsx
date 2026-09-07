import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Local development fallback: check if local mock session exists
      const localUser = localStorage.getItem('qa_local_session_user');
      if (localUser) {
        try {
          setCurrentUser(JSON.parse(localUser));
        } catch {
          setCurrentUser(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      const mockUser = {
        uid: 'local_user_' + btoa(email).substring(0, 8),
        email: email,
        displayName: email.split('@')[0],
      };
      localStorage.setItem('qa_local_session_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return mockUser;
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Sign up
  const signup = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      const mockUser = {
        uid: 'local_user_' + btoa(email).substring(0, 8),
        email: email,
        displayName: email.split('@')[0],
      };
      localStorage.setItem('qa_local_session_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return mockUser;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem('qa_local_session_user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
