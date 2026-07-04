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
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const adminToken = isAdminPath ? localStorage.getItem('adminToken') : null;

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

  // Sync admin logout across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        const isAdminPath = window.location.pathname.startsWith('/admin');
        if (isAdminPath && !e.newValue) {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
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

  // Student logout: only signs out of Firebase, does not touch adminToken
  const studentSignOut = async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    if (user && user.role !== 'admin') {
      setUser(null);
    }
  };

  // Admin logout: only removes adminToken, does not touch Firebase
  const adminSignOut = async () => {
    localStorage.removeItem('adminToken');
    if (user && user.role === 'admin') {
      setUser(null);
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
    signOut: studentSignOut,
    adminSignOut,
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
