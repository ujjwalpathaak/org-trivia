import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context.jsx';
import { getWeeklyQuizStatusAPI } from '../api.js';

export const ProtectedRoute = ({ children, route }) => {
  const { isAuthenticated, data, loading } = useAuth();
  const [isQuizLive, setIsQuizLive] = useState(false);

  useEffect(() => {
    if (route === 'quiz') {
      const fetchWeeklyQuizStatus = async () => {
        try {
          const state = await getWeeklyQuizStatusAPI();
          if (state === 1) setIsQuizLive(state);
        } catch (error) {
          console.error('Error checking quiz status:', error);
          setIsQuizLive(false);
        }
      };

      fetchWeeklyQuizStatus();
    }
  }, [route]);

  if (loading) return <p>Loading...</p>;

  if (route === 'quiz' && !isQuizLive) {
    return <Navigate to="/dashboard" replace />;
  }

  if (route === 'approve-questions' && data?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};
