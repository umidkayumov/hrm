import React from 'react';
import Dashboard from '../components/Dashboard';
import { MOCK_SUBMISSIONS } from '../constants';

const DashboardPage: React.FC = () => {
  return <Dashboard submissions={MOCK_SUBMISSIONS} />;
};

export default DashboardPage;
