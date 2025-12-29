import React, { useState } from 'react';
import { Icons } from './Icons';
import { Submission } from '../types';

interface ApplicantsProps {
  submissions: Submission[];
  onViewCandidate: (id: string) => void;
}

type SortKey = 'candidateName' | 'role' | 'submittedAt';

const Applicants: React.FC<ApplicantsProps> = ({ submissions, onViewCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'hired'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'asc' | 'desc' }>({
    key: 'submittedAt',
    direction: 'desc'
  });

  const roles = Array.from(new Set(submissions.map(s => s.role)));

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any = '';
    let bValue: any = '';

    if (sortConfig.key === 'candidateName') {
      aValue = a.candidateName.toLowerCase();
      bValue = b.candidateName.toLowerCase();
    } else if (sortConfig.key === 'role') {
      aValue = a.role.toLowerCase();
      bValue = b.role.toLowerCase();
    } else if (sortConfig.key === 'submittedAt') {
      aValue = new Date(a.submittedAt).getTime();
      bValue = new Date(b.submittedAt).getTime();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-500 mt-1">Manage, review, and track all candidate applications.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Role Filter */}
          <div className="relative w-full md:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-600 cursor-pointer hover:border-primary-200"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Icons.Down className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 w-full md:w-64 transition-all"
            />
          </div>
          
          <button className="hidden md:block p-2.5 bg-white border border-gray-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-colors">
            <Icons.Download size={20} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-semibold text-slate-900">All Applications</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'new', 'reviewed', 'hired', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-500 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <SortableHeader label="Candidate" sortKey="candidateName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Role" sortKey="role" currentSort={sortConfig} onSort={handleSort} />
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Experience</th>
                <SortableHeader label="Submitted" sortKey="submittedAt" currentSort={sortConfig} onSort={handleSort} />
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img className="h-10 w-10 rounded-full object-cover border border-gray-100" src={sub.photoUrl} alt="" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{sub.candidateName}</div>
                        <div className="text-xs text-slate-500">{sub.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="text-sm text-slate-600 font-medium">{sub.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{sub.answers['f_exp']} Years</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onViewCandidate(sub.id)}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      View Profile <Icons.Right size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SortableHeader = ({ label, sortKey, currentSort, onSort }: { 
  label: string, 
  sortKey: SortKey, 
  currentSort: { key: SortKey | null, direction: 'asc' | 'desc' }, 
  onSort: (key: SortKey) => void 
}) => (
  <th 
    className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-slate-600 transition-colors select-none"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center gap-1.5">
      {label}
      {currentSort.key === sortKey ? (
        currentSort.direction === 'asc' ? <Icons.Up size={14} className="text-primary-500" /> : <Icons.Down size={14} className="text-primary-500" />
      ) : (
        <div className="flex flex-col opacity-20">
            <Icons.Up size={8} />
            <Icons.Down size={8} />
        </div>
      )}
    </div>
  </th>
);

const StatusBadge = ({ status }: { status: Submission['status'] }) => {
  const styles = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    reviewed: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    hired: 'bg-green-50 text-green-700 ring-green-600/20',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]} capitalize`}>
      {status}
    </span>
  );
};

export default Applicants;