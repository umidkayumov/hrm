import React, { useState } from 'react';
import { FormTemplate, Submission } from '../types';
import { Icons } from './Icons';

interface TelegramViewProps {
  formTemplate: FormTemplate;
  onSubmit: (submission: Submission) => void;
  onExit: () => void;
}

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