
import React, { useState } from 'react';
import { BaseFormData } from '../../types';
import { FormInput, FormCheckbox, FormSection, PhotoUpload, Header, BackButton } from '../ui/FormComponents';
import { ImageIcon, Hash } from 'lucide-react';
import { generateTemplatePDF } from '../../utils/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onBack: () => void;
}

const AllForm: React.FC<Props> = ({ onBack }) => {
  const { trackGeneration, templates } = useAuth();
  const [formData, setFormData] = useState<BaseFormData>({
    photos: { face: null, full: null, passport: null }
  });

  // Unique list of all fields across all templates
  const allFields = Array.from(new Set(templates.flatMap(t => t.fields)))
    .filter((f, idx, self) => self.findIndex(t => t.key === f.key) === idx)
    .filter(f => !['photoFace', 'photoFull', 'photoPassport'].includes(f.key));

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const generateAll = async () => {
    if (templates.length === 0) return alert("No templates found.");
    const confirmed = window.confirm(`Ready to generate ${templates.length} CVs?`);
    if (!confirmed) return;

    try {
      for (const template of templates) {
        await generateTemplatePDF(formData, template);
        // Small delay between downloads to prevent browser blocking
        await new Promise(r => setTimeout(r, 500));
      }
      trackGeneration(templates.length);
      alert('✅ All PDFs generated successfully!');
    } catch (e) {
      alert("An error occurred during generation.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 animate-fade-in">
      <BackButton onClick={onBack} />
      <Header title="Mass Generate" subtitle={`${templates.length} Templates Connected`} flag="⚡" />

      {templates.length === 0 ? (
        <div className="text-center p-20 bg-secondary rounded-3xl border border-surfaceElevated text-slate-500">
           Please build some templates first to use this feature.
        </div>
      ) : (
        <div className="space-y-6">
          <FormSection title="Base Photos" icon={<ImageIcon />} accentColor="border-accentAll">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PhotoUpload label="FACE" type="face" preview={formData.photos.face} onUpload={f => {
                   const r = new FileReader(); r.onload = (e) => handleInputChange('photos', {...formData.photos, face: e.target?.result}); r.readAsDataURL(f);
                }} colorClass="accentAll" />
                <PhotoUpload label="FULL" type="full" preview={formData.photos.full} onUpload={f => {
                   const r = new FileReader(); r.onload = (e) => handleInputChange('photos', {...formData.photos, full: e.target?.result}); r.readAsDataURL(f);
                }} colorClass="accentAll" />
                <PhotoUpload label="PASSPORT" type="pass" preview={formData.photos.passport} onUpload={f => {
                   const r = new FileReader(); r.onload = (e) => handleInputChange('photos', {...formData.photos, passport: e.target?.result}); r.readAsDataURL(f);
                }} colorClass="accentAll" />
             </div>
          </FormSection>

          <FormSection title="Shared Data" icon={<Hash />} accentColor="border-accentAll">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allFields.map(f => (
                f.type === 'checkmark' ? (
                  <FormCheckbox key={f.key} id={f.key} label={f.label} checked={!!formData[f.key]} onChange={e => handleInputChange(f.key, e.target.checked)} />
                ) : (
                  <FormInput key={f.key} label={f.label} value={formData[f.key] || ''} onChange={e => handleInputChange(f.key, e.target.value.toUpperCase())} type={f.key.toLowerCase().includes('date') ? 'date' : 'text'} />
                )
              ))}
            </div>
          </FormSection>

          <div className="flex justify-center mt-10">
            <button 
              onClick={generateAll}
              className="px-12 py-5 bg-gradient-to-r from-accentAll to-orange-600 rounded-2xl font-bold text-xl text-white shadow-xl hover:scale-105 transition-all"
            >
              🚀 Generate {templates.length} CVs Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllForm;
