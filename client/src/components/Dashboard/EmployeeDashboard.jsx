import React, { useEffect, useState } from 'react';
import { isWeeklyQuizLive, fetchEmployeeScore } from '../../api';
import { useOrgId, useUserId } from '../../context/auth.context';
import {
  User,
  Share2,
  Image,
  Zap,
  MessageSquare,
  Award,
  Bookmark as BookmarkSimple,
} from 'lucide-react';

import leaderboard from '../../assets/leaderboard.png';
import shield1 from '../../assets/lg50.png';
import shield2 from '../../assets/lg2550.png';

import { createNewQuestion } from '../../api';
import Quiz from '../../pages/Quiz';
import { toast } from 'react-toastify';
import QuestionMaker from '../../pages/QuestionMaker';

const EmployeeDashboard = () => {
  const orgId = useOrgId();
  const employeeId = useUserId();
  const [isQuizLive, setIsQuizLive] = useState(false);
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [score, setScore] = useState({
    currentPoints: 0,
    lastQuizScore: 0,
  });

  function daysUntilNextFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;

    return daysUntilFriday;
  }

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

  const notifyQuestionSubmitted = () => toast('New question submitted!');

  const handleSubmit = () => {
    notifyQuestionSubmitted();
    createNewQuestion(question);
  };

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      {/* Main Content */}
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        {/* Left Sidebar */}
        <div className="col-span-2 col-start-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex flex-col items-center">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-20 h-20 rounded-full mb-4"
              />
              <div className="flex justify-between w-full mb-6">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>0</span>
                  </div>
                  <span className="text-sm text-gray-500">Appreciations</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>0</span>
                  </div>
                  <span className="text-sm text-gray-500">Awards</span>
                </div>
              </div>
              <div className="bg-white">
                <h2 className="text-lg font-semibold mb-2">My Badges</h2>
                <div className="flex space-x-2 mb-6">
                  <span className="text-black px-3 flex flex-col items-center py-1 rounded-lg">
                    <img className="w-8" src={shield1} />
                    Star Performer
                  </span>
                  <span className="text-black px-3 flex flex-col items-center py-1 rounded-lg">
                    <img className="w-8" src={shield2} />
                    Top Scorer
                  </span>
                </div>
              </div>
              <nav className="w-full space-y-4">
                <button className="w-full text-left px-4 rounded hover:bg-gray-100 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  My Activity
                </button>
                <button className="w-full text-left px-4 rounded hover:bg-gray-100 flex items-center gap-2">
                  <BookmarkSimple className="h-4 w-4" />
                  Saved Posts
                </button>
              </nav>
            </div>
          </div>

          {/* Groups Section */}
          <div className="bg-white rounded-lg p-6 mt-4 shadow">
            <div className=" p-3 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Submit Question</h2>
              <ul className="text-slate-400 mb-4">
                <li>Total Submissions: 25</li>
                <li>Submissions Accepted: 10</li>
              </ul>
              {!isQuestionMakerOpen && (
                <button
                  onClick={() => setIsQuestionMakerOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Write Question
                </button>
              )}
            </div>
          </div>
        </div>
        {isQuestionMakerOpen ? (
          <QuestionMaker setIsQuestionMakerOpen={setIsQuestionMakerOpen} />
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
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Colleague"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-sm">
                  Express gratitude and acknowledgment to your colleagues ✨
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow mb-4">
            <div className="flex justify-between items-center ">
              <h3 className="font-semibold">Leaderboard</h3>
            </div>
            <div className="relative pt-8">
              <img src={leaderboard} className="h-ful" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow mb-4">
            {isQuizOpen ? (
              <>
                <div className="p-1">
                  <div className="p-3 rounded-xl">
                    <h2 className="text-lg font-semibold mb-2">
                      Weekly Quiz is active! 🎉
                    </h2>
                    <h6 className="text-slate-400 font-sm">All the best</h6>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-1">
                  {isQuizLive ? (
                    <div className=" rounded-xl">
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
                    <div className="rounded-xl">
                      <h2 className="text-lg mb-2">Quiz has ended</h2>
                      <h6 className="text-slate-400">
                        Score in last quiz: {score.lastQuizScore}
                      </h6>
                      <h6 className="text-slate-400 mb-2 font-sm">
                        Total Score: {score.currentPoints}
                      </h6>
                      <h6 className="text-slate-300 italic font-sm">
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
