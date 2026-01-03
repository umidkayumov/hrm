import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TelegramView from '../components/TelegramView';
import { FormTemplate, Submission } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const TelegramPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestForm = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setFormTemplate({
            id: data.id,
            title: data.title,
            description: data.description || '',
            fields: data.fields,
            active: data.active
          });
        }
      } catch (error) {
        console.error('Error fetching form for simulation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestForm();
  }, [user]);

  const handleFormSubmit = async (newSubmission: Submission) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .insert([{
          form_id: newSubmission.formId,
          candidate_name: newSubmission.candidateName,
          email: newSubmission.email,
          role: newSubmission.role,
          answers: newSubmission.answers,
          photo_url: newSubmission.photoUrl.startsWith('blob:') ? null : newSubmission.photoUrl, // Ideally upload to storage, but for now skip blobs
          status: 'new'
        }]);

      if (error) throw error;
      alert("Application submitted successfully!");
    } catch (error) {
      console.error('Error submitting application:', error);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  if (!formTemplate) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">No active form found</h1>
        <p className="text-slate-400 mb-8">Create a form in the Form Builder first to simulate applications.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <TelegramView 
      formTemplate={formTemplate} 
      onSubmit={handleFormSubmit}
      onExit={() => navigate('/')}
    />
  );
};

export default TelegramPage;
