import React, { useEffect, useState } from 'react';
import {
  getWeeklyQuizStatus,
  fetchEmployeeScore,
  getEmployeeDetails,
  getPastQuizResults,
} from '../../api';
import { useAuth, useOrgId, useUserId } from '../../context/auth.context';
import ProfileSection from './ProfileSection';
import MainContent from './MainContent';
import Sidebar from './Sidebar';
import { daysUntilNextFriday } from '../../utils';

const EmployeeDashboard = () => {
  const orgId = useOrgId();
  const employeeId = useUserId();
  const { data } = useAuth();

  const [quizStatus, setQuizStatus] = useState({});
  const [resumeQuiz, setResumeQuiz] = useState(false);
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);
  const [isPastQuizViewerOpen, setIsPastQuizViewerOpen] = useState(false);
  const [isSubmittedQuestionOpen, setIsSubmittedQuestionOpen] = useState(false);
  const [isBadgeViewerOpen, setIsBadgeViewerOpen] = useState(false);
  const [details, setDetails] = useState({});
  const [isQuizOpen, setIsQuizOpen] = useState(false);

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
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

  useEffect(() => {
    const fetchWeeklyQuizStatus = async () => {
      try {
        const status = await getWeeklyQuizStatus(orgId, employeeId);
        console.log(status);
        setQuizStatus(status);
      } catch (error) {
        console.error('Error checking quiz status:', error);
        setQuizStatus(false);
      }
    };

    fetchWeeklyQuizStatus();
  }, [orgId, employeeId]);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        <ProfileSection
          data={data}
          details={details}
          setIsQuestionMakerOpen={setIsQuestionMakerOpen}
          setIsBadgeViewerOpen={setIsBadgeViewerOpen}
          setIsPastQuizViewerOpen={setIsPastQuizViewerOpen}
          setIsSubmittedQuestionOpen={setIsSubmittedQuestionOpen}
        />
        <MainContent
          isBadgeViewerOpen={isBadgeViewerOpen}
          setIsBadgeViewerOpen={setIsBadgeViewerOpen}
          isQuestionMakerOpen={isQuestionMakerOpen}
          setIsQuestionMakerOpen={setIsQuestionMakerOpen}
          isQuizOpen={isQuizOpen}
          setQuizStatus={setQuizStatus}
          setIsSubmittedQuestionOpen={setIsSubmittedQuestionOpen}
          setIsQuizOpen={setIsQuizOpen}
          isSubmittedQuestionOpen={isSubmittedQuestionOpen}
          isPastQuizViewerOpen={isPastQuizViewerOpen}
          setIsPastQuizViewerOpen={setIsPastQuizViewerOpen}
          details={details}
          quizStatus={quizStatus}
          resumeQuiz={resumeQuiz}
          daysUntilNextFriday={daysUntilNextFriday}
        />
        <Sidebar
          isQuizOpen={isQuizOpen}
          setIsQuizOpen={setIsQuizOpen}
          quizStatus={quizStatus}
          resumeQuiz={resumeQuiz}
          details={details}
          daysUntilNextFriday={daysUntilNextFriday}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
