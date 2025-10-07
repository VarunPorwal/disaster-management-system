import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardHome from './DashboardHome';
import DisastersPage from './DisastersPage';
import AffectedAreasPage from './AffectedAreasPage'; // Add this import
import VolunteersPage from './VolunteersPage';
import ReliefCampsPage from './ReliefCampsPage';
import VictimsPage from './VictimsPage'; // Add import
import SuppliesPage from './SuppliesPage';
import DonationsPage from './DonationsPage';  // Add import

// Add route


// Add route







const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/disasters" element={<DisastersPage />} />
        <Route path="/areas" element={<AffectedAreasPage />} /> {/* Add this route */}
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/camps" element={<ReliefCampsPage />} />
        <Route path="/victims" element={<VictimsPage />} />
        <Route path="/supplies" element={<SuppliesPage />} />
        <Route path="/donations" element={<DonationsPage />} />

      </Routes>
    </Layout>
  );
};

export default Dashboard;
