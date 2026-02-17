import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithPhone: (phone: string, code: string) => Promise<boolean>;
  sendVerificationCode: (phone: string) => Promise<boolean>;
  resetPassword: (phone: string, code: string, newPassword: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock login - in production this would call an API
    if (username === 'demo' && password === 'demo123') {
      const mockUser: User = {
        id: 'user_001',
        username: 'demo',
        restaurantId: 'rest_001',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const loginWithPhone = async (phone: string, code: string): Promise<boolean> => {
    // Mock phone login - accepts any 10-digit phone + code 123456
    if (phone.length === 10 && code === '123456') {
      const mockUser: User = {
        id: 'user_001',
        username: 'merchant',
        phone,
        restaurantId: 'rest_001',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const sendVerificationCode = async (_phone: string): Promise<boolean> => {
    // Mock - simulate 1s delay then return success
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  const resetPassword = async (_phone: string, code: string, _newPassword: string): Promise<boolean> => {
    // Mock - code 123456 passes
    if (code === '123456') {
      return true;
    }
    return false;
  };

  const changePassword = async (oldPassword: string, _newPassword: string): Promise<boolean> => {
    // Mock - old password must be demo123
    if (oldPassword === 'demo123') {
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        sendVerificationCode,
        resetPassword,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
