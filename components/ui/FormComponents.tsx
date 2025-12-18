
import React from 'react';
import { Camera, User, FileText, ArrowLeft, Loader2, ScanLine, Trash2, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1.5 group">
    <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1 transition-colors group-focus-within:text-pixel">{label}</label>
    <input
      className={`w-full p-3.5 bg-secondary border border-surfaceElevated rounded-2xl text-white outline-none focus:border-pixel focus:ring-4 focus:ring-pixel/10 transition-all duration-200 placeholder:text-slate-700 ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const FormSelect: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1">{label}</label>
    <select
      className={`w-full p-3.5 bg-secondary border border-surfaceElevated rounded-2xl text-white outline-none focus:border-pixel focus:ring-4 focus:ring-pixel/10 transition-all duration-200 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-secondary text-white">
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export const FormCheckbox: React.FC<{ id: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ id, label, checked, onChange, className }) => (
  <div className={`flex items-center gap-3 p-4 bg-secondary border border-surfaceElevated rounded-2xl cursor-pointer hover:border-pixel transition-all group ${className}`}>
    <div className="relative flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 appearance-none border-2 border-slate-700 rounded-md checked:bg-pixel checked:border-pixel transition-all cursor-pointer"
      />
      {checked && <CheckCircle2 className="absolute pointer-events-none w-3 h-3 text-white left-1" />}
    </div>
    <label htmlFor={id} className="cursor-pointer font-bold text-sm select-none text-slate-400 group-hover:text-white">{label}</label>
  </div>
);

export const PhotoUpload: React.FC<{ label: string; type: 'face' | 'full' | 'pass'; preview: string | null; onUpload: (file: File) => void; onRemove?: () => void; colorClass: string; isScanning?: boolean }> = ({ label, type, preview, onUpload, onRemove, colorClass, isScanning }) => {
  const Icon = type === 'face' ? Camera : type === 'full' ? User : FileText;

  return (
    <div className="flex flex-col gap-2 relative group-upload">
      <div className={`w-full flex flex-col items-center justify-center min-h-[180px] bg-secondary border-2 border-dashed border-surfaceElevated rounded-3xl cursor-pointer hover:bg-surface/50 hover:border-${colorClass} transition-all relative overflow-hidden`}>
        {preview ? (
          <div className="relative w-full h-full p-2 group">
             <img src={preview} alt={label} className="w-full h-40 object-contain rounded-2xl" />
             <button 
                onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(); }}
                className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
             >
                <Trash2 size={16} />
             </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full p-6 cursor-pointer">
            <div className={`p-4 rounded-2xl bg-surface mb-3 text-slate-400 group-hover:text-${colorClass} transition-colors`}>
                <Icon size={28} />
            </div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-black">Tap to upload</span>
          </label>
        )}

        {isScanning && (
          <div className="absolute inset-0 bg-secondary/90 flex flex-col items-center justify-center text-white backdrop-blur-sm z-20">
            <ScanLine className="w-8 h-8 mb-3 animate-pulse text-pixel" />
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-pixel" />
              <span className="text-xs font-black uppercase tracking-tighter">AI Extraction...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FormSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; accentColor: string }> = ({ title, children, icon, accentColor }) => (
  <div className={`bg-secondary/40 backdrop-blur-md p-8 rounded-[32px] border border-surfaceElevated relative overflow-hidden mb-8`}>
    <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor}`}></div>
    <div className="flex items-center gap-3 mb-8 text-xs font-black tracking-widest text-slate-500 uppercase">
      {icon}
      <span>{title}</span>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="fixed top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 bg-secondary/80 backdrop-blur-xl border border-surfaceElevated rounded-2xl font-bold text-sm hover:bg-surface hover:-translate-x-1 transition-all shadow-2xl">
    <ArrowLeft size={18} /> Back
  </button>
);

export const Header: React.FC<{ title: string; subtitle: string; flag: string }> = ({ title, subtitle, flag }) => (
  <div className="text-center mb-12 pt-24 animate-fade-in-down">
    <div className="inline-block px-4 py-1.5 rounded-full bg-surfaceElevated/50 border border-surfaceElevated text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
       Pixel Recruitment Engine v2.5
    </div>
    <div className="text-5xl font-black mb-4 flex items-center justify-center gap-4">
      <span className="drop-shadow-2xl">{flag}</span>
      <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{title}</span>
    </div>
    <div className="text-slate-500 font-medium max-w-md mx-auto">{subtitle}</div>
  </div>
);
