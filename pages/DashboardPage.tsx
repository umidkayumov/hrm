import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Submission } from '../types';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
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
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .in('form_id', formIds);

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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return <Dashboard submissions={submissions} />;
};

export default DashboardPage;
