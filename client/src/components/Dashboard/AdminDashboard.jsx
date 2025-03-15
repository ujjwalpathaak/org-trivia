import { useEffect, useState } from 'react';
import { useAuth, useOrgId } from '../../context/auth.context';
import { getAnalytics } from '../../api';
import AdminProfile from './AdminProfile';
import AdminMainContent from './AdminMainContent';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  const orgId = useOrgId();
  const { data } = useAuth();

  const [analytics, setAnalytics] = useState({});
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);

  useEffect(() => {
    const getOrgAnalytics = async () => {
      if (!orgId) return;
      const data = await getAnalytics(orgId);
      setAnalytics(data);
    };
    getOrgAnalytics();
  }, [orgId]);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        <AdminProfile
          data={data}
          last3Leaderboards={analytics.last3Leaderboards}
        />
        <AdminMainContent
          isQuestionMakerOpen={isQuestionMakerOpen}
          setIsQuestionMakerOpen={setIsQuestionMakerOpen}
          analytics={analytics}
        />
        <AdminSidebar analytics={analytics} />
      </div>
    </div>
  );
};

export default AdminDashboard;
