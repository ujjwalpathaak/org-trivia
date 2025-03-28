import React from 'react';
import QuestionMaker from '../../pages/QuestionMaker';
import QuizAnalytics from './QuizAnalytics';

const AdminMainContent = ({ analytics }) => {
  return (
    <div className="col-span-4">
      <QuizAnalytics analytics={analytics} />
    </div>
  );
};

export default AdminMainContent;
