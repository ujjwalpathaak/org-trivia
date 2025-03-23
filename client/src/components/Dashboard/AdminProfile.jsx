import React from 'react';
import Leaderboard from '../Leaderboard';

const AdminProfile = ({ data, last3Leaderboards }) => {
  return (
    <div className="col-span-2 col-start-2 mb-4">
      <div className="bg-white rounded-lg p-6 shadow mb-4">
        <div className="flex flex-col items-center">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
          />
          {data?.name && `${data.name}`}
        </div>
      </div>
      <Leaderboard last3Leaderboards={last3Leaderboards} />
    </div>
  );
};

export default AdminProfile;
