import React from 'react';
import { Icons } from './Icons';
import { Submission } from '../types';

interface DashboardProps {
  submissions: Submission[];
}

const Dashboard: React.FC<DashboardProps> = ({ submissions }) => {
  // Stats Calculation
  const total = submissions.length;
  const newApps = submissions.filter(s => s.status === 'new').length;
  const reviewed = submissions.filter(s => s.status === 'reviewed').length;
  const hired = submissions.filter(s => s.status === 'hired').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of recruitment performance and statistics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Candidates" value={total} icon={<Icons.Candidates />} color="bg-blue-50 text-blue-600" trend={12} />
        <StatCard label="New Applications" value={newApps} icon={<Icons.Pending />} color="bg-yellow-50 text-yellow-600" trend={5} />
        <StatCard label="In Progress" value={reviewed} icon={<Icons.Check />} color="bg-purple-50 text-purple-600" trend={-2} />
        <StatCard label="Hired" value={hired} icon={<Icons.Work />} color="bg-green-50 text-green-600" trend={8} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recruitment Funnel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-slate-900">Recruitment Funnel</h3>
             <button className="text-slate-400 hover:text-slate-600"><Icons.More size={20} /></button>
           </div>
           
           <div className="space-y-6">
             <FunnelStep label="Applications Received" count={total} total={total} color="bg-blue-500" />
             <FunnelStep label="Screening & Review" count={reviewed + hired + rejected} total={total} color="bg-indigo-500" />
             <FunnelStep label="Interview Stage" count={reviewed + hired} total={total} color="bg-purple-500" />
             <FunnelStep label="Offers Accepted" count={hired} total={total} color="bg-green-500" />
           </div>
        </div>

        {/* Mock Application Trend Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-slate-900">Application Trends</h3>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                <span className="text-xs text-slate-500">This Month</span>
             </div>
           </div>
           
           <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] pb-4">
              {[35, 42, 28, 55, 48, 62, 75].map((h, i) => (
                 <div key={i} className="w-full bg-gray-50 rounded-t-lg relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-primary-500/80 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                      style={{ height: `${h}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                        {h}
                      </div>
                    </div>
                 </div>
              ))}
           </div>
           <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
           </div>
        </div>

      </div>

      {/* Recent Activity Mini List (Optional filler for dashboard) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-slate-900">Recent Activity Log</h3>
        </div>
        <div className="p-6">
           <div className="space-y-6">
              {[
                { text: "New application received from Alice Freeman", time: "2 hours ago", type: "new" },
                { text: "Marcus Chen moved to Interview stage", time: "4 hours ago", type: "update" },
                { text: "Sarah Jenkins accepted offer", time: "1 day ago", type: "success" }
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                   <div className={`mt-0.5 w-2 h-2 rounded-full ${log.type === 'new' ? 'bg-blue-500' : log.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                   <div>
                      <p className="text-sm text-slate-700">{log.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, trend }: { label: string, value: number, icon: React.ReactNode, color: string, trend: number }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
       <div className={`p-3 rounded-xl ${color}`}>
         {React.cloneElement(icon as React.ReactElement, { size: 20 })}
       </div>
       <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
         {trend > 0 ? '+' : ''}{trend}%
       </span>
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
  </div>
);

const FunnelStep = ({ label, count, total, color }: { label: string, count: number, total: number, color: string }) => {
  const percentage = Math.round((count / total) * 100) || 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm font-medium mb-2">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

export default Dashboard;