import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Applicants from '../components/Applicants';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Submission } from '../types';
import { Loader2 } from 'lucide-react';

const ApplicantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      // In this SaaS, submissions are linked to forms which are linked to users.
      // We'll fetch all submissions for forms belonging to this user.
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
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
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
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const handleViewCandidate = (id: string) => {
    navigate(`/candidate/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <Applicants 
      submissions={submissions}
      onViewCandidate={handleViewCandidate}
    />
  );
};

export default ApplicantsPage;
