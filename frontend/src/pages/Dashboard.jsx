import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardHome from './DashboardHome';
import DisastersPage from './DisastersPage';
import VolunteersPage from './VolunteersPage';
// We'll create these pages next

const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/disasters" element={<DisastersPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        {/* Add more routes as we build them */}
      </Routes>
    </Layout>
  );
};

export default Dashboard;
