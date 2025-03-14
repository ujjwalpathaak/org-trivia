import React from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from '../../components/Leaderboard';
import Settings from '../../pages/Settings';

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="col-span-2">
      <div className="bg-white w-fit h-fit p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Approve Questions</h2>
        <p className="text-gray-600">
          Review and approve pending questions.
        </p>
        <button
          onClick={() => navigate('approve-questions')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Pending Questions
        </button>
      </div>
      <div className="bg-white rounded-lg p-6 mt-4 shadow mb-4">
        <Settings />
      </div>
    </div>
  );
};

export default AdminSidebar;
