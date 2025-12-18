
import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateField, FieldType, FieldCategory } from '../../types';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Type, 
  Plus, 
  MousePointer2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  FileText,
  Search,
  CheckSquare,
  ImageIcon
} from 'lucide-react';

interface Props {
  onSave: (template: CustomTemplate) => void;
  onCancel: () => void;
}

const FIELD_GROUPS = [
  {
    title: 'Work Experience',
    fields: [
      { key: 'work_washing', label: 'Washing', type: 'checkmark' },
      { key: 'work_cleaning', label: 'Cleaning', type: 'checkmark' },
      { key: 'work_ironing', label: 'Ironing', type: 'checkmark' },
      { key: 'work_sewing', label: 'Sewing', type: 'checkmark' },
      { key: 'work_cooking', label: 'Cooking', type: 'checkmark' },
      { key: 'work_babycare', label: 'Baby Care', type: 'checkmark' }
    ]
  },
  {
    title: 'Previous Employment',
    fields: [
      { key: 'hasExperience', label: 'Has Previous Experience', type: 'checkmark' },
      { key: 'expCountry', label: 'Country', type: 'text' },
      { key: 'expPeriod', label: 'Period (Years)', type: 'text' },
      { key: 'expPosition', label: 'Position', type: 'text' }
    ]
  },
  {
    title: 'Personal Details',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text' },
      { key: 'refNo', label: 'Ref No', type: 'text' },
      { key: 'religion', label: 'Religion', type: 'text' },
      { key: 'dob', label: 'Date of Birth', type: 'text' },
      { key: 'age', label: 'Age', type: 'text' },
      { key: 'pob', label: 'Place of Birth', type: 'text' },
      { key: 'maritalStatus', label: 'Marital Status', type: 'text' },
      { key: 'children', label: 'Children', type: 'text' },
      { key: 'education', label: 'Education', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'text' }
    ]
  },
  {
    title: 'Photos',
    fields: [
      { key: 'photoFace', label: 'Face Photo', type: 'image' },
      { key: 'photoFull', label: 'Full Body', type: 'image' },
      { key: 'photoPassport', label: 'Passport', type: 'image' }
    ]
  },
  {
    title: 'Position & Salary',
    fields: [
      { key: 'positionApplied', label: 'Applied For', type: 'text' },
      { key: 'monthlySalary', label: 'Monthly Salary', type: 'text' }
    ]
  },
  {
    title: 'Contact Person',
    fields: [
      { key: 'contactName', label: 'Contact Name', type: 'text' },
      { key: 'contactRelation', label: 'Relationship', type: 'text' },
      { key: 'contactPhone', label: 'Contact Phone', type: 'text' },
      { key: 'contactAddress', label: 'Address', type: 'text' }
    ]
  },
  {
    title: 'Passport Details',
    fields: [
      { key: 'passportNumber', label: 'Passport Number', type: 'text' },
      { key: 'issueDate', label: 'Issue Date', type: 'text' },
      { key: 'expiryDate', label: 'Expiry Date', type: 'text' },
      { key: 'placeOfIssue', label: 'Place of Issue', type: 'text' }
    ]
  },
  {
    title: 'Language Proficiency',
    fields: [
      { key: 'lang_english', label: 'English (P/F/F)', type: 'text' },
      { key: 'lang_arabic', label: 'Arabic (P/F/F)', type: 'text' }
    ]
  }
];

