import React from 'react';
import { useAuth } from '../context/auth.context';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

const Dashboard = () => {
  const { data } = useAuth();

  return (
    <div className="bg-[#f0f2f5] font-black flex flex-col justify-center items-center">
      {data?.role === 'Employee' ? <EmployeeDashboard /> : <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
