import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardHome from './DashboardHome';
import DisastersPage from './DisastersPage';
import AffectedAreasPage from './AffectedAreasPage'; // Add this import
import VolunteersPage from './VolunteersPage';
import ReliefCampsPage from './ReliefCampsPage';

const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/disasters" element={<DisastersPage />} />
        <Route path="/areas" element={<AffectedAreasPage />} /> {/* Add this route */}
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/camps" element={<ReliefCampsPage />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
