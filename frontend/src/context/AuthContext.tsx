import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleEnum, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';

const DEMO_CREDENTIALS: Record<RoleEnum, { email: string; password: string }> = {
  mentee: { email: 'mentee@weis.org', password: 'password123' },
  mentor: { email: 'mentor@weis.org', password: 'password123' },
  admin: { email: 'admin@weis.org', password: 'admin123' },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  switchRole: (role: RoleEnum) => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weis_token');
    localStorage.removeItem('weis_user');
  };

  useEffect(() => {
    const token = localStorage.getItem('weis_token');
    const savedUser = localStorage.getItem('weis_user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        // Fetch fresh profile from backend to ensure token validity
        usersApi
          .getProfile()
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('weis_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      } catch {
        logout();
      }
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

  const switchRole = async (role: RoleEnum) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updated };
      localStorage.setItem('weis_user', JSON.stringify(nextUser));
      return nextUser;
    });
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
        updateUser,
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
