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
import DonationsPage from './DonationsPage';
import RequestsPage from './RequestsPage';
import DistributionsPage from './DistributionsPage';
import MyAssignmentsPage from './MyAssignmentsPage';

// Add to routes
import MyDonationsPage from './MyDonationsPage';

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
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/distributions" element={<DistributionsPage />} />
        <Route path="/my-assignments" element={<MyAssignmentsPage />} />
        <Route path="/my-donations" element={<MyDonationsPage />} />
        

      </Routes>
    </Layout>
  );
};

export default Dashboard;
