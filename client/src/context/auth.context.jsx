import { useState, createContext, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const AuthContext = createContext({
  isAuthenticated: false,
  data: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true);
          setData(decodedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true);
      setData(decodedToken);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setData(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, data, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const getOrgId = () => {
  const { data } = useAuth();
  return data?.user?.org || null;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};
