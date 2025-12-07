import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getDocument, setDocument } from '../firebase/utils';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const profileResult = await getDocument('users', user.uid);
          if (profileResult.success) {
            setUserProfile(profileResult.data);
          } else {
            console.warn('User profile not found for uid:', user.uid);
            // Create a default profile in Firestore if not found
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              role: 'patient',
              firstName: '',
              lastName: '',
              phone: '',
              createdAt: new Date()
            };
            
            // Create the profile in Firestore
            const createResult = await setDocument('users', user.uid, defaultProfile);
            if (createResult.success) {
              setUserProfile(defaultProfile);
            } else {
              // If creation fails, still set it in state so app doesn't break
              setUserProfile(defaultProfile);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Create a default profile in Firestore on error
          try {
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              role: 'patient',
              firstName: '',
              lastName: '',
              phone: '',
              createdAt: new Date()
            };
            await setDocument('users', user.uid, defaultProfile);
            setUserProfile(defaultProfile);
          } catch (createError) {
            console.error('Error creating default profile:', createError);
            // Fallback: set in state only
            setUserProfile({
              uid: user.uid,
              email: user.email,
              role: 'patient',
              firstName: '',
              lastName: ''
            });
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