export const TemplateBuilder: React.FC<Props> = ({ onSave, onCancel }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [name, setName] = useState('New Office Template');
  const [country, setCountry] = useState('kuwait');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setPages([...pages, reader.result as string]);
        if (pages.length === 0) setCurrentPageIndex(0);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addField = (template: { key: string; label: string; type: string }) => {
    if (pages.length === 0) return alert("Please upload a CV page background first.");
    
    const newField: TemplateField = {
      id: crypto.randomUUID(),
      key: template.key,
      label: template.label,
      x: 20,
      y: 20,
      width: template.type === 'checkmark' ? 4 : template.type === 'image' ? 30 : 40,
      height: template.type === 'checkmark' ? 4 : template.type === 'image' ? 40 : 6,
      page: currentPageIndex + 1,
      type: template.type as FieldType,
      category: 'personal',
      fontSize: 12,
      fontFamily: 'Helvetica',
      color: '#000000',
      bold: false,
      italic: false,
      align: 'left'
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    setSelectedFieldId(fieldId);
    setIsDragging(true);
    const field = fields.find(f => f.id === fieldId);
    if (field && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;
      dragOffset.current = { x: clickX - field.x, y: clickY - field.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedFieldId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.current.x;
    let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.current.y;

    // Constrain within bounds
    newX = Math.max(0, Math.min(100 - (fields.find(f => f.id === selectedFieldId)?.width || 0), newX));
    newY = Math.max(0, Math.min(100 - (fields.find(f => f.id === selectedFieldId)?.height || 0), newY));

    setFields(prev => prev.map(f => f.id === selectedFieldId ? { 
      ...f, 
      x: parseFloat(newX.toFixed(2)), 
      y: parseFloat(newY.toFixed(2)) 
    } : f));
  };

  const handleMouseUp = () => setIsDragging(false);

  const activeField = fields.find(f => f.id === selectedFieldId);

  const updateActiveField = (updates: Partial<TemplateField>) => {
    if (!selectedFieldId) return;
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f));
  };

  const filteredGroups = FIELD_GROUPS.map(group => ({
    ...group,
    fields: group.fields.filter(f => 
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.fields.length > 0);

  return (
    <div className="fixed inset-0 bg-[#090a0f] z-[100] flex flex-col overflow-hidden text-slate-200 font-sans select-none animate-fade-in dark:bg-primary">
      
      {/* HEADER SECTION */}
      <header className="h-16 border-b border-surfaceElevated bg-secondary flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Exit Studio</span>
          </button>
          <div className="h-6 w-px bg-surfaceElevated"></div>
          <div className="flex flex-col">
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-transparent border-none p-0 text-pixel font-black text-lg outline-none focus:ring-0 w-64"
              placeholder="Layout Name"
            />
            <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-2">
              Pixel Studio • <span className="text-white/40">{country}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave({ id: crypto.randomUUID(), name, country, pages, fields, createdAt: new Date().toISOString() })}
            className="flex items-center gap-2 px-8 py-2.5 bg-pixel rounded-xl text-white font-black text-[11px] hover:bg-pixelDark transition-all shadow-pixel"
          >
            <Save size={16} /> SAVE LAYOUT
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: FIELD LIBRARY */}
        <aside className="w-80 border-r border-surfaceElevated bg-secondary flex flex-col shrink-0">
          <div className="p-4 border-b border-surfaceElevated bg-black/20">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  placeholder="SEARCH FIELDS..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-primary border border-surfaceElevated rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-black tracking-widest text-white outline-none focus:border-pixel transition-all" 
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-6">
                 <h4 className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{group.title}</h4>
                 <div className="space-y-0.5">
                   {group.fields.map(f => {
                     const isUsed = fields.some(field => field.key === f.key && field.page === currentPageIndex + 1);
                     return (
                      <button 
                         key={f.key}
                         onClick={() => addField(f)}
                         className={`w-full text-left px-4 py-3 rounded-xl hover:bg-surfaceElevated group transition-all flex items-center gap-3 ${isUsed ? 'opacity-50' : ''}`}
                      >
                         <div className={`w-8 h-8 rounded-lg bg-primary border border-surfaceElevated flex items-center justify-center transition-colors shrink-0 ${isUsed ? 'text-slate-700' : 'text-slate-500 group-hover:text-pixel group-hover:border-pixel'}`}>
                            {f.type === 'checkmark' ? <CheckSquare size={14}/> : f.type === 'image' ? <ImageIcon size={14}/> : <Type size={14}/>}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{f.label}</span>
                            <span className="text-[9px] text-slate-600 uppercase font-black">{f.key}</span>
                         </div>
                         {isUsed && <span className="ml-auto text-[8px] font-black text-slate-700 uppercase">Used</span>}
                      </button>
                    )})}
                 </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER: CANVAS WORKSPACE */}
        <main 
          className="flex-1 bg-primary overflow-auto flex flex-col items-center p-12 relative scrollbar-hide"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            ref={containerRef}
            className="relative bg-white shadow-2xl shrink-0 transition-all duration-300"
            style={{ width: '100%', maxWidth: '600px', aspectRatio: '210/297' }}
          >
            {pages.length > 0 ? (
              <>
                <img src={pages[currentPageIndex]} className="w-full h-full object-cover pointer-events-none" />
                
                {fields.filter(f => f.page === currentPageIndex + 1).map(f => (
                  <div 
                    key={f.id}
                    onMouseDown={(e) => handleMouseDown(e, f.id)}
                    className={`
                      absolute border-2 flex items-center justify-center cursor-move transition-all
                      ${selectedFieldId === f.id 
                        ? 'border-pixel border-dashed bg-pixel/10 z-30 ring-4 ring-pixel/10' 
                        : 'border-slate-400 border-dashed bg-white/20 hover:border-pixel/40 z-20'}
                    `}
                    style={{
                      left: `${f.x}%`, top: `${f.y}%`,
                      width: `${f.width}%`, height: `${f.height}%`,
                      fontFamily: f.fontFamily,
                      fontSize: `${f.fontSize}px`,
                      fontWeight: f.bold ? 'bold' : 'normal',
                      fontStyle: f.italic ? 'italic' : 'normal',
                      color: f.color,
                      textAlign: f.align
                    }}
                  >
                    {f.type === 'image' ? (
                      <ImageIcon className="opacity-20 text-slate-900" size={24}/>
                    ) : f.type === 'checkmark' ? (
                      <span className="font-bold opacity-40">X</span>
                    ) : (
                      <span className="truncate px-1 w-full text-[8px] opacity-40 font-black uppercase tracking-tighter select-none overflow-hidden">
                        {f.label}
                      </span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-6 bg-secondary/50">
                <div className="w-24 h-24 rounded-[32px] bg-secondary border border-surfaceElevated flex items-center justify-center animate-pulse shadow-glass">
                   <FileText size={40} className="text-pixel" />
                </div>
                <div className="text-center">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 text-slate-500">Workspace Pending Content</p>
                   <label className="px-10 py-4 bg-pixel text-white font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-pixelDark transition-all shadow-pixel">
                    Import Page Background
                    <input type="file" hidden accept="image/*" onChange={handlePageUpload} />
                   </label>
                </div>
              </div>
            )}
          </div>

          {/* PAGE SWITCHER BOTTOM DOCK */}
          {pages.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-secondary/90 backdrop-blur-2xl border border-surfaceElevated rounded-[24px] shadow-glass z-50">
              {pages.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPageIndex(i)}
                  className={`w-14 h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center border-2 ${currentPageIndex === i ? 'bg-pixel text-white border-pixel shadow-pixel' : 'text-slate-500 bg-primary border-surfaceElevated hover:border-pixel'}`}
                >
                  {i + 1}
                </button>
              ))}
              <label className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white bg-primary border-2 border-dashed border-surfaceElevated cursor-pointer hover:border-pixel transition-all group">
                <Plus size={20} className="group-hover:scale-125 transition-transform" />
                <input type="file" hidden accept="image/*" onChange={handlePageUpload} />
              </label>
            </div>
          )}
        </main>

        {/* RIGHT: PROPERTY INSPECTOR */}
        <aside className="w-80 border-l border-surfaceElevated bg-secondary flex flex-col shrink-0">
          <div className="p-4 border-b border-surfaceElevated bg-black/20 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            <MousePointer2 size={14} className="text-pixel" /> Precision Inspector
          </div>

          {activeField ? (
            <div className="p-6 space-y-10 animate-slide-in custom-scrollbar overflow-y-auto">
              
              <div className="flex items-start justify-between">
                <div className="max-w-[180px]">
                   <h3 className="text-pixel font-black text-xl leading-none mb-1 uppercase tracking-tighter truncate">{activeField.label}</h3>
                   <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{activeField.key} • Page {activeField.page}</span>
                </div>
                <button 
                  onClick={() => { setFields(fields.filter(f => f.id !== activeField.id)); setSelectedFieldId(null); }}
                  className="p-3 bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* GEOMETRY BLOCK */}
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-surfaceElevated pb-2 flex justify-between">
                   <span>Position (%)</span>
                   <span className="text-pixel">Absolute</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">X-Axis</label>
                    <input type="number" step="0.1" value={activeField.x} onChange={e => updateActiveField({ x: parseFloat(e.target.value) })} className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3 text-pixel font-mono text-xs focus:border-pixel outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Y-Axis</label>
                    <input type="number" step="0.1" value={activeField.y} onChange={e => updateActiveField({ y: parseFloat(e.target.value) })} className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3 text-pixel font-mono text-xs focus:border-pixel outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Width (%)</label>
                    <input type="number" step="0.1" value={activeField.width} onChange={e => updateActiveField({ width: parseFloat(e.target.value) })} className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3 text-white/70 font-mono text-xs focus:border-pixel outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Height (%)</label>
                    <input type="number" step="0.1" value={activeField.height} onChange={e => updateActiveField({ height: parseFloat(e.target.value) })} className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3 text-white/70 font-mono text-xs focus:border-pixel outline-none" />
                  </div>
                </div>
              </div>

              {/* TYPOGRAPHY BLOCK */}
              <div className="space-y-6">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-surfaceElevated pb-2">Styling & Type</div>
                
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Font Family</label>
                  <select 
                    value={activeField.fontFamily}
                    onChange={e => updateActiveField({ fontFamily: e.target.value as any })}
                    className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-pixel appearance-none cursor-pointer"
                  >
                    <option value="Helvetica">Helvetica (Modern)</option>
                    <option value="Times">Times New Roman (Classic)</option>
                    <option value="Courier">Courier New (Mono)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Size (pt)</label>
                    <input type="number" value={activeField.fontSize} onChange={e => updateActiveField({ fontSize: parseInt(e.target.value) })} className="w-full bg-primary border border-surfaceElevated rounded-xl px-4 py-3 text-xs text-white focus:border-pixel outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Color Control</label>
                    <div className="flex gap-2">
                      <div className="relative w-12 h-10 overflow-hidden rounded-xl border border-surfaceElevated group">
                        <input 
                          type="color" 
                          value={activeField.color} 
                          onChange={e => updateActiveField({ color: e.target.value })} 
                          className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer border-none p-0 outline-none" 
                        />
                      </div>
                      <input 
                        type="text" 
                        value={activeField.color.toUpperCase()} 
                        onChange={e => updateActiveField({ color: e.target.value })} 
                        className="w-full bg-primary border border-surfaceElevated rounded-xl px-2 py-2 text-[10px] font-mono text-slate-400 outline-none focus:border-pixel" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Formatting & Alignment</label>
                  <div className="grid grid-cols-5 gap-1 p-1.5 bg-primary border border-surfaceElevated rounded-2xl overflow-hidden shadow-inner">
                    <button onClick={() => updateActiveField({ bold: !activeField.bold })} className={`p-3 rounded-xl transition-all ${activeField.bold ? 'bg-pixel text-white shadow-pixel' : 'text-slate-600 hover:text-white'}`}><Bold size={16} className="mx-auto" /></button>
                    <button onClick={() => updateActiveField({ italic: !activeField.italic })} className={`p-3 rounded-xl transition-all ${activeField.italic ? 'bg-pixel text-white shadow-pixel' : 'text-slate-600 hover:text-white'}`}><Italic size={16} className="mx-auto" /></button>
                    <div className="w-px h-6 bg-surfaceElevated my-auto mx-1"></div>
                    <button onClick={() => updateActiveField({ align: 'left' })} className={`p-3 rounded-xl transition-all ${activeField.align === 'left' ? 'bg-pixel text-white shadow-pixel' : 'text-slate-600 hover:text-white'}`}><AlignLeft size={16} className="mx-auto" /></button>
                    <button onClick={() => updateActiveField({ align: 'center' })} className={`p-3 rounded-xl transition-all ${activeField.align === 'center' ? 'bg-pixel text-white shadow-pixel' : 'text-slate-600 hover:text-white'}`}><AlignCenter size={16} className="mx-auto" /></button>
                    <button onClick={() => updateActiveField({ align: 'right' })} className={`p-3 rounded-xl transition-all ${activeField.align === 'right' ? 'bg-pixel text-white shadow-pixel' : 'text-slate-600 hover:text-white'}`}><AlignRight size={16} className="mx-auto" /></button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
              <MousePointer2 size={64} className="mb-6 text-slate-700 animate-bounce" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 max-w-[150px] mx-auto">Select a field from the layout to adjust properties</p>
            </div>
          )}
        </aside>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 109, 243, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(125, 109, 243, 0.5); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .shadow-pixel { box-shadow: 0 0 20px rgba(125, 109, 243, 0.3); }
      `}</style>

    </div>
  );
};
