import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isWeeklyQuizLive } from '../../api';
import { useOrgId, useUserId } from '../../context/auth.context';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const orgId = useOrgId();
  const employeeId = useUserId();
  const [isQuizLive, setIsQuizLive] = useState(false);

  useEffect(() => {
    const fetchIsWeeklyQuizLive = async () => {
      try {
        const live = await isWeeklyQuizLive(orgId, employeeId);
        setIsQuizLive(live);
      } catch (error) {
        console.error('Error checking quiz status:', error);
        setIsQuizLive(false);
      }
    };
    fetchIsWeeklyQuizLive();
  }, [orgId, employeeId]);

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl floating-div">
          <h2 className="text-lg font-semibold mb-2">My Badges</h2>
          <div className="flex space-x-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-lg">
              ⭐ Star Performer
            </span>
            <span className="bg-green-500 text-white px-3 py-1 rounded-lg">
              🏆 Top Scorer
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl floating-div">
          {isQuizLive ? (
            <>
              <h2 className="text-lg font-semibold mb-2">
                Weekly Quiz is live!
              </h2>
              <button
                onClick={() => navigate('/dashboard/quiz')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to quiz
              </button>
            </>
          ) : (
            <span className="">Quiz has Ended</span>
          )}
        </div>
        <div className="bg-white p-4 rounded-2xl floating-div">
          <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
          <ul className="text-gray-700">
            <li>🥇 Alice - 980 pts</li>
            <li>🥈 Bob - 920 pts</li>
            <li>🥉 Charlie - 860 pts</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl floating-div">
          <h2 className="text-lg font-semibold mb-2">Submit Question</h2>
          <ul className="text-gray-700">
            <li>Total Submissions: 25</li>
            <li>Submissions Accepted: 10</li>
          </ul>
          <button
            onClick={() => navigate('/dashboard/question-maker')}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Write Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
