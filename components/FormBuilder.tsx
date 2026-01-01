import React, { useState } from 'react';
import { FormTemplate, FormField, FieldType } from '../types';
import { Icons } from './Icons';

interface FormBuilderProps {
  template: FormTemplate;
  onSave: (template: FormTemplate) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ template, onSave }) => {
  const [fields, setFields] = useState<FormField[]>(template.fields);
  const [formTitle, setFormTitle] = useState(template.title);

  const addField = (type: FieldType) => {
    const labelMap: Record<FieldType, string> = {
      text: 'New Text Field',
      number: 'New Number Field',
      photo: 'New Photo Field',
      long_text: 'New Long Text Field',
      date: 'New Date Field'
    };
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: labelMap[type],
      required: false,
      placeholder: type === 'date' ? 'Select date' : 'Enter details...'
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = () => {
    onSave({
      ...template,
      title: formTitle,
      fields
    });
    alert("Form template saved successfully!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
          <p className="text-slate-500 mt-1">Design your candidate application form.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
        >
          Save Changes
        </button>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Left: Editor Canvas */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <input 
              type="text" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 w-full placeholder-gray-400 text-slate-900"
              placeholder="Form Title"
            />
            <p className="text-slate-400 mt-2">This is what candidates will see at the top of the form.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/50">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative"
              >
                {!field.isSystem && (
                  <button 
                    onClick={() => removeField(field.id)}
                    className="absolute right-4 top-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Icons.Delete size={18} />
                  </button>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300">
                    <Icons.Drag size={20} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Label</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full text-base font-medium border-b border-gray-200 focus:border-primary-500 focus:outline-none py-1 bg-transparent"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Type</label>
                        <div className="flex items-center gap-2 py-1 text-slate-600 bg-gray-50 px-3 rounded-lg border border-gray-100">
                           {field.type === 'photo' && <Icons.Camera size={14} />}
                           {field.type === 'text' && <Icons.Forms size={14} />}
                           {field.type === 'number' && <span className="font-mono text-xs">123</span>}
                           {field.type === 'date' && <Icons.Calendar size={14} />}
                           {field.type === 'long_text' && <Icons.Forms size={14} />}
                           <span className="text-sm capitalize">{field.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!field.isSystem && (
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-600">Required field</span>
                        </label>
                        <div className="flex-1">
                             <input 
                              type="text" 
                              placeholder="Placeholder text..."
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-primary-500 focus:outline-none"
                            />
                        </div>
                      </div>
                    )}
                    {field.isSystem && (
                         <div className="flex items-center gap-2">
                             <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">System Mandatory Field</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50/50">
              Drag fields here or click items on the right to add
            </div>
          </div>
        </div>

        {/* Right: Tools Panel */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Form Components</h3>
          <div className="space-y-3">
            <ToolButton 
              icon={<Icons.Forms />} 
              label="Short Text" 
              onClick={() => addField('text')} 
              description="Name, Email, City"
            />
            <ToolButton 
              icon={<Icons.Forms />} 
              label="Long Text" 
              onClick={() => addField('long_text')} 
              description="Bio, Cover Letter"
            />
            <ToolButton 
              icon={<span className="font-mono text-sm font-bold">123</span>} 
              label="Number" 
              onClick={() => addField('number')} 
              description="Age, Experience, Salary"
            />
            <ToolButton 
              icon={<Icons.Calendar />} 
              label="Date" 
              onClick={() => addField('date')} 
              description="Date of Birth, Start Date"
            />
             <div className="pt-4 mt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Settings</h4>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Form Active</span>
                     <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, label, description, onClick }: { icon: React.ReactNode, label: string, description: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
  >
    <div className="flex items-center gap-3 mb-1">
      <div className="text-slate-400 group-hover:text-primary-600 transition-colors">
        {icon}
      </div>
      <span className="font-medium text-slate-700 group-hover:text-primary-800">{label}</span>
    </div>
    <p className="text-xs text-slate-400 pl-8">{description}</p>
  </button>
);

export default FormBuilder;