import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { authService, User } from '../../firebase/services';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userData = await authService.getCurrentUserData();
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const userData = await authService.getCurrentUserData();
        setUserData(userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signOut,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
