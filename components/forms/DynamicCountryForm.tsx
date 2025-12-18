
import { useState, useMemo } from 'react';
import { BaseFormData } from '../../types';
import { FormInput, FormCheckbox, FormSection, PhotoUpload, Header, BackButton } from '../ui/FormComponents';
import { ImageIcon, Sparkles, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateTemplatePDF } from '../../utils/pdfGenerator';
import { processPassportImage, MRZData } from '../../utils/mrzHelper';
import { useAuth } from '../../context/AuthContext';

interface Props {
  country: string;
  flag: string;
  onBack: () => void;
}

export default function DynamicCountryForm({ country, flag, onBack }: Props) {
  const {  templates } = useAuth();
  const countryTemplates = templates.filter(t => t.country === country);
  
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState<BaseFormData>({
    photos: { face: null, full: null, passport: null }
  });

  const requiredFields = useMemo(() => {
    return Array.from(new Set(countryTemplates.flatMap(t => t.fields)))
      .filter((f, index, self) => self.findIndex(t => t.key === f.key) === index)
      .filter(f => !['photoFace', 'photoFull', 'photoPassport'].includes(f.key));
  }, [countryTemplates]);

  // Completion Tracking
  const completionPercentage = useMemo(() => {
    if (requiredFields.length === 0) return 0;
    const filledCount = requiredFields.filter(f => !!formData[f.key]).length;
    const photoCount = Object.values(formData.photos).filter(p => !!p).length;
    return Math.round(((filledCount + photoCount) / (requiredFields.length + 3)) * 100);
  }, [formData, requiredFields]);

  const handleInputChange = (key: string, value: any) => {
    // Auto-uppercase strings for standardized CV appearance
    const formattedValue = typeof value === 'string' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [key]: formattedValue }));
  };

  const handlePhotoUpload = async (type: 'face' | 'full' | 'passport', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        photos: { ...prev.photos, [type]: e.target?.result as string }
      }));
    };
    reader.readAsDataURL(file);

    if (type === 'passport') {
      setIsScanning(true);
      try {
        const data: MRZData = await processPassportImage(file);
        setFormData(prev => ({
          ...prev,
          fullName: data.fullName,
          passportNumber: data.passportNumber,
          dob: data.dob,
          expiryDate: data.expiryDate,
          placeOfIssue: data.placeOfIssue || 'ADDIS ABABA',
          pob: data.pob
        }));
      } catch (e: any) {
        alert("Scan Failed: " + e.message);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const renderFieldsByCategory = (category: string) => {
    const categoryFields = requiredFields.filter(f => f.category === category);
    if (categoryFields.length === 0) return null;

    return (
      <FormSection key={category} title={category.toUpperCase()} accentColor="pixel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryFields.map(field => {
            if (field.type === 'checkmark' || field.type === 'boolean') {
              return (
                <FormCheckbox 
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  checked={!!formData[field.key]}
                  onChange={e => handleInputChange(field.key, e.target.checked)}
                />
              );
            }
            return (
              <FormInput 
                key={field.key}
                label={field.label}
                value={formData[field.key] || ''}
                onChange={e => handleInputChange(field.key, e.target.value)}
                type={field.key.toLowerCase().includes('date') || field.key === 'dob' ? 'date' : 'text'}
              />
            );
          })}
        </div>
      </FormSection>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 animate-fade-in relative">
      <BackButton onClick={onBack} />
      <Header title={`${country.toUpperCase()} Generator`} subtitle="Engineered Recruitment Solution" flag={flag} />

      {/* Completion Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
         <div className="bg-secondary/90 backdrop-blur-2xl border border-surfaceElevated p-4 rounded-[24px] shadow-glass flex items-center gap-4">
            <div className="flex-1">
               <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1.5">
                  <span>Form Completion</span>
                  <span className="text-pixel">{completionPercentage}%</span>
               </div>
               <div className="w-full h-1.5 bg-primary rounded-full overflow-hidden">
                  <div className="h-full bg-pixel transition-all duration-700" style={{ width: `${completionPercentage}%` }}></div>
               </div>
            </div>
            {completionPercentage === 100 && <CheckCircle2 className="text-pixel animate-pulse" size={24}/>}
         </div>
      </div>

      {countryTemplates.length === 0 ? (
        <div className="bg-secondary/50 p-20 rounded-[48px] border-2 border-dashed border-surfaceElevated text-center backdrop-blur-md">
            <Sparkles size={64} className="mx-auto mb-6 text-slate-800" />
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">No Layouts Detected</h3>
            <p className="text-slate-500 mb-12 max-w-xs mx-auto text-sm">Please build and deploy a {country.toUpperCase()} CV template in the Builder to activate this country.</p>
            <button onClick={() => (window as any).onNavigate('settings')} className="px-10 py-4 bg-pixel text-white font-black rounded-2xl hover:bg-pixelDark transition-all shadow-pixel">
              Open Builder Console
            </button>
        </div>
      ) : (
        <div className="space-y-12">
          <FormSection title="Media Asset Mapping" icon={<ImageIcon className="text-pixel"/>} accentColor="pixel">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PhotoUpload label="FACE PHOTO" type="face" preview={formData.photos.face} onUpload={f => handlePhotoUpload('face', f)} onRemove={() => handleInputChange('photos', {...formData.photos, face: null})} colorClass="pixel" />
                <PhotoUpload label="FULL BODY" type="full" preview={formData.photos.full} onUpload={f => handlePhotoUpload('full', f)} onRemove={() => handleInputChange('photos', {...formData.photos, full: null})} colorClass="pixel" />
                <PhotoUpload label="PASSPORT SCAN" type="pass" preview={formData.photos.passport} onUpload={f => handlePhotoUpload('passport', f)} onRemove={() => handleInputChange('photos', {...formData.photos, passport: null})} colorClass="pixel" isScanning={isScanning} />
             </div>
          </FormSection>

          {['personal', 'passport', 'experience', 'skills', 'contact', 'custom'].map(cat => renderFieldsByCategory(cat))}

          <div className="bg-secondary/60 p-12 rounded-[48px] border border-surfaceElevated shadow-2xl mt-16 backdrop-blur-xl">
            <div className="text-center mb-10">
                <h4 className="text-xs font-black text-pixel uppercase tracking-[0.3em] mb-2">Ready for Export</h4>
                <p className="text-slate-500 text-sm">Choose an office layout to generate the final CV.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {countryTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => generateTemplatePDF(formData, t)}
                    className="p-6 bg-surfaceElevated/30 border border-surfaceElevated rounded-3xl flex items-center justify-between hover:bg-pixel hover:border-pixel group transition-all"
                  >
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-2xl bg-secondary group-hover:bg-white/20 text-pixel group-hover:text-white transition-colors">
                          <FileText size={20}/>
                       </div>
                       <div className="text-left">
                          <div className="font-black text-white text-sm uppercase">{t.name}</div>
                          <div className="text-[10px] text-slate-500 group-hover:text-white/70 uppercase font-bold">{t.fields.length} Active Fields</div>
                       </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white translate-x-0 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
