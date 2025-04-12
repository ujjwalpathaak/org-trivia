import { useEffect, useState } from 'react';
import { fetchLeaderboardAPI } from '../api';
import { useOrgId } from '../context/auth.context';
import { getMonth } from '../utils';

const Leaderboard = () => {
  const orgId = useOrgId();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [leaderboard, setLeaderboard] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetchLeaderboardByOrgId = async () => {
      if (!orgId) return;
      try {
        const data = await fetchLeaderboardAPI(selectedMonth, selectedYear);
        while (data.leaderboard.length < 3) {
          data.leaderboard.push({ employee: { name: '' }, totalScore: '' });
        }
        setLeaderboard(data.leaderboard);
        setYears(
          Array.from({ length: currentYear - data.yearBoundary + 1 }, (_, i) => currentYear - i)
        );
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboardByOrgId();
  }, [orgId, selectedMonth, selectedYear]);

  // Filter months: If year is current, show only months <= currentMonth
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="bg-white rounded-lg p-6 shadow mb-4 w-full">
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
        🏆 Leaderboard
      </h1>
      <div className="flex items-center gap-4 mb-4">
        {/* Month Dropdown */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border p-2 rounded-lg"
        >
          {months.map((month) => (
            <option
              key={month}
              value={month}
              disabled={selectedYear === currentYear && month > currentMonth}
            >
              {getMonth(month)}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border p-2 rounded-lg"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table */}
      {leaderboard?.length === 0 ? (
        <span>No Data Available</span>
      ) : (
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
              {leaderboard.map((player, index) => (
                <tr key={index} className="border-t bg-gray-100">
                  <td className="p-3 font-semibold h-12">{`${index + 1}`}</td>
                  <td className="p-3">{player.employee.name || '-'}</td>
                  <td className="p-3 text-left font-bold">{player.totalScore || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
