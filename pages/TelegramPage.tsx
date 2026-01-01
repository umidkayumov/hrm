import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TelegramView from '../components/TelegramView';
import { MOCK_FORM, MOCK_SUBMISSIONS } from '../constants';
import { Submission } from '../types';

const TelegramPage: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);

  const handleFormSubmit = (newSubmission: Submission) => {
    setSubmissions([newSubmission, ...submissions]);
    alert("Application submitted successfully!");
  };

  return (
    <TelegramView 
      formTemplate={MOCK_FORM} 
      onSubmit={handleFormSubmit}
      onExit={() => navigate('/')}
    />
  );
};

export default TelegramPage;
