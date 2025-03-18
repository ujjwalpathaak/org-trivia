import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, BarChart2, Activity } from 'lucide-react';

const performanceData = [
  { name: 'Excellent', value: 40 },
  { name: 'Good', value: 35 },
  { name: 'Average', value: 15 },
  { name: 'Below Average', value: 10 },
];

const COLORS = ['#22c55e', '#3b82f6', '#facc15', '#ef4444'];

export default function QuizAnalytics({ analytics }) {
  const quizData = analytics?.participationByGenre?.map((item) => {
    return {
      category: item._id,
      participants: item.count,
    };
  });

  return (
    <div className="col-span-5">
      <div className="bg-white rounded-lg p-6 shadow mb-4">
        <div className="flex gap-4">
          <BarChart2 className="h-10 w-10 text-blue-500" />
          <h2 className="text-lg font-semibold">Organization Quiz Analytics</h2>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Participation Overview
          </h4>
          {quizData?.length === 0 ? (
            <span>No data found!</span>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participants" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
