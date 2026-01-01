import React, { useState } from 'react';
import { FormTemplate, Submission } from '../types';
import { Icons } from './Icons';

interface TelegramViewProps {
  formTemplate: FormTemplate;
  onSubmit: (submission: Submission) => void;
  onExit: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

const MobileDatePicker: React.FC<{ value: string; onChange: (date: string) => void; label: string }> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => value ? parseInt(value.split('-')[0]) : currentYear - 25);
  const [selectedMonth, setSelectedMonth] = useState(() => value ? parseInt(value.split('-')[1]) - 1 : 0);
  const [selectedDay, setSelectedDay] = useState(() => value ? parseInt(value.split('-')[2]) : 1);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    const month = String(selectedMonth + 1).padStart(2, '0');
    const day = String(selectedDay).padStart(2, '0');
    onChange(`${selectedYear}-${month}-${day}`);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-slate-400/80 ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-left flex items-center justify-between group active:scale-[0.99] transition-all"
      >
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-300'}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </span>
        <Icons.Calendar size={18} className="text-cyan-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 font-medium">Cancel</button>
              <span className="font-bold text-slate-800">Choose {label}</span>
              <button type="button" onClick={handleConfirm} className="text-cyan-500 font-bold px-4 py-1 bg-cyan-50 rounded-lg">Done</button>
            </div>

            <div className="flex gap-2 p-6">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 h-12 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-cyan-400 text-center font-bold text-slate-700"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-20 h-12 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-cyan-400 text-center font-bold text-slate-700"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-24 h-12 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-cyan-400 text-center font-bold text-slate-700"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="h-4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const TelegramView: React.FC<TelegramViewProps> = ({ formTemplate, onSubmit, onExit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missing = formTemplate.fields.filter(f => f.required && !formData[f.id]);
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const submission: Submission = {
        id: `sub-${Date.now()}`,
        formId: formTemplate.id,
        candidateName: formData['f_name'] || 'Unknown',
        email: formData['f_email'] || 'No Email',
        role: formTemplate.title,
        photoUrl: formData['f_photo'] ? URL.createObjectURL(formData['f_photo']) : 'https://picsum.photos/200',
        status: 'new',
        submittedAt: new Date().toISOString(),
        answers: formData
      };
      onSubmit(submission);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-32">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top duration-700">
           <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={onExit}
                className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
              >
                <Icons.Close size={20} />
              </button>
              <span className="text-slate-400 font-semibold text-sm uppercase tracking-widest">Application Form</span>
           </div>
           <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{formTemplate.title}</h1>
           <p className="text-slate-500 font-medium text-lg leading-relaxed">{formTemplate.description}</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Main Card */}
           <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-8 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-4 mb-4">
                 <div className="relative group">
                    <input 
                       type="file" id="f_photo" className="hidden" accept="image/*"
                       onChange={(e) => e.target.files?.[0] && handleInputChange('f_photo', e.target.files[0])}
                    />
                    <label 
                       htmlFor="f_photo"
                       className="block w-32 h-32 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer overflow-hidden transition-all hover:border-cyan-400 hover:bg-cyan-50/30 active:scale-95"
                    >
                       {formData['f_photo'] ? (
                          <img src={URL.createObjectURL(formData['f_photo'])} className="w-full h-full object-cover" alt="Avatar" />
                       ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                             <Icons.Camera className="text-slate-300" size={32} />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tap to Upload</span>
                          </div>
                       )}
                    </label>
                    <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                       <Icons.Plus size={16} />
                    </div>
                 </div>
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profile Photo</h3>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {formTemplate.fields.filter(f => f.type !== 'photo' && f.type !== 'date' && f.type !== 'long_text').map(field => (
                    <div key={field.id} className="flex flex-col gap-2">
                       <label className="text-[13px] font-semibold text-slate-400/80 ml-1">{field.label}</label>
                       <input 
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 outline-none font-medium text-slate-900 placeholder:text-slate-200 transition-all"
                       />
                    </div>
                 ))}
                 
                 {formTemplate.fields.filter(f => f.type === 'date').map(field => (
                    <MobileDatePicker 
                       key={field.id}
                       label={field.label}
                       value={formData[field.id] || ''}
                       onChange={(v) => handleInputChange(field.id, v)}
                    />
                 ))}
              </div>

              {/* Long Text */}
              {formTemplate.fields.filter(f => f.type === 'long_text').map(field => (
                 <div key={field.id} className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-slate-400/80 ml-1">{field.label}</label>
                    <textarea 
                       rows={4}
                       placeholder={field.placeholder}
                       onChange={(e) => handleInputChange(field.id, e.target.value)}
                       className="w-full px-5 py-4 rounded-[28px] bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 outline-none font-medium text-slate-900 placeholder:text-slate-200 transition-all resize-none"
                    />
                 </div>
              ))}
           </div>

           {/* Submit Button Section */}
           <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent z-40">
              <div className="max-w-2xl mx-auto">
                 <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-16 rounded-3xl bg-cyan-500 text-white font-bold text-lg shadow-2xl shadow-cyan-200/50 flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${isSubmitting ? 'opacity-70 grayscale pointer-events-none' : ''}`}
                 >
                   {isSubmitting ? (
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : (
                      <>
                        <span>Submit Application</span>
                        <Icons.Right size={20} />
                      </>
                   )}
                 </button>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
};

export default TelegramView;