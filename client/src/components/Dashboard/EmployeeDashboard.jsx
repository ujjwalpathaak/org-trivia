import React, { useEffect, useState } from 'react';
import {
  isWeeklyQuizLive,
  fetchEmployeeScore,
  getEmployeeDetails,
} from '../../api';
import { useOrgId, useUserId } from '../../context/auth.context';
import {
  Share2,
  Image,
  Zap,
  MessageSquare,
  Award,
  Bookmark as BookmarkSimple,
  CalendarCheck,
  Book,
  CirclePlus,
  TrendingUp,
  CalendarDays,
  CircleCheck,
} from 'lucide-react';

import Quiz from '../../pages/Quiz';
import QuestionMaker from '../../pages/QuestionMaker';
import Leaderboard from '../Leaderboard';
import { daysUntilNextFriday } from '../../utils';

const EmployeeDashboard = () => {
  const orgId = useOrgId();
  const employeeId = useUserId();

  const [isQuizLive, setIsQuizLive] = useState(false);
  const [resumeQuiz, setResumeQuiz] = useState(false);
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);
  const [details, setDetails] = useState({});
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [score, setScore] = useState({
    currentPoints: 0,
    lastQuizScore: 0,
  });

  useEffect(() => {
    const getIsQuizAttempting = async () => {
      try {
        const quizState = localStorage.getItem('state');
        if (quizState) {
          setResumeQuiz(true);
        }
      } catch (error) {
        console.error('Error checking quiz status:', error);
      }
    };

    getIsQuizAttempting();
  }, []);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employeeId) return;
      try {
        const data = await getEmployeeDetails(employeeId);
        setDetails(data);
      } catch (error) {
        console.error('Error checking quiz status:', error);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

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
    const getEmployeeScore = async () => {
      try {
        const score = await fetchEmployeeScore(employeeId);
        setScore({
          currentPoints: score.currentPoints,
          lastQuizScore: score.lastQuizScore,
        });
      } catch (error) {
        console.error('Error checking score status:', error);
        setIsQuizLive(false);
      }
    };
    fetchIsWeeklyQuizLive();
    getEmployeeScore();
  }, [orgId, employeeId]);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        <div className="col-span-2 col-start-2">
          <div className="bg-white rounded-2xl p-6 floating-div">
            <div className="flex flex-col items-center">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
              />
              <div className="flex justify-between w-full px-8 mb-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-semibold">
                      {details?.badges?.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">Badges</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarCheck className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-semibold">
                      {details?.employee?.currentStreak}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">Streak</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Book className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold">
                      {details?.employee?.submittedQuestions.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">Submissions</span>
                </div>
              </div>
              <div className="w-full text-center">
                <h2 className="text-lg font-semibold mb-3">My Badges</h2>
                <div className="flex flex-col gap-2">
                  {details?.badges?.length === 0 && (
                    <span className="text-slate-400 font-semibold">
                      No badges. Participate More!
                    </span>
                  )}
                  {details?.badges?.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 py-2 px-3 rounded-lg shadow-sm"
                    >
                      <img className="w-8" src={badge.badgeDetails.url} />
                      <span className="font-medium">{badge.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <nav className="w-full mt-6 space-y-3">
                {!isQuestionMakerOpen && (
                  <button
                    onClick={() => setIsQuestionMakerOpen(true)}
                    className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition"
                  >
                    <CirclePlus className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Submit new question</span>
                  </button>
                )}
                <button className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition">
                  <BookmarkSimple className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Past quizzes</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
        {isQuestionMakerOpen ? (
          <QuestionMaker
            setIsQuestionMakerOpen={setIsQuestionMakerOpen}
            employeeId={employeeId}
          />
        ) : isQuizOpen ? (
          <Quiz setIsQuizLive={setIsQuizLive} setIsQuizOpen={setIsQuizOpen} />
        ) : (
          <div className="col-span-5">
            <div className="bg-white rounded-lg p-6 shadow mb-4">
              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <input
                  type="text"
                  placeholder="Share new learnings!"
                  className="w-full bg-gray-100 rounded-lg px-4"
                />
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  Share-worthy Vibes
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Express in pictures! From latest reads to travels
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Ignite Learning Sparks! Discuss to expand...
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Share ideas! Get feedback and grow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 text-white rounded-lg p-6 shadow mb-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    AI
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    RA
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    +1
                  </div>
                </div>
                <p className="flex-1">
                  4 people in your organization are celebrating their Birthdays
                  today!
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="col-span-2">
          <div className="bg-white rounded-lg p-6 shadow mb-4">
            <h3 className="font-semibold mb-4">Appreciate your colleagues!</h3>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm">
                  Express gratitude and acknowledgment to your colleagues ✨
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center ">
            <Leaderboard />
          </div>
          <div className="bg-white rounded-lg p-6 shadow mb-4">
            {isQuizOpen ? (
              <>
                <div className="p-1">
                  <div className="p-3 rounded-xl">
                    <h2 className="text-lg font-semibold mb-2">
                      Attempting Weekly Quiz! 🎉
                    </h2>
                    <h6 className="text-slate-400 font-sm">All the best</h6>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-1">
                  {isQuizLive ? (
                    resumeQuiz ? (
                      <>
                        <div className="rounded-xl">
                          <h2 className="text-lg font-semibold mb-2">
                            Quiz already started
                          </h2>
                          <h6 className="text-slate-400 font-sm">
                            Puzzles and Aptitude
                          </h6>
                          <button
                            onClick={() => setIsQuizOpen(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Resume Quiz
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl">
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
                      </>
                    )
                  ) : (
                    <div className="rounded-xl">
                      <h2 className="text-lg mb-2 flex items-center gap-2">
                        <CircleCheck className="w-5 h-5 text-yellow-500" />
                        Quiz has ended
                      </h2>
                      <h6 className="text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Score in last quiz: {score.lastQuizScore}
                      </h6>
                      <h6 className="text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        {`Multiplier: x${details?.multiplier}`}
                      </h6>
                      <h6 className="text-slate-300 italic font-sm flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-purple-500" />
                        Next in {daysUntilNextFriday()} days
                      </h6>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
