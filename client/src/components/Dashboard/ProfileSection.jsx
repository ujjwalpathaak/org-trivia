import React from 'react';
import {
  Award,
  CalendarCheck,
  Book,
  CirclePlus,
  Bookmark,
  AwardIcon,
  BookText,
} from 'lucide-react';

const ProfileSection = ({
  data,
  details,
  setIsQuestionMakerOpen,
  setIsBadgeViewerOpen,
  setIsPastQuizViewerOpen,
  setIsSubmittedQuestionOpen,
}) => {
  return (
    <div className="col-span-2 col-start-2">
      <div className="bg-white rounded-2xl p-6 floating-div">
        <div className="flex flex-col items-center">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
          />
          {data?.name && `${data.name}`}
          <div className="flex justify-between w-full mt-2 px-8 mb-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">{details?.badges?.length || 0}</span>
              </div>
              <span className="text-sm text-gray-500">Badges</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarCheck className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">{details?.employee?.streak || 0}</span>
              </div>
              <span className="text-sm text-gray-500">Streak</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Book className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold">
                  {details?.employee?.submittedQuestions?.length || 0}
                </span>
              </div>
              <span className="text-sm text-gray-500">Questions</span>
            </div>
          </div>
          <div className="w-full text-center">
            <h2 className="text-lg font-semibold mb-3">My Badges</h2>
            <div className="flex flex-col gap-2">
              {details?.badges?.length === 0 && (
                <span className="text-slate-400 font-semibold">No badges. Participate More!</span>
              )}
              {details?.badges?.slice(0, 3).map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-100 py-2 px-3 rounded-lg shadow-sm"
                >
                  <img
                    className="w-8 h-8 object-cover rounded-full"
                    src={badge.badgeDetails?.url || '/fallback-badge.png'}
                    alt="Badge"
                  />
                  <span className="font-medium text-gray-700">
                    {badge.description || 'No description'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <hr></hr>
          <nav className="w-full mt-6 space-y-3">
            <button
              onClick={() => {
                setIsQuestionMakerOpen(true);
                setIsBadgeViewerOpen(false);
                setIsPastQuizViewerOpen(false);
                setIsSubmittedQuestionOpen(false);
              }}
              className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition"
            >
              <CirclePlus className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Submit new question</span>
            </button>

            <button
              onClick={async () => {
                setIsBadgeViewerOpen(false);
                setIsQuestionMakerOpen(false);
                setIsPastQuizViewerOpen(true);
                setIsSubmittedQuestionOpen(false);
              }}
              className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition"
            >
              <Bookmark className="h-5 w-5 text-green-500" />
              <span className="font-medium">Past quizzes</span>
            </button>

            <button
              onClick={async () => {
                setIsQuestionMakerOpen(false);
                setIsPastQuizViewerOpen(false);
                setIsBadgeViewerOpen(true);
                setIsSubmittedQuestionOpen(false);
              }}
              className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition"
            >
              <AwardIcon className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">See all badges</span>
            </button>

            <button
              onClick={async () => {
                setIsQuestionMakerOpen(false);
                setIsPastQuizViewerOpen(false);
                setIsBadgeViewerOpen(false);
                setIsSubmittedQuestionOpen(true);
              }}
              className="w-full text-left px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition"
            >
              <BookText className="h-5 w-5 text-blue-500" />
              <span className="font-medium">See all submitted questions</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
