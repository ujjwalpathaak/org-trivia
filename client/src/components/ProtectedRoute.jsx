import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useOrgId, useUserId } from '../context/auth.context.jsx';
import { isWeeklyQuizLive } from '../api.js';
import { toast } from 'react-toastify';

export const ProtectedRoute = ({ children, route }) => {
  const { isAuthenticated, data, loading } = useAuth();
  const orgId = useOrgId();
  const employeeId = useUserId();
  const [isQuizLive, setIsQuizLive] = useState(false); // Default to false

  useEffect(() => {
    if (route === 'quiz' && orgId && employeeId) {
      (async () => {
        try {
          const live = await isWeeklyQuizLive(orgId, employeeId);
          console.log('Quiz Live Status:', live);
          setIsQuizLive(live);
        } catch (error) {
          console.error('Error checking quiz status:', error);
          setIsQuizLive(false);
        }
      })();
    }
  }, [route, orgId, employeeId]);

  if (loading) return <p>Loading...</p>;

  if (route === 'quiz' && !isQuizLive) {
    return <Navigate to="/dashboard" replace />;
  }

  if (route === 'approve-questions' && data?.user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};
