import React from "react";
import { useAuth } from "../context/auth.context";
import EmployeeDashboard from "../components/Dashboard/EmployeeDashboard";
import AdminDashboard from "../components/Dashboard/AdminDashboard";

const Dashboard = () => {
  const { data } = useAuth();

  return (
    <div className="parent-page-div font-black flex justify-center items-center">
      {data?.user?.role === "Employee" ? (
        <EmployeeDashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default Dashboard;
