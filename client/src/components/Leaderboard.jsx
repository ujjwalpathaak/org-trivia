import { useEffect, useState } from 'react';
import { getLeaderboardByOrgId } from '../api';
import { useOrgId } from '../context/auth.context';
import { getMonth } from '../utils';
import { CalendarDays } from 'lucide-react';

const Leaderboard = ({ last3Leaderboards }) => {
  const orgId = useOrgId();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboardByOrgId = async () => {
      if (!orgId) return;
      try {
        const leaderboard = await getLeaderboardByOrgId(orgId);
        setLeaderboard(leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboardByOrgId();
  }, [orgId]);

  return (
    <>
      {/* Current Leaderboard */}
      <div className="bg-white rounded-lg p-6 shadow mb-4 w-full">
        <div className="w-full bg-white rounded-lg ">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            🏆 Monthly Leaderboard
          </h1>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((player, index) => (
                  <tr key={player.employeeId} className="border-t bg-gray-100">
                    <td className="p-3 font-semibold">#{index + 1}</td>
                    <td className="p-3">{player.employee.name}</td>
                    <td className="p-3 text-left font-bold">
                      {player.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {last3Leaderboards &&
        last3Leaderboards.map((leaderboard) => (
          <div className="bg-white rounded-lg p-6 shadow mb-4">
            <div
              key={`${leaderboard.month}-${leaderboard.year}`}
              className="w-full bg-white rounded-lg"
            >
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <CalendarDays className="w-4 h-4 text-red-500" />
                {`Leaderboard ${getMonth(leaderboard.month)} ${leaderboard.year}`}
              </h1>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <th className="p-3 text-left">Rank</th>
                      <th className="p-3 text-left">Player</th>
                      <th className="p-3 text-left">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.employees?.map((player, index) => (
                      <tr
                        key={player.employeeId}
                        className="border-t bg-gray-100"
                      >
                        <td className="p-3 font-semibold">#{index + 1}</td>
                        <td className="p-3">{player.name}</td>
                        <td className="p-3 text-left font-bold">
                          {player.totalScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default Leaderboard;
