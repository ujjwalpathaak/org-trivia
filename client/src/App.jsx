import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/auth.context.jsx';
import { DataProvider } from './context/data.context.jsx';

import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar.jsx';
import NotFound from './pages/NotFound.jsx';
import Quiz from './pages/Quiz.jsx';
import ApproveQuestions from './pages/ApproveQuestions.jsx';
import Settings from './pages/Settings.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="approve-questions/:quizId"
                element={
                  <ProtectedRoute route="approve-questions">
                    <ApproveQuestions />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
