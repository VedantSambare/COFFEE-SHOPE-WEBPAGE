import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getAuthToken, setAuthToken } from '../lib/api';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentialsOrUsername: { username: string; password: string } | string, maybePassword?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isEmployee: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      api.getMe()
        .then(res => {
          setUser(res.user);
        })
        .catch(() => {
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    credentialsOrUsername: { username: string; password: string } | string,
    maybePassword?: string
  ) => {
    const payload =
      typeof credentialsOrUsername === 'string'
        ? { username: credentialsOrUsername, password: maybePassword || '' }
        : credentialsOrUsername;

    const res = await api.login(payload);
    setAuthToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const idToken = await result.user.getIdToken();
    const res = await api.firebaseLogin(idToken);
    setAuthToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        isAdmin,
        isEmployee,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
