import React from 'react';
import Leaderboard from '../Leaderboard';
import {
  Gamepad2,
  TrendingUp,
  CalendarDays,
  ListChecks,
  Calendar,
  Timer,
  Trophy,
  ClockAlert,
  Coins,
} from 'lucide-react';

const Sidebar = ({
  isQuizOpen,
  setIsQuizOpen,
  isQuizLive,
  resumeQuiz,
  details,
  daysUntilNextFriday,
}) => {
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
      <div className="bg-white rounded-lg p-6 pb-3 shadow mb-4">
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
                  <div>
                    <h2 className="text-lg mb-2 flex items-center gap-2">
                      <Gamepad2 className="w-6 h-6 text-green-500" />
                      Weekly Quiz Trivia
                    </h2>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="flex flex-col items-center  w-1/2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span className="text-lg font-semibold">
                          {details?.multiplier}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">Multiplier</span>
                    </div>
                    <div className="flex flex-col items-center  w-1/2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Coins className="h-5 w-5 text-green-500" />
                        <span className="text-lg font-semibold">
                          {details?.employee?.score}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">Score</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full justify-end mt-8">
                    <span className="text-sm italic text-gray-500">
                      Next Quiz in {daysUntilNextFriday()} Days
                    </span>
                  </div>
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
