import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth } from '../config/firebaseAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(
    auth,
    (currentUser) => {
      setUser(currentUser);
      setError('');
      setLoading(false);
    },
    (authError) => {
      setError(authError.message || 'Não foi possível verificar sua sessão.');
      setLoading(false);
    },
  ), []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    signIn: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
    signUp: (email, password) => createUserWithEmailAndPassword(auth, email.trim(), password),
    signOut: () => firebaseSignOut(auth),
  }), [error, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
