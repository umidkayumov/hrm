import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateProfile from '../components/CandidateProfile';
import { supabase } from '../services/supabase';
import { Submission } from '../types';
import { Loader2 } from 'lucide-react';

const CandidatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setCandidate({
            id: data.id,
            formId: data.form_id,
            candidateName: data.candidate_name,
            photoUrl: data.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
            role: data.role,
            email: data.email,
            answers: data.answers || {},
            submittedAt: data.created_at,
            status: data.status as any,
            aiSummary: data.ai_summary
          });
        }
      } catch (error) {
        console.error('Error fetching candidate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Candidate not found</h1>
          <button 
            onClick={() => navigate('/applicants')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  return (
    <CandidateProfile 
      candidate={candidate} 
      onBack={() => navigate('/applicants')} 
    />
  );
};

export default CandidatePage;
