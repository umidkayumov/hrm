import React from 'react';
import { useNavigate } from 'react-router-dom';
import Applicants from '../components/Applicants';
import { MOCK_SUBMISSIONS } from '../constants';

const ApplicantsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleViewCandidate = (id: string) => {
    navigate(`/candidate/${id}`);
  };

  return (
    <Applicants 
      submissions={MOCK_SUBMISSIONS}
      onViewCandidate={handleViewCandidate}
    />
  );
};

export default ApplicantsPage;
