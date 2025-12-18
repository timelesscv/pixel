
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BackButton, FormSection } from './FormComponents';
import { Settings, Globe, LayoutTemplate, ToggleLeft, ToggleRight, Trash } from 'lucide-react';
import { TemplateBuilder } from './TemplateBuilder';

interface Props {
  onBack: () => void;
}

export const SettingsPage: React.FC<Props> = ({ onBack }) => {
  const { settings, saveSettings, templates, deleteTemplate, saveTemplate } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'templates'>('general');
  const [showBuilder, setShowBuilder] = useState(false);

  const toggleCountry = (key: keyof typeof settings.enabledCountries) => {
     const newSettings = {
         ...settings,
         enabledCountries: {
             ...settings.enabledCountries,
             [key]: !settings.enabledCountries[key]
         }
     };
     saveSettings(newSettings);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-20 animate-fade-in">
      <BackButton onClick={onBack} />
      
      <div className="text-center mb-10">
         <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Settings className="text-accentAll"/> Settings
         </h1>
      </div>

      <div className="flex justify-center mb-8 gap-4">
          <button 
             onClick={() => setActiveTab('general')}
             className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'general' ? 'bg-accentAll text-black' : 'bg-surface text-slate-400'}`}
          >
             General
          </button>
          <button 
             onClick={() => setActiveTab('templates')}
             className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'templates' ? 'bg-accentAll text-black' : 'bg-surface text-slate-400'}`}
          >
             Templates
          </button>
      </div>

      {activeTab === 'general' && (
          <div className="max-w-2xl mx-auto">
             <FormSection title="Visible Countries" icon={<Globe />} accentColor="border-accentAll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {Object.entries(settings.enabledCountries).map(([key, enabled]) => (
                       <div key={key} className="flex items-center justify-between p-4 bg-primary rounded-xl border border-surfaceElevated">
                           <span className="capitalize font-bold text-white">{key}</span>
                           <button onClick={() => toggleCountry(key as any)} className="text-2xl transition-colors">
                               {enabled ? <ToggleRight className="text-green-500 w-10 h-10"/> : <ToggleLeft className="text-slate-600 w-10 h-10"/>}
                           </button>
                       </div>
                   ))}
                </div>
             </FormSection>
          </div>
      )}

      {activeTab === 'templates' && (
          <div>
              {!showBuilder ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Custom Templates</h2>
                        <button onClick={() => setShowBuilder(true)} className="px-4 py-2 bg-accentAll text-black rounded-lg font-bold">
                            + New Template
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(t => (
                            <div key={t.id} className="bg-secondary p-6 rounded-xl border border-surfaceElevated relative group">
                                <h3 className="font-bold text-white text-lg">{t.name}</h3>
                                <div className="text-slate-400 text-sm capitalize mb-4">{t.country}</div>
                                <div className="h-32 bg-primary rounded-lg overflow-hidden mb-4 relative">
                                    <img src={t.pages[0] || ''} alt={t.name} className="w-full h-full object-cover opacity-50" />
                                </div>
                                <button 
                                   onClick={() => deleteTemplate(t.id)}
                                   className="absolute top-4 right-4 text-slate-500 hover:text-red-500 bg-black/20 p-2 rounded-full"
                                >
                                   <Trash size={16} />
                                </button>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full text-center p-10 text-slate-500 border-2 border-dashed border-surfaceElevated rounded-xl">
                                No custom templates yet. Create one to support new offices!
                            </div>
                        )}
                    </div>
                  </>
              ) : (
                  <TemplateBuilder 
                     onSave={(t) => {
                         saveTemplate(t);
                         setShowBuilder(false);
                     }}
                     onCancel={() => setShowBuilder(false)}
                  />
              )}
          </div>
      )}

    </div>
  );
};
