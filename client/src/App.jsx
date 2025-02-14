import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useState, createContext, useContext } from "react";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";

// const AuthContext = createContext(null);

// const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with JWT logic

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => useContext(AuthContext);

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/signup" element={<Signup />} /> */}

          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
                <Dashboard />
              // </ProtectedRoute>
            }
          />
          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Router>
  );
}

export default App;
