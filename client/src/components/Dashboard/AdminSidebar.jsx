import React from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from '../../components/Leaderboard';
import Settings from '../../pages/Settings';

const AdminSidebar = () => {
  return (
    <div className="col-span-5">
      <div className="bg-white rounded-lg p-6 shadow mb-4">
        <Settings />
      </div>
    </div>
  );
};

export default AdminSidebar;
