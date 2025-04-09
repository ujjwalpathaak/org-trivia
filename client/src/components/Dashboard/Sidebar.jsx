import React, { useState } from 'react';
import Leaderboard from '../Leaderboard';
import { Gamepad2, TrendingUp, Coins, Info, CalendarCheck } from 'lucide-react';

const QuizTooltip = () => (
  <div className="relative group">
    <Info className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 border border-gray-300 w-64 bg-white text-gray-800 text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
      <h3 className="font-semibold text-base text-red-500 mb-2">Quiz Rules & Scoring 🏆</h3>
      <p>
        <span className="font-medium text-blue-600">✅ Correct Answer:</span> 10 points
      </p>
      <p>
        <span className="font-medium text-blue-600">💯 Multiplier Applied:</span> Points ×
        Multiplier
      </p>
      <p>
        <span className="font-medium text-blue-600">📆 Leaderboard Resets:</span> Every Month
      </p>
      <p>
        <span className="font-medium text-blue-600">🥇 Top 3 Players:</span> Earn Exclusive Badges
      </p>
    </div>
  </div>
);

const Sidebar = ({
  isQuizOpen,
  setIsQuizOpen,
  quizStatus,
  date,
  setDate,
  resumeQuiz,
  details,
  daysUntilNextFriday,
}) => {
  const handleDateChange = (e) => {
    const selected = new Date(e.target.value);
    selected.setUTCHours(0, 0, 0, 0);
    setDate(selected);
  };

  const renderQuizStatus = () => {
    switch (quizStatus.status) {
      case -1:
        return (
          <div className="rounded-xl">
            <div className="flex flex-col">
              <h2 className="text-sm text-gray-400">{quizStatus.genre}</h2>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-green-600" />
                <h2 className="text-lg text-gray-800">Weekly Quiz Trivia</h2>
                <QuizTooltip />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarCheck className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.streak || 0}</span>
                </div>
                <span className="text-sm text-gray-500">Streak</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.score || 0}</span>
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
        );
      case 0:
        return (
          <div className="rounded-xl">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold mb-2">
                {quizStatus.genre} quiz is cancelled! 😔
              </h2>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-semibold">{details?.multiplier || 0}</span>
                </div>
                <span className="text-sm text-gray-500">Multiplier</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.score || 0}</span>
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
        );
      case 1:
        return resumeQuiz ? (
          <div className="rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Quiz already started</h2>
            <h6 className="text-slate-400 text-sm">Puzzles and Aptitude</h6>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Resume Quiz
            </button>
          </div>
        ) : (
          <div className="rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Weekly Quiz is live! 🎉</h2>
            <h6 className="text-slate-400 text-sm">Puzzles and Aptitude</h6>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Quiz
            </button>
          </div>
        );
      case 2:
        return (
          <div className="rounded-xl">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold mb-2">Weekly Quiz submitted! 🎉</h2>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-semibold">{details?.multiplier || 0}</span>
                </div>
                <span className="text-sm text-gray-500">Multiplier</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.score || 0}</span>
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
        );
      case 3:
        return (
          <div className="rounded-xl">
            <div className="flex flex-col">
              <h2 className="text-sm text-gray-400">{quizStatus.genre} quiz is scheduled</h2>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-green-600" />
                <h2 className="text-lg text-gray-800">Weekly Quiz Trivia</h2>
                <QuizTooltip />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarCheck className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.streak || 0}</span>
                </div>
                <span className="text-sm text-gray-500">Streak</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.score || 0}</span>
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
        );
      case 4:
        return (
          <div className="rounded-xl">
            <div className="flex flex-col">
              <h2 className="text-sm text-gray-400">{quizStatus.genre} quiz has been concluded</h2>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-green-600" />
                <h2 className="text-lg text-gray-800">Weekly Quiz Trivia</h2>
                <QuizTooltip />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarCheck className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.streak || 0}</span>
                </div>
                <span className="text-sm text-gray-500">Streak</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">{details?.employee?.score || 0}</span>
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
        );
      default:
        return null;
    }
  };

  const renderDatePicker = () => {
    return (
      <div className="flex items-center gap-2">
        <h2 className="text-sm text-slate-700">Pick Date: </h2>
        <input
          value={date && date.toISOString().split('T')[0]}
          type="date"
          onChange={handleDateChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
    );
  };

  return (
    <div className="col-span-2">
      <div className="bg-white rounded-lg p-6 shadow mb-4">
        <h3 className="font-semibold mb-4">Appreciate your colleagues!</h3>
        <p className="text-sm">Express gratitude and acknowledgment to your colleagues ✨</p>
      </div>

      <div className="flex justify-between items-center">
        <Leaderboard />
      </div>

      <div className="bg-white rounded-lg p-6 pb-3 shadow mb-4">
        {isQuizOpen ? (
          <div className="p-3 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Attempting Weekly Quiz! 🎉</h2>
            <h6 className="text-slate-400 text-sm">All the best</h6>
          </div>
        ) : (
          <>
            <div className="p-1">{renderDatePicker()}</div>
            <div className="p-1">{renderQuizStatus()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
