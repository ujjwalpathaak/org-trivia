import React, { useEffect, useState } from 'react';
import {
  isWeeklyQuizLive,
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

  const [isQuizLive, setIsQuizLive] = useState(false);
  const [resumeQuiz, setResumeQuiz] = useState(false);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);
  const [isPastQuizViewerOpen, setIsPastQuizViewerOpen] = useState(false);
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
    const fetchIsWeeklyQuizLive = async () => {
      try {
        const live = await isWeeklyQuizLive(orgId, employeeId);
        setIsQuizLive(live);
      } catch (error) {
        console.error('Error checking quiz status:', error);
        setIsQuizLive(false);
      }
    };

    fetchIsWeeklyQuizLive();
  }, [orgId, employeeId]);

  const fetchPastQuizzes = async () => {
    try {
      const pastQuizzes = await getPastQuizResults(employeeId);
      setPastQuizzes(pastQuizzes);
    } catch (error) {
      console.error('Error fetching past quizzes:', error);
    }
  };

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        <ProfileSection
          data={data}
          details={details}
          setIsQuestionMakerOpen={setIsQuestionMakerOpen}
          setIsBadgeViewerOpen={setIsBadgeViewerOpen}
          setIsPastQuizViewerOpen={setIsPastQuizViewerOpen}
          fetchPastQuizzes={fetchPastQuizzes}
        />
        <MainContent
          isBadgeViewerOpen={isBadgeViewerOpen}
          setIsBadgeViewerOpen={setIsBadgeViewerOpen}
          isQuestionMakerOpen={isQuestionMakerOpen}
          setIsQuestionMakerOpen={setIsQuestionMakerOpen}
          isQuizOpen={isQuizOpen}
          setIsQuizLive={setIsQuizLive}
          setIsQuizOpen={setIsQuizOpen}
          isPastQuizViewerOpen={isPastQuizViewerOpen}
          setIsPastQuizViewerOpen={setIsPastQuizViewerOpen}
          details={details}
          pastQuizzes={pastQuizzes}
          fetchPastQuizzes={fetchPastQuizzes}
          isQuizLive={isQuizLive}
          resumeQuiz={resumeQuiz}
          daysUntilNextFriday={daysUntilNextFriday}
        />
        <Sidebar
          isQuizOpen={isQuizOpen}
          setIsQuizOpen={setIsQuizOpen}
          isQuizLive={isQuizLive}
          resumeQuiz={resumeQuiz}
          details={details}
          daysUntilNextFriday={daysUntilNextFriday}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
