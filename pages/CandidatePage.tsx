import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateProfile from '../components/CandidateProfile';
import { MOCK_SUBMISSIONS } from '../constants';

const CandidatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const candidate = MOCK_SUBMISSIONS.find(s => s.id === id);

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
