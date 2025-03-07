import { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setPlayers(data);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">🏆 Leaderboard</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Rank</th>
            <th className="p-2">Player</th>
            <th className="p-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.username} className="border-t">
              <td className="p-2 font-semibold">#{index + 1}</td>
              <td className="p-2">{player.username}</td>
              <td className="p-2 text-right font-bold">{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
