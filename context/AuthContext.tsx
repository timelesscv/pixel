
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppSettings, CustomTemplate, SubscriptionStatus } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  settings: AppSettings;
  templates: CustomTemplate[];
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  trackGeneration: (amount?: number) => void;
  saveSettings: (s: AppSettings) => void;
  saveTemplate: (t: CustomTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  addSubscription: (userId: string, type: 'month' | 'year') => Promise<void>;
  terminateUser: (userId: string) => Promise<void>;
  promoteSelf: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = "nathanasrat262@gmail.com";

const DEFAULT_SETTINGS: AppSettings = {
    enabledCountries: {
       kuwait: true, saudi: true, jordan: true, oman: true, uae: true, qatar: true, bahrain: true
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pixel_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
        fetchTemplates(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (!user || event === 'SIGNED_IN') {
             fetchProfile(session.user.id);
             fetchTemplates(session.user.id);
        }
      } else {
        setUser(null);
        setTemplates([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data && !error) {
        if (data.email === SUPER_ADMIN_EMAIL && data.role !== 'admin') {
             supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then();
        }
        mapAndSetUser(data); 
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Profile error:', error);
      setIsLoading(false);
    }
  };

  const mapAndSetUser = (data: any) => {
    const isSuperAdmin = data.email === SUPER_ADMIN_EMAIL;
    setUser({
        id: data.id, email: data.email, name: data.name, agencyName: data.agency_name, phone: data.phone,
        role: isSuperAdmin ? 'admin' : (data.role as 'admin' | 'user'),
        subscriptionStatus: data.subscription_status as SubscriptionStatus,
        subscriptionExpiry: data.subscription_expiry,
        joinedDate: data.created_at || new Date().toISOString(),
        cvGeneratedCount: data.cv_generated_count
     });
     setIsLoading(false);
  };

  const fetchTemplates = async (userId: string) => {
      try {
        const { data } = await supabase.from('templates').select('*').eq('owner_id', userId);
        if (data) {
            setTemplates(data.map((t: any) => ({
                id: t.id, name: t.name, country: t.country, pages: t.pages || [], fields: t.fields, createdAt: t.created_at
            })));
        }
      } catch (e) {
        console.error("Failed to fetch templates", e);
      }
  };

  const login = async (data: any) => {
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) throw error;
  };

  const register = async (data: any) => {
    const { error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { name: data.name, agency_name: data.agencyName, phone: data.phone } }
    });
    if (error) throw error;
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  const refreshUser = () => { if (user) fetchProfile(user.id); };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ name: data.name, agency_name: data.agencyName, phone: data.phone }).eq('id', user.id);
    if (error) throw error;
    refreshUser();
  };

  const changePassword = async (newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
  };

  const trackGeneration = async (amount: number = 1) => {
    if (!user) return;
    const newCount = (user.cvGeneratedCount || 0) + amount;
    setUser({ ...user, cvGeneratedCount: newCount });
    await supabase.from('profiles').update({ cv_generated_count: newCount }).eq('id', user.id);
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pixel_settings', JSON.stringify(newSettings));
  };

  const saveTemplate = async (t: CustomTemplate) => {
    if (!user) return;
    const { error } = await supabase.from('templates').insert({
        owner_id: user.id, name: t.name, country: t.country, pages: t.pages, fields: t.fields
    });
    if (error) throw error;
    fetchTemplates(user.id);
  };

  const deleteTemplate = async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
      if (user) fetchTemplates(user.id);
  };

  const getAllUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
          id: d.id, email: d.email, name: d.name, agencyName: d.agency_name, phone: d.phone, role: d.role,
          subscriptionStatus: d.subscription_status, subscriptionExpiry: d.subscription_expiry, joinedDate: d.created_at || '', cvGeneratedCount: d.cv_generated_count
      }));
  };

  const addSubscription = async (userId: string, type: 'month' | 'year') => {
      const { data } = await supabase.from('profiles').select('subscription_expiry, subscription_status').eq('id', userId).single();
      const now = new Date();
      let startDate = now;
      if (data && data.subscription_status === 'active' && data.subscription_expiry) {
          const currentExpiry = new Date(data.subscription_expiry);
          if (currentExpiry > now) startDate = currentExpiry;
      }
      const newExpiry = new Date(startDate);
      type === 'month' ? newExpiry.setMonth(newExpiry.getMonth() + 1) : newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      await supabase.from('profiles').update({ subscription_status: 'active', subscription_expiry: newExpiry.toISOString() }).eq('id', userId);
  };

  const terminateUser = async (userId: string) => {
      await supabase.from('profiles').update({ subscription_status: 'inactive' }).eq('id', userId);
  };
  
  const promoteSelf = async () => {
      if (!user) return;
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, isLoading, login, register, logout, 
      refreshUser, updateProfile, changePassword, trackGeneration,
      settings, templates, saveSettings, saveTemplate, deleteTemplate,
      getAllUsers, addSubscription, terminateUser, promoteSelf
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
