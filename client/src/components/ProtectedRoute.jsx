import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context.jsx';

export const ProtectedRoute = ({ children, route }) => {
  const { isAuthenticated, data } = useAuth();

  if (route === 'approve-questions' && data?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};
