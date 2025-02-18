import React from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
          <h2 className="text-lg font-semibold mb-2">Upcoming Quiz</h2>
          <p className="text-gray-600">
            Next Quiz: <strong>March 15, 2025</strong>
          </p>
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Details
          </button>
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
            onClick={() => navigate("/dashboard/question-maker")}
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
