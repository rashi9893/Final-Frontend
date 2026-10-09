import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCandidateProfile, initialCompanyProfile } from '../services/mockData';
import { api } from '../services/api';
import { syncWithBackend } from '../services/storageService';

const AuthContext = createContext();

const DEMO_USERS = {
  candidate: {
    id: 'cand-1',
    role: 'candidate',
    name: initialCandidateProfile.name,
    email: initialCandidateProfile.email,
    college: initialCandidateProfile.college,
    degree: initialCandidateProfile.degree,
    graduationYear: initialCandidateProfile.graduationYear,
    phone: initialCandidateProfile.phone
  },
  company: {
    id: 'comp-1',
    role: 'company',
    name: initialCompanyProfile.contactPerson,
    companyName: initialCompanyProfile.companyName,
    email: initialCompanyProfile.workEmail,
    designation: initialCompanyProfile.designation,
    website: initialCompanyProfile.website
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_interviewer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ai_interviewer_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ai_interviewer_user');
    }
  }, [user]);

  const login = async (email, password, role) => {
    setLoading(true);

    try {
      // 1. Attempt Live Backend API Login
      const res = await api.login(email, password, role);

      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem('ai_interviewer_token', res.token);
        }
        setUser(res.user);
        syncWithBackend();
        setLoading(false);
        return { success: true, user: res.user };
      }

      // If backend explicitly rejected credentials
      if (res && res.success === false && !res.isOffline) {
        setLoading(false);
        return { success: false, error: res.message || 'Invalid credentials.' };
      }
    } catch (e) {
      console.warn('Backend login attempt fell back to offline demo logic:', e);
    }

    // 2. Fallback offline simulation (if backend is offline / unseeded)
    await new Promise(r => setTimeout(r, 300));

    // Check credentials against demo users or stored registered accounts
    const savedAccounts = JSON.parse(localStorage.getItem('ai_interviewer_accounts') || '[]');
    const matchingAccount = savedAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.role === role
    );

    if (matchingAccount) {
      if (matchingAccount.password === password) {
        const authUser = { ...matchingAccount };
        delete authUser.password;
        setUser(authUser);
        setLoading(false);
        return { success: true, user: authUser };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
    }

    // Check default demo accounts
    if (
      (role === 'candidate' && email.toLowerCase() === 'alex@candidate.com') ||
      (role === 'company' && email.toLowerCase() === 'recruiter@techcorp.io')
    ) {
      if (password === 'password123') {
        const demoUser = DEMO_USERS[role];
        setUser(demoUser);
        setLoading(false);
        return { success: true, user: demoUser };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid password. For demo accounts, use password123' };
      }
    }

    // Default mock login fallback if entered any valid email
    if (email && password.length >= 6) {
      const fallbackUser = {
        id: `${role}-${Date.now()}`,
        role,
        email,
        name: email.split('@')[0].toUpperCase(),
        ...(role === 'company' ? { companyName: 'Enterprise Partner' } : { college: 'Tech University' })
      };
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }

    setLoading(false);
    return { success: false, error: 'Invalid credentials. Password must be at least 6 characters.' };
  };

  const signup = async (formData, role) => {
    setLoading(true);

    try {
      // 1. Attempt Live Backend API Registration
      const res = await api.register({ ...formData, role });

      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem('ai_interviewer_token', res.token);
        }
        setUser(res.user);
        syncWithBackend();
        setLoading(false);
        return { success: true, user: res.user };
      }

      if (res && res.success === false && !res.isOffline) {
        setLoading(false);
        return { success: false, error: res.message || 'Registration failed.' };
      }
    } catch (e) {
      console.warn('Backend register attempt fell back to offline storage:', e);
    }

    // 2. Fallback offline registration
    await new Promise(r => setTimeout(r, 300));

    const savedAccounts = JSON.parse(localStorage.getItem('ai_interviewer_accounts') || '[]');
    const existing = savedAccounts.find(
      acc => acc.email.toLowerCase() === formData.email.toLowerCase() && acc.role === role
    );

    if (existing) {
      setLoading(false);
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      role,
      ...formData
    };

    savedAccounts.push(newUser);
    localStorage.setItem('ai_interviewer_accounts', JSON.stringify(savedAccounts));

    const authUser = { ...newUser };
    delete authUser.password;
    delete authUser.confirmPassword;

    setUser(authUser);
    setLoading(false);
    return { success: true, user: authUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai_interviewer_user');
    localStorage.removeItem('ai_interviewer_token');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
