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

// Generate years from 1950 to current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

interface MobileDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return currentYear - 25; // Default to 25 years ago
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (value) return parseInt(value.split('-')[1]) - 1;
    return 0;
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    if (value) return parseInt(value.split('-')[2]);
    return 1;
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) }, 
    (_, i) => i + 1
  );

  const handleConfirm = () => {
    const month = String(selectedMonth + 1).padStart(2, '0');
    const day = String(selectedDay).padStart(2, '0');
    onChange(`${selectedYear}-${month}-${day}`);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-left flex items-center gap-3 focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Icons.Calendar size={16} />
        </div>
        <span className={value ? 'text-slate-900 text-sm' : 'text-slate-400 text-sm'}>
          {value ? formatDisplayDate(value) : placeholder || 'Select date'}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-[375px] bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-500 font-medium"
              >
                Cancel
              </button>
              <span className="font-semibold text-slate-900">Select Date</span>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-blue-600 font-semibold"
              >
                Done
              </button>
            </div>

            {/* Date Picker Wheels */}
            <div className="flex gap-2 p-4">
              {/* Month Selector */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 text-center">Month</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      // Adjust day if necessary
                      const maxDays = getDaysInMonth(selectedYear, parseInt(e.target.value));
                      if (selectedDay > maxDays) setSelectedDay(maxDays);
                    }}
                    className="w-full h-14 text-center text-lg font-medium bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 appearance-none cursor-pointer"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <Icons.Down className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Day Selector */}
              <div className="w-20">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 text-center">Day</label>
                <div className="relative">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full h-14 text-center text-lg font-medium bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 appearance-none cursor-pointer"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <Icons.Down className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Year Selector */}
              <div className="w-24">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 text-center">Year</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      // Adjust day if necessary (for leap years)
                      const maxDays = getDaysInMonth(parseInt(e.target.value), selectedMonth);
                      if (selectedDay > maxDays) setSelectedDay(maxDays);
                    }}
                    className="w-full h-14 text-center text-lg font-medium bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 appearance-none cursor-pointer"
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <Icons.Down className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="px-4 pb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-center text-white">
                <p className="text-blue-100 text-xs mb-1">Selected Date</p>
                <p className="text-xl font-bold">
                  {MONTHS[selectedMonth]} {selectedDay}, {selectedYear}
                </p>
              </div>
            </div>

            {/* Safe area spacer */}
            <div className="h-8"></div>
          </div>
        </div>
      )}
    </>
  );
};

const TelegramView: React.FC<TelegramViewProps> = ({ formTemplate, onSubmit, onExit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Split fields into chunks for a multi-step feel
  const fields = formTemplate.fields;
  const isLastStep = currentStep === fields.length - 1;

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required
    const missing = fields.filter(f => f.required && !formData[f.id]);
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      formId: formTemplate.id,
      candidateName: formData['f_name'] || 'Unknown Candidate',
      email: formData['f_email'] || 'No Email',
      role: formTemplate.title, // Default role to form title
      photoUrl: formData['f_photo'] ? URL.createObjectURL(formData['f_photo']) : 'https://picsum.photos/200',
      status: 'new',
      submittedAt: new Date().toISOString(),
      answers: formData
    };
    
    onSubmit(submission);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Mobile Frame Simulation */}
      <div className="w-full max-w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-slate-900 relative flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-20"></div>
        
        {/* Header */}
        <div className="pt-12 pb-4 px-6 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
           <button onClick={onExit} className="text-xs font-medium text-slate-400 hover:text-slate-800">Close Demo</button>
           <span className="font-semibold text-sm">Apply</span>
           <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{formTemplate.title}</h2>
             <p className="text-slate-500 text-sm mt-2">{formTemplate.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'text' || field.type === 'number' ? (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                ) : field.type === 'long_text' ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                ) : field.type === 'date' ? (
                  <MobileDatePicker
                    value={formData[field.id] || ''}
                    onChange={(date) => handleInputChange(field.id, date)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'photo' ? (
                  <div className="relative">
                     <input 
                      type="file" 
                      id={field.id}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                              handleInputChange(field.id, e.target.files[0]);
                          }
                      }}
                    />
                    <label htmlFor={field.id} className="block w-full aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                        {formData[field.id] ? (
                            <img src={URL.createObjectURL(formData[field.id])} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                        ) : (
                            <>
                                <Icons.Camera className="text-slate-400 mb-2" size={24} />
                                <span className="text-xs text-slate-400 font-medium">Tap to upload photo</span>
                            </>
                        )}
                    </label>
                  </div>
                ) : null}
              </div>
            ))}
            
            <div className="pt-4 pb-8">
                 <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                  Submit Application
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4">Powered by Hrismi • Telegram Verified</p>
            </div>
          </form>
        </div>

        {/* Telegram Bottom Bar Sim */}
        <div className="h-1 bg-gray-900 mx-auto w-1/3 rounded-full mb-2"></div>
      </div>
    </div>
  );
};

export default TelegramView;