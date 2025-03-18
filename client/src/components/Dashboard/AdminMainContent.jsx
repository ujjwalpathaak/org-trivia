import React from 'react';
import QuestionMaker from '../../pages/QuestionMaker';
import QuizAnalytics from './QuizAnalytics';

const AdminMainContent = ({ isQuestionMakerOpen, setIsQuestionMakerOpen, analytics }) => {
  return (
    <div className="col-span-5">
      {isQuestionMakerOpen ? (
        <QuestionMaker setIsQuestionMakerOpen={setIsQuestionMakerOpen} />
      ) : (
        <QuizAnalytics analytics={analytics} />
      )}
    </div>
  );
};

export default AdminMainContent;
