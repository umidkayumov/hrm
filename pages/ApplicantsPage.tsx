import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Applicants from '../components/Applicants';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Submission } from '../types';

const ApplicantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchSubmissions = useCallback(async () => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    
    try {
      const { data: forms } = await supabase
        .from('forms')
        .select('id')
        .eq('user_id', user.id);

      if (!forms || forms.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      const formIds = forms.map(f => f.id);
      // Select only needed columns instead of *
      const { data, error } = await supabase
        .from('submissions')
        .select('id, form_id, candidate_name, photo_url, role, email, answers, created_at, status, ai_summary')
        .in('form_id', formIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed: Submission[] = data.map(item => ({
        id: item.id,
        formId: item.form_id,
        candidateName: item.candidate_name,
        photoUrl: item.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.email}`,
        role: item.role,
        email: item.email,
        answers: item.answers || {},
        submittedAt: item.created_at,
        status: item.status as any,
        aiSummary: item.ai_summary
      }));

      setSubmissions(transformed);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleViewCandidate = (id: string) => {
    navigate(`/candidate/${id}`);
  };

  // Show header immediately for better LCP
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header - renders immediately for good LCP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-500 mt-1">Manage, review, and track all candidate applications.</p>
        </div>
      </div>

      {loading ? (
        // Skeleton loading state
        <div className="space-y-8 animate-pulse">
          <div className="bg-white rounded-2xl shadow-sm border border-metal-50 overflow-hidden">
            <div className="p-6 border-b border-metal-50">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Applicants 
          submissions={submissions}
          onViewCandidate={handleViewCandidate}
        />
      )}
    </div>
  );
};

export default ApplicantsPage;
