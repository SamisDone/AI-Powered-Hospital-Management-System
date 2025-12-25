import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthChange, listenToDocument, logout as authLogout } from '@/lib/firebase-utils';
import type { User } from 'firebase/auth';

// Types
export interface UserProfile {
  uid: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
  avatar?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  notificationPreferences?: {
    email: boolean;
    system: boolean;
    appointments: boolean;
  };
  createdAt?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(async (user) => {
      setCurrentUser(user);

      if (user) {
        setLoading(true); // Start loading when user is detected
        // Listen to profile changes
        if (unsubProfile) unsubProfile();

        unsubProfile = listenToDocument<UserProfile>('users', user.uid, async (profile: UserProfile | null) => {
          if (profile) {
            setUserProfile(profile);
            setLoading(false);
          } else {
            // Profile doesn't exist yet. 
            // It might be being created by the registration page.
            // We wait or do nothing here, letting the registration flow handle the creation.
            // Only if we truly need a fallback (legacy users), we handles it, but for now:
            console.log("Profile not found for user:", user.uid);
            setLoading(false);
          }
        });
      } else {
        if (unsubProfile) unsubProfile();
        unsubProfile = null;
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const logout = async () => {
    try {
      await authLogout();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    setUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
