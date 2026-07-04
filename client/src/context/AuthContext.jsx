import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api, { setTokenGetter } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const syncUser = useCallback(async () => {
    try {
      const { data } = await api.post('/api/auth/sync');
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Failed to sync user:', err);
      setError('Failed to sync user profile with server');
      throw err;
    }
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');

    async function initAdmin() {
      try {
        const { data } = await api.get('/api/admin/auth/me');
        setUser(data);
        setFirebaseUser(null);
        setLoading(false);
      } catch (err) {
        console.error('Failed to restore admin session:', err);
        localStorage.removeItem('adminToken');
        initStudent();
      }
    }

    let unsubscribe = null;
    function initStudent() {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            await syncUser();
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    }

    if (adminToken) {
      initAdmin();
    } else {
      initStudent();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncUser]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      localStorage.removeItem('adminToken');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err.message || 'Sign in failed');
      throw err;
    }
  };

  const adminLogin = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/api/admin/auth/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      setUser(data.user);
      setFirebaseUser(null);
      return data.user;
    } catch (err) {
      console.error('Admin login failed:', err);
      const errMsg = err.response?.data?.message || 'Admin login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const signOut = async () => {
    if (localStorage.getItem('adminToken')) {
      localStorage.removeItem('adminToken');
      setUser(null);
    } else {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const value = {
    firebaseUser,
    user,
    loading,
    error,
    isAuthenticated: (!!firebaseUser && !!user) || (!!user && user.role === 'admin'),
    isAdmin: user?.role === 'admin',
    signInWithGoogle,
    adminLogin,
    signOut,
    syncUser,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
