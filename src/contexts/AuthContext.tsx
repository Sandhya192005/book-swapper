import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'reputation' | 'badges' | 'verifiedLevels' | 'createdAt'>) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: {
            ...user,
            createdAt: new Date(user.createdAt)
          }
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let user = existingUsers.find((u: User) => u.email === email);
      
      if (!user) {
        // Create new user if doesn't exist
        user = {
          id: Date.now().toString(),
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          email,
          campus: 'Not specified',
          area: 'Not specified',
          phone: 'Not provided',
          genres: [],
          reputation: 0,
          badges: ['New Member'],
          verifiedLevels: ['email'],
          createdAt: new Date(),
        };
        
        // Save new user
        existingUsers.push(user);
        localStorage.setItem('users', JSON.stringify(existingUsers));
      } else {
        // Convert createdAt back to Date object for existing user
        user = {
          ...user,
          createdAt: new Date(user.createdAt)
        };
      }

      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
    }
  };

  const register = async (userData: Omit<User, 'id' | 'reputation' | 'badges' | 'verifiedLevels' | 'createdAt'>): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = existingUsers.find((u: User) => u.email === userData.email);
      
      if (userExists) {
        throw new Error('User already exists with this email');
      }
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        reputation: 0,
        badges: ['New Member'],
        verifiedLevels: ['email'],
        createdAt: new Date(),
      };

      // Save user to users list
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(newUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed. Please try again.' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateProfile = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update user in users list
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = existingUsers.findIndex((u: User) => u.id === state.user!.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(existingUsers));
      }
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};