
import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import Dashboard from './components/Dashboard';
import DynamicCountryForm from './components/forms/DynamicCountryForm';
import { HelpPage, ContactPage } from './components/InfoPages';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen, SubscriptionLock } from './components/ui/AuthScreens';
import { LogOut, Loader2, RefreshCcw } from 'lucide-react';
import { ProfilePage } from './components/ui/ProfilePage';
import { SettingsPage } from './components/ui/SettingsPage';
import { Sidebar } from './components/ui/Sidebar';
import { AdminDashboard } from './components/ui/AdminDashboard';
import { supabase } from './services/supabaseClient';
import AllForm from './components/forms/AllForm';

const MainApp: React.FC = () => {
  const { user, logout, isLoading, settings } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [greeting, setGreeting] = useState('Welcome to Pixel!');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    (window as any).onNavigate = setCurrentView;
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const name = user?.agencyName || 'Agency';
    if (hour < 12) setGreeting(`Good Morning, ${name}! 🌅`);
    else if (hour < 17) setGreeting(`Good Afternoon, ${name}! ☀️`);
    else setGreeting(`Good Evening, ${name}! 🌙`);
  }, [user]);

  const handleBack = () => {
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-pixel" />
        <div className="text-xl font-bold">Loading Pixel Engine...</div>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="mt-8 flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-900/50 hover:bg-red-900/50 transition-all">
          <RefreshCcw size={14} /> Reset Application
        </button>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.subscriptionStatus !== 'active') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button onClick={logout} className="text-sm text-slate-500 hover:text-white flex items-center gap-1"><LogOut size={14}/> Logout</button>
        </div>
        <SubscriptionLock />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} greeting={greeting} />;
      case 'help': return <HelpPage onBack={handleBack} />;
      case 'contact': return <ContactPage onBack={handleBack} />;
      case 'profile': return <ProfilePage onBack={handleBack} />;
      case 'settings': return <SettingsPage onBack={handleBack} />;
      case 'all': return <AllForm onBack={handleBack} />;
      case 'kuwait': return <DynamicCountryForm country="kuwait" flag="🇰🇼" onBack={handleBack} />;
      case 'saudi': return <DynamicCountryForm country="saudi" flag="🇸🇦" onBack={handleBack} />;
      case 'jordan': return <DynamicCountryForm country="jordan" flag="🇯🇴" onBack={handleBack} />;
      case 'oman': return <DynamicCountryForm country="oman" flag="🇴🇲" onBack={handleBack} />;
      case 'uae': return <DynamicCountryForm country="uae" flag="🇦🇪" onBack={handleBack} />;
      case 'qatar': return <DynamicCountryForm country="qatar" flag="🇶🇦" onBack={handleBack} />;
      case 'bahrain': return <DynamicCountryForm country="bahrain" flag="🇧🇭" onBack={handleBack} />;
      default: return <Dashboard onNavigate={setCurrentView} greeting={greeting} />;
    }
  };

  return (
    <div className="font-sans antialiased text-slate-200 flex bg-primary min-h-screen relative overflow-x-hidden">
      {/* Content Area with dynamic padding for Right-side Sidebar */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'}`}>
        <div className="p-4 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        settings={settings} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
