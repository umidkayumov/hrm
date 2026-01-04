import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Building2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  type: string;
  logo: string;
  color: string;
}

const COMPANIES: Company[] = [
  {
    id: 'humano',
    name: 'Humano',
    type: 'HRM Dashboard',
    logo: 'H',
    color: 'bg-primary-600'
  },
  {
    id: 'nexacore',
    name: 'NexaCore',
    type: 'Cloud Services',
    logo: 'N',
    color: 'bg-cyan-500'
  },
  {
    id: 'pulseai',
    name: 'PulseAI',
    type: 'Machine Learning',
    logo: 'P',
    color: 'bg-amber-500'
  }
];

export function CompanySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-metal-50 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${selectedCompany.color} rounded-xl flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white`}>
            {selectedCompany.logo}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 leading-tight">{selectedCompany.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{selectedCompany.type}</p>
          </div>
        </div>
        <div className={`p-1 text-slate-400 group-hover:text-slate-600 transition-colors ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronsUpDown size={16} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-metal-50 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {COMPANIES.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  setSelectedCompany(company);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                  selectedCompany.id === company.id 
                    ? 'bg-slate-50' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${company.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {company.logo}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${selectedCompany.id === company.id ? 'text-slate-900' : 'text-slate-700'}`}>
                      {company.name}
                    </p>
                    <p className="text-xs text-slate-500">{company.type}</p>
                  </div>
                </div>
                {selectedCompany.id === company.id && (
                  <Check size={16} className="text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
