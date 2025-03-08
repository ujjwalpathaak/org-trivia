import { useEffect, useState } from 'react';
import { getLeaderboardByOrgId } from '../api';
import { useOrgId } from '../context/auth.context';

const Leaderboard = () => {
  const orgId = useOrgId();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboardByOrgId = async () => {
      if (!orgId) return;
      try {
        const leaderboard = await getLeaderboardByOrgId(orgId);
        setLeaderboard(leaderboard);
      } catch (error) {
        console.error('Error checking score status:', error);
        setIsQuizLive(false);
      }
    };
    fetchLeaderboardByOrgId();
  }, [orgId]);

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">🏆 Monthly Leaderboard</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Rank</th>
            <th className="p-2">Player</th>
            <th className="p-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.employee.name} className="border-t">
              <td className="p-2 font-semibold">#{index + 1}</td>
              <td className="p-2">{player.employee.name}</td>
              <td className="p-2 text-right font-bold">{player.totalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
