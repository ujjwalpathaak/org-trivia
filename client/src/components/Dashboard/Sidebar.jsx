import React from 'react';
import Leaderboard from '../Leaderboard';
import { Gamepad2, TrendingUp, CalendarDays, ListChecks, Calendar, Timer, Trophy } from 'lucide-react';

const Sidebar = ({ isQuizOpen, setIsQuizOpen, isQuizLive, resumeQuiz, score, details, daysUntilNextFriday }) => {
  return (
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
                    <Gamepad2 className="w-6 h-6 text-green-500" />
                    Weekly Quiz Trivia
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
  );
};

export default Sidebar;
