import React from 'react';
import {
  ListChecks,
  Calendar,
  Timer,
  Trophy,
  TrendingUp,
  Coins,
} from 'lucide-react';

const PastQuizViewer = ({ pastQuizzes, setIsPastQuizViewerOpen }) => {
  return (
    <div className="col-span-5">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex w-full justify-between">
          <h2 className="text-lg font-semibold mb-4">Past Quizzes</h2>
          <button
            onClick={() => setIsPastQuizViewerOpen(false)}
            className="hover:text-red-900 bg-gray-200 hover:bg-red-300 rounded-full px-2 py-2 w-8 h-8 flex items-center justify-center"
          >
            X
          </button>
        </div>

        {pastQuizzes?.length > 0 ? (
          <div className="space-y-4">
            {pastQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                {/* Left Side: Quiz Details */}
                <div>
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} className="text-blue-500" />
                    {quiz.genre}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {new Date(quiz.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Timer size={16} className="text-gray-400" />
                    {new Date(quiz.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  {/* Right Side: Score */}
                  <div className="flex items-center text-blue-600 font-medium">
                    <Coins size={20} className="text-green-500 mr-2" />
                    {quiz.points} Points
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <TrendingUp size={20} className="text-blue-500 mr-2" />
                    {quiz.multiplier} Multiplier
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <Trophy size={20} className="text-yellow-500 mr-2" />
                    {quiz.score} Score
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No past quizzes available.</p>
        )}
      </div>
    </div>
  );
};

export default PastQuizViewer;
