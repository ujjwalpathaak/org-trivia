import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { getAnalyticsAPI } from '../../api';
import AdminProfile from './AdminProfile';
import AdminMainContent from './AdminMainContent';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  const { data } = useAuth();

  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const getOrgAnalytics = async () => {
      const data = await getAnalyticsAPI();
      setAnalytics(data);
    };
    getOrgAnalytics();
  }, []);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-12 gap-4 w-[85vw]">
        <AdminProfile data={data} />
        <AdminMainContent analytics={analytics} />
        <AdminSidebar analytics={analytics} />
      </div>
    </div>
  );
};

export default AdminDashboard;
