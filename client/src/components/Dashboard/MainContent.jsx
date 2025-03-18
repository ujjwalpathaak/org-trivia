import React from 'react';
import QuestionMaker from '../../pages/QuestionMaker';
import Quiz from '../../pages/Quiz';
import BadgeViewer from './BadgeViewer';
import PastQuizViewer from './PastQuizViewer';
import {
  Share2,
  Image,
  Zap,
  MessageSquare,
  Gamepad2,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import SubmittedQuestions from './SubmittedQuestions';

const MainContent = ({
  isBadgeViewerOpen,
  setIsBadgeViewerOpen,
  isQuestionMakerOpen,
  setIsQuestionMakerOpen,
  isQuizOpen,
  setIsQuizOpen,
  isPastQuizViewerOpen,
  setIsPastQuizViewerOpen,
  isSubmittedQuestionOpen,
  details,
  isQuizLive,
  resumeQuiz,
  setIsQuizLive,
  score,
  daysUntilNextFriday,
}) => {
  return (
    <div className="col-span-5">
      {isBadgeViewerOpen ? (
        <BadgeViewer details={details} setIsBadgeViewerOpen={setIsBadgeViewerOpen} />
      ) : isQuestionMakerOpen ? (
        <QuestionMaker setIsQuestionMakerOpen={setIsQuestionMakerOpen} />
      ) : isQuizOpen ? (
        <Quiz setIsQuizLive={setIsQuizLive} setIsQuizOpen={setIsQuizOpen} />
      ) : isSubmittedQuestionOpen ? (
        <SubmittedQuestions />
      ) : isPastQuizViewerOpen ? (
        <PastQuizViewer setIsPastQuizViewerOpen={setIsPastQuizViewerOpen} />
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
                  <p className="text-sm">Express in pictures! From latest reads to travels</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Ignite Learning Sparks! Discuss to expand...</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Share ideas! Get feedback and grow.</p>
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
                4 people in your organization are celebrating their Birthdays today!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
