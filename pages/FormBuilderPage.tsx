import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import { FormTemplate } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const FormBuilderPage: React.FC = () => {
  const { user } = useAuth();
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchForm = async () => {
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
      } else {
        // Fallback or Initial State if no form exists
        setFormTemplate({
          id: 'initial',
          title: 'Candidate Application Form',
          description: 'Apply for a position at our company',
          fields: [
            { id: 'f_name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
            { id: 'f_email', type: 'text', label: 'Email Address', required: true, placeholder: 'Enter your email' },
            { id: 'f_photo', type: 'photo', label: 'Your Profile Photo', required: true, isSystem: true }
          ],
          active: true
        });
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [user]);

  const handleSaveForm = async (updatedForm: FormTemplate) => {
    if (!user) return;
    try {
      const formData = {
        title: updatedForm.title,
        description: updatedForm.description,
        fields: updatedForm.fields,
        active: updatedForm.active,
        user_id: user.id
      };

      if (updatedForm.id && updatedForm.id !== 'initial') {
        const { error } = await supabase
          .from('forms')
          .update(formData)
          .eq('id', updatedForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forms')
          .insert([formData]);
        if (error) throw error;
      }
      
      fetchForm(); // Refresh for clean state
    } catch (error) {
      console.error('Error saving form:', error);
      alert("Error saving form. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <FormBuilder 
      template={formTemplate!} 
      onSave={handleSaveForm} 
    />
  );
};

export default FormBuilderPage;
