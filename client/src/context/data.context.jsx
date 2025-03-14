import { useState, createContext, useContext } from 'react';

const DataContext = createContext({
  adminDashboard: null,
  adminPastLeaderboards: null,
  employeeDashboard: null,
  employeeBadges: null,
  employeePastQuizzes: null,
  monthlyLeaderboard: null,
  setAdminDashboard: () => {},
  setAdminPastLeaderboards: () => {},
  setEmployeeDashboard: () => {},
  setEmployeeBadges: () => {},
  setEmployeePastQuizzes: () => {},
  setMonthlyLeaderboard: () => {},
});

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    adminDashboard: null,
    adminPastLeaderboards: null,
    employeeDashboard: null,
    employeeBadges: null,
    employeePastQuizzes: null,
    monthlyLeaderboard: null,
  });

  const setAdminDashboard = (adminDashboard) => {
    setData((prevData) => ({ ...prevData, adminDashboard }));
  };

  const setAdminPastLeaderboards = (adminPastLeaderboards) => {
    setData((prevData) => ({ ...prevData, adminPastLeaderboards }));
  };

  const setEmployeeDashboard = (employeeDashboard) => {
    setData((prevData) => ({ ...prevData, employeeDashboard }));
  };

  const setEmployeeBadges = (employeeBadges) => {
    setData((prevData) => ({ ...prevData, employeeBadges }));
  };

  const setEmployeePastQuizzes = (employeePastQuizzes) => {
    setData((prevData) => ({ ...prevData, employeePastQuizzes }));
  };

  const setMonthlyLeaderboard = (monthlyLeaderboard) => {
    setData((prevData) => ({ ...prevData, monthlyLeaderboard }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        setAdminDashboard,
        setAdminPastLeaderboards,
        setEmployeeDashboard,
        setEmployeeBadges,
        setEmployeePastQuizzes,
        setMonthlyLeaderboard,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
