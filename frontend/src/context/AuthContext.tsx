import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleEnum, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../api/auth';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  switchRole: (role: RoleEnum) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved token / user on mount
    const savedUser = localStorage.getItem('weis_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('weis_user');
      }
    } else {
      // Default to Amina (mentee) for seamless exploration if no user is set
      const defaultUser = MOCK_USERS[0];
      setUser(defaultUser);
      localStorage.setItem('weis_user', JSON.stringify(defaultUser));
      localStorage.setItem('weis_token', 'mock-jwt-token-weis');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.user);
      localStorage.setItem('weis_token', res.access_token);
      localStorage.setItem('weis_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      localStorage.setItem('weis_token', res.access_token);
      localStorage.setItem('weis_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weis_token');
    localStorage.removeItem('weis_user');
  };

  // Helper for evaluation / testing different user journeys (mentee vs mentor vs admin)
  const switchRole = (role: RoleEnum) => {
    const target = MOCK_USERS.find((u) => u.role === role) || {
      user_id: Date.now(),
      full_name: `${role.toUpperCase()} Demo User`,
      email: `${role}@weis.org`,
      role,
    };
    setUser(target);
    localStorage.setItem('weis_user', JSON.stringify(target));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
