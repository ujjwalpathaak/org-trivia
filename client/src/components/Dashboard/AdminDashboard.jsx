import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Leaderboard from '../../components/Leaderboard';
import Settings from '../../pages/Settings';
import QuestionMaker from '../../pages/QuestionMaker';
import QuizAnalytics from './QuizAnalytics';
import { getAnalytics } from '../../api';
import { useAuth, useOrgId } from '../../context/auth.context';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const orgId = useOrgId();
  const { data } = useAuth();

  const [analytics, setAnalytics] = useState({});
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);

  useEffect(() => {
    const getOrgAnalytics = async () => {
      if (!orgId) return;
      const data = await getAnalytics(orgId);
      setAnalytics(data);
    };
    getOrgAnalytics();
  }, [orgId]);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        <div className="col-span-2 col-start-2">
          {/* <div className="bg-white mb-4 rounded-lg p-4 mt-4 shadow">
            <div className="rounded-xl">
              <h2 className="text-lg font-semibold mb-2">
                Submit New Question
              </h2>
              {!isQuestionMakerOpen && (
                <button
                  onClick={() => setIsQuestionMakerOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Write Question
                </button>
              )}
            </div>
          </div> */}
          <div className="col-span-2 col-start-2 mb-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
                />
                {data?.user?.name && `${data.user.name}`}
              </div>
            </div>
          </div>
          <Leaderboard last3Leaderboards={analytics.last3Leaderboards} />
        </div>

        {isQuestionMakerOpen ? (
          <QuestionMaker setIsQuestionMakerOpen={setIsQuestionMakerOpen} />
        ) : (
          <QuizAnalytics analytics={analytics} />
        )}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
