import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import { MOCK_FORM } from '../constants';
import { FormTemplate } from '../types';

const FormBuilderPage: React.FC = () => {
  const [formTemplate, setFormTemplate] = useState<FormTemplate>(MOCK_FORM);

  const handleSaveForm = (updatedForm: FormTemplate) => {
    setFormTemplate(updatedForm);
    // In a real app, save to DB
  };

  return (
    <FormBuilder 
      template={formTemplate} 
      onSave={handleSaveForm} 
    />
  );
};

export default FormBuilderPage;
