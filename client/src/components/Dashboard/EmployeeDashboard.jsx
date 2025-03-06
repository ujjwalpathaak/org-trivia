import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isWeeklyQuizLive } from '../../api';
import { useOrgId, useUserId } from '../../context/auth.context';

import leaderboard from '../../assets/leaderboard.png';
import shield1 from '../../assets/lg50.png';
import shield2 from '../../assets/lg2550.png';

import { createNewQuestion } from '../../api';
import Quiz from '../../pages/Quiz';
import { toast } from 'react-toastify';
import QuestionMaker from '../../pages/QuestionMaker';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const orgId = useOrgId();
  const employeeId = useUserId();
  const [isQuizLive, setIsQuizLive] = useState(false);
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

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

  const notifyQuestionSubmitted = () => toast('New question submitted!');

  const handleSubmit = () => {
    notifyQuestionSubmitted();
    createNewQuestion(question);
  };

  return (
    <>
      <div className="w-full bg-[#f2f9ff] h-[93vh] justify-center px-[100px] flex py-16 px-auto">
        <div className="w-1/5 bg-white floating-div rounded-2xl">
          <div
            role="status"
            className="p-4 rounded-sm shadow-sm animate-pulse md:p-6 "
          >
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="flex items-center mt-4">
              <svg
                className="w-10 h-10 me-3 text-gray-200 dark:text-gray-700"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
              </svg>
              <div>
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              </div>
            </div>
            <span className="sr-only">Loading...</span>
          </div>
          <div className="bg-white h-1/4 p-4 pb-0">
            <h2 className="text-lg font-semibold mb-2">My Badges</h2>
            <div className="flex space-x-2">
              <span className="border-2 text-black px-3 flex flex-col items-center py-1 rounded-lg">
                <img className="w-16" src={shield1} />
                Star Performer
              </span>
              <span className="border-2 text-black px-3 flex flex-col items-center py-1 rounded-lg">
                <img className="w-16" src={shield2} />
                Top Scorer
              </span>
            </div>
          </div>
          <div className="bg-white p-4 pb-0 rounded-2xl">
            <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
            <img src={leaderboard} className="h-ful" />
          </div>
        </div>
        {isQuestionMakerOpen ? (
          <QuestionMaker />
        ) : isQuizOpen ? (
          <Quiz setIsQuizLive={setIsQuizLive} setIsQuizOpen={setIsQuizOpen} />
        ) : (
          <div className="w-1/3 bg-white shine mx-12 floating-div rounded-2xl">
            <div
              role="status"
              className="p-4 border h-full rounded-sm shadow-sm animate-pulse md:p-6 "
            >
              <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-sm dark:bg-gray-700">
                <svg
                  className="w-10 h-10 text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 20"
                >
                  <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                </svg>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              <div className="flex items-center mt-4">
                <svg
                  className="w-10 h-10 me-3 text-gray-200 dark:text-gray-700"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
              </div>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        <div className="w-1/5 bg-white rounded-2xl floating-div">
          <div
            role="status"
            className="p-4 rounded-sm shadow-sm animate-pulse md:p-6 "
          >
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <span className="sr-only">Loading...</span>
          </div>
          {isQuizOpen ? (
            <>
              <div className="p-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <h2 className="text-lg font-semibold mb-2">
                    Weekly Quiz is active! 🎉
                  </h2>
                  <h6 className="text-slate-400 font-sm">All the best</h6>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4">
                {isQuizLive ? (
                  <div className="bg-green-100 p-3 rounded-xl">
                    <h2 className="text-lg font-semibold mb-2">
                      Weekly Quiz is live! 🎉
                    </h2>
                    <h6 className="text-slate-400 font-sm">
                      Puzzles and Aptitude
                    </h6>
                    <button
                      onClick={() => setIsQuizOpen(true)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Quiz
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-100 p-3 rounded-xl">
                    <h2 className="text-lg font-semibold mb-2">
                      Quiz has ended
                    </h2>
                    <h6 className="text-slate-400 font-sm">Next in 3days</h6>
                  </div>
                )}
              </div>
              <div className="p-4 ">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <h2 className="text-lg font-semibold mb-2">
                    Submit Question
                  </h2>
                  <ul className="text-slate-400 mb-4">
                    <li>Total Submissions: 25</li>
                    <li>Submissions Accepted: 10</li>
                  </ul>
                  {isQuestionMakerOpen ? (
                    <div className="flex justify-between items-center">
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Submit Question
                      </button>
                      <button
                        onClick={() => setIsQuestionMakerOpen(false)}
                        className="text-gray-600 hover:text-red-900 bg-gray-200 hover:bg-red-300 bg-red-200 rounded w-fit px-2 py-1 h-8 flex items-center justify-center"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsQuestionMakerOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Write Question
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
