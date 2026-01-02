import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Icons } from './components/Icons';
import { 
  DashboardPage, 
  ApplicantsPage, 
  FormBuilderPage, 
  CandidatePage, 
  TelegramPage,
  CalendarPage
} from './pages';

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

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
            active={isActive('/')} 
            onClick={() => handleNavigate('/')} 
          />
          <NavItem 
            icon={<Icons.Candidates size={20} />} 
            label="Applicants" 
            active={isActive('/applicants') || isActive('/candidate')} 
            onClick={() => handleNavigate('/applicants')} 
          />
          <NavItem 
            icon={<Icons.Forms size={20} />} 
            label="Form Builder" 
            active={isActive('/builder')} 
            onClick={() => handleNavigate('/builder')} 
          />
          <NavItem 
            icon={<Icons.Calendar size={20} />} 
            label="Calendar" 
            active={isActive('/calendar')} 
            onClick={() => handleNavigate('/calendar')} 
          />
          <NavItem 
            icon={<Icons.Mobile size={20} />} 
            label="Simulate Telegram" 
            active={isActive('/telegram')} 
            onClick={() => handleNavigate('/telegram')} 
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
            <NavItem icon={<Icons.Dashboard />} label="Dashboard" active={isActive('/')} onClick={() => handleNavigate('/')} />
            <NavItem icon={<Icons.Candidates />} label="Applicants" active={isActive('/applicants')} onClick={() => handleNavigate('/applicants')} />
            <NavItem icon={<Icons.Forms />} label="Form Builder" active={isActive('/builder')} onClick={() => handleNavigate('/builder')} />
            <NavItem icon={<Icons.Calendar />} label="Calendar" active={isActive('/calendar')} onClick={() => handleNavigate('/calendar')} />
            <NavItem icon={<Icons.Mobile />} label="Simulate App" active={isActive('/telegram')} onClick={() => handleNavigate('/telegram')} />
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen md:p-0 pt-16">
        {children}
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Telegram page has its own full-screen layout */}
        <Route path="/telegram" element={<TelegramPage />} />
        
        {/* All other routes use the AppLayout */}
        <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/applicants" element={<AppLayout><ApplicantsPage /></AppLayout>} />
        <Route path="/builder" element={<AppLayout><FormBuilderPage /></AppLayout>} />
        <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
        <Route path="/candidate/:id" element={<AppLayout><CandidatePage /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;