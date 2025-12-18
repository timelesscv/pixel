
import React, { useState } from 'react';
import { ViewState, AppSettings } from '../../types';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Settings, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  ChevronDown, 
  ChevronRight, 
  Globe, 
  HelpCircle, 
  Phone, 
  Crown, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  settings: AppSettings;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<Props> = ({ currentView, onNavigate, settings, isOpen, onToggle }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const { logout, user } = useAuth();

  const getDaysLeft = () => {
    if (!user?.subscriptionExpiry) return 0;
    const end = new Date(user.subscriptionExpiry);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const daysLeft = getDaysLeft();

  const MenuItem = ({ view, icon, label }: { view: ViewState; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`
        w-full flex items-center transition-all mb-1.5 relative group overflow-hidden
        ${isOpen ? 'px-4 py-2.5 rounded-xl gap-3' : 'justify-center py-3.5 rounded-xl'}
        ${currentView === view 
          ? 'bg-pixel text-white shadow-md shadow-pixel/20' 
          : 'text-slate-500 hover:bg-surfaceElevated hover:text-white'}
      `}
      title={!isOpen ? label : ''}
    >
      <div className={`flex items-center justify-center shrink-0 ${isOpen ? '' : 'w-8 h-8'}`}>
        {icon}
      </div>
      {isOpen && (
        <span className="whitespace-nowrap font-bold text-[13px] tracking-tight">{label}</span>
      )}
      {!isOpen && currentView === view && (
        <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full"></div>
      )}
    </button>
  );

  return (
    <div 
      className={`
        fixed top-0 right-0 h-screen bg-secondary border-l border-surfaceElevated z-40 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Header Area: Professional sizing and layout */}
      <div className={`p-4 flex flex-col shrink-0`}>
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'flex-col gap-6'} w-full`}>
          <button 
            onClick={onToggle} 
            className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-surfaceElevated order-1"
          >
            {isOpen ? <X size={18} /> : <Menu size={20} />}
          </button>
          
          {isOpen && (
            <div className="flex flex-col text-right animate-fade-in order-2 flex-1 mr-3">
              <span className="font-black text-white text-base tracking-tighter leading-none">Pixel CV</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">Engine v2.0</span>
            </div>
          )}

          <div 
            className={`
              bg-gradient-to-br from-pixel to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-all order-3
              ${isOpen ? 'w-9 h-9' : 'w-10 h-10'}
            `}
          >
            <span className="font-black text-white text-base">P</span>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-4">
        <MenuItem view="dashboard" icon={<LayoutDashboard size={isOpen ? 18 : 20}/>} label="Dashboard" />
        
        <div className="mt-4 mb-2">
          <button 
            onClick={() => isOpen ? setIsCreateOpen(!isCreateOpen) : onToggle()}
            className={`
              w-full flex items-center transition-all text-slate-500 hover:text-white hover:bg-surfaceElevated mb-1
              ${isOpen ? 'px-4 py-2.5 rounded-xl justify-between' : 'justify-center py-3.5 rounded-xl'}
              ${isCreateOpen && isOpen ? 'bg-surfaceElevated/40' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <FolderPlus size={isOpen ? 18 : 20}/>
              {isOpen && <span className="font-bold text-[13px] tracking-tight">Form Filler</span>}
            </div>
            {isOpen && (isCreateOpen ? <ChevronDown size={14} className="opacity-40"/> : <ChevronRight size={14} className="opacity-40"/>)}
          </button>

          {isCreateOpen && isOpen && (
            <div className="mr-3 mt-1 space-y-1 border-r-2 border-surfaceElevated/50 pr-3 text-right animate-fade-in-down">
              {Object.entries(settings.enabledCountries).map(([country, enabled]) => (
                enabled && (
                  <button
                    key={country}
                    onClick={() => onNavigate(country as ViewState)}
                    className={`
                      w-full flex items-center justify-end gap-3 px-4 py-2 rounded-lg transition-all
                      ${currentView === country 
                        ? 'text-pixel font-black' 
                        : 'text-slate-500 hover:text-white'}
                    `}
                  >
                    <span className="whitespace-nowrap text-[10px] uppercase tracking-widest font-black">{country}</span>
                    <span className="text-base leading-none">{country === 'kuwait' ? '🇰🇼' : country === 'saudi' ? '🇸🇦' : country === 'jordan' ? '🇯🇴' : country === 'oman' ? '🇴🇲' : country === 'uae' ? '🇦🇪' : country === 'qatar' ? '🇶🇦' : '🇧🇭'}</span>
                  </button>
                )
              ))}
              <button
                onClick={() => onNavigate('all')}
                className={`
                  w-full flex items-center justify-end gap-3 px-4 py-2 rounded-lg transition-all
                  ${currentView === 'all' ? 'text-accentAll font-black' : 'text-slate-500 hover:text-white'}
                `}
              >
                <span className="whitespace-nowrap text-[10px] uppercase tracking-widest font-black">Global Mass</span>
                <Globe size={14}/>
              </button>
            </div>
          )}
        </div>

        <div className="my-5 border-t border-surfaceElevated mx-2"></div>
        
        <MenuItem view="profile" icon={<UserCircle size={isOpen ? 18 : 20}/>} label="My Agency" />
        <MenuItem view="settings" icon={<Settings size={isOpen ? 18 : 20}/>} label="Builder Studio" />
        <MenuItem view="help" icon={<HelpCircle size={isOpen ? 18 : 20}/>} label="Help & Docs" />
        <MenuItem view="contact" icon={<Phone size={isOpen ? 18 : 20}/>} label="Support Line" />
      </div>

      {/* Subscription Status Card */}
      <div className="p-3 shrink-0">
        {isOpen ? (
          <div className="mb-4 p-5 bg-surface rounded-2xl border border-surfaceElevated relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-pixel/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-2 mb-3 text-yellow-500 font-black text-[9px] uppercase tracking-[0.2em]">
              <Crown size={12} /> Membership
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white leading-none tracking-tighter">{daysLeft}</div>
                <div className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Days Left</div>
              </div>
              <Clock size={18} className="text-slate-700" />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center gap-1 text-yellow-500/40 p-2">
            <Crown size={20} />
            <span className="text-[10px] font-black">{daysLeft}</span>
          </div>
        )}

        {/* Bottom Logout Area */}
        <div className={`pt-4 border-t border-surfaceElevated mt-2 ${!isOpen ? 'flex justify-center' : ''}`}>
          <button 
            onClick={logout}
            className={`
              w-full flex items-center transition-all rounded-xl text-red-400 hover:bg-red-400/10
              ${isOpen ? 'px-4 py-4 font-black text-[11px] gap-3' : 'h-14 w-14 justify-center'}
            `}
            title={!isOpen ? "Sign Out" : ""}
          >
            <LogOut size={isOpen ? 18 : 20} />
            {isOpen && <span className="uppercase tracking-[0.1em] font-black">Sign Out</span>}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 109, 243, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(125, 109, 243, 0.3); }
      `}</style>
    </div>
  );
};
