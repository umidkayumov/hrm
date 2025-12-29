import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icons';
import { MOCK_FORM, MOCK_SUBMISSIONS } from './constants';
import { FormTemplate, Submission } from './types';
import Dashboard from './components/Dashboard';
import Applicants from './components/Applicants';
import FormBuilder from './components/FormBuilder';
import CandidateProfile from './components/CandidateProfile';
import TelegramView from './components/TelegramView';

// Simple Router implementation since we are in a SPA environment without heavy routing libs
type Route = 'dashboard' | 'applicants' | 'builder' | 'candidate' | 'telegram';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [formTemplate, setFormTemplate] = useState<FormTemplate>(MOCK_FORM);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle navigation
  const navigateTo = (route: Route, id?: string) => {
    setCurrentRoute(route);
    if (id) setSelectedCandidateId(id);
    setIsMobileMenuOpen(false);
  };

  const handleSaveForm = (updatedForm: FormTemplate) => {
    setFormTemplate(updatedForm);
    // In a real app, save to DB
  };

  const handleFormSubmit = (newSubmission: Submission) => {
    setSubmissions([newSubmission, ...submissions]);
    alert("Application submitted successfully!");
    // In a real app, this would happen on a separate client
  };

  // Render content based on route
  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <Dashboard 
            submissions={submissions}
          />
        );
      case 'applicants':
        return (
          <Applicants 
            submissions={submissions}
            onViewCandidate={(id) => navigateTo('candidate', id)}
          />
        );
      case 'builder':
        return (
          <FormBuilder 
            template={formTemplate} 
            onSave={handleSaveForm} 
          />
        );
      case 'candidate':
        const candidate = submissions.find(s => s.id === selectedCandidateId);
        return candidate ? (
          <CandidateProfile 
            candidate={candidate} 
            onBack={() => navigateTo('applicants')} 
          />
        ) : (
          <div>Candidate not found</div>
        );
      case 'telegram':
        // Telegram view handles its own layout (full screen mobile sim)
        return (
          <TelegramView 
            formTemplate={formTemplate} 
            onSubmit={handleFormSubmit}
            onExit={() => navigateTo('dashboard')}
          />
        );
      default:
        return <Dashboard submissions={submissions} />;
    }
  };

  // If in Telegram mode, render full screen without dashboard layout
  if (currentRoute === 'telegram') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 sticky top-0 h-screen z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Hrismi</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<Icons.Dashboard size={20} />} 
            label="Dashboard" 
            active={currentRoute === 'dashboard'} 
            onClick={() => navigateTo('dashboard')} 
          />
          <NavItem 
            icon={<Icons.Candidates size={20} />} 
            label="Applicants" 
            active={currentRoute === 'applicants' || currentRoute === 'candidate'} 
            onClick={() => navigateTo('applicants')} 
          />
          <NavItem 
            icon={<Icons.Forms size={20} />} 
            label="Form Builder" 
            active={currentRoute === 'builder'} 
            onClick={() => navigateTo('builder')} 
          />
          <NavItem 
            icon={<Icons.Mobile size={20} />} 
            label="Simulate Telegram" 
            active={false} 
            onClick={() => navigateTo('telegram')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <img src="https://picsum.photos/id/64/100/100" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Alex Morgan</p>
              <p className="text-xs text-slate-500">HR Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-100 z-30 p-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="text-xl font-bold text-slate-800">Hrismi</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-20 pt-20 px-6">
           <nav className="space-y-4">
            <NavItem icon={<Icons.Dashboard />} label="Dashboard" active={currentRoute === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <NavItem icon={<Icons.Candidates />} label="Applicants" active={currentRoute === 'applicants'} onClick={() => navigateTo('applicants')} />
            <NavItem icon={<Icons.Forms />} label="Form Builder" active={currentRoute === 'builder'} onClick={() => navigateTo('builder')} />
            <NavItem icon={<Icons.Mobile />} label="Simulate App" active={false} onClick={() => navigateTo('telegram')} />
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen md:p-0 pt-16">
        {renderContent()}
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary-50 text-primary-600 shadow-sm' 
        : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default App;