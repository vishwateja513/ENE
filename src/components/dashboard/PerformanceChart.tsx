import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface UnifiedScore {
  total_score: number;
  leetcode_score: number;
  codeforces_score: number;
  codechef_score: number;
  gfg_score: number;
  hackerrank_score: number;
  rank_position: number | null;
}

interface PerformanceChartProps {
  scores: UnifiedScore;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ scores }) => {
  const radarData = [
    { platform: 'LeetCode', score: scores.leetcode_score, fullMark: 100 },
    { platform: 'Codeforces', score: scores.codeforces_score, fullMark: 100 },
    { platform: 'CodeChef', score: scores.codechef_score, fullMark: 100 },
    { platform: 'GeeksforGeeks', score: scores.gfg_score, fullMark: 100 },
    { platform: 'HackerRank', score: scores.hackerrank_score, fullMark: 100 },
  ];

  const barData = radarData.map(item => ({
    name: item.platform.replace('GeeksforGeeks', 'GFG'),
    score: item.score,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart */}
      <div className="h-80">
        <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">Platform Performance Radar</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="platform" 
              className="text-xs"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8b5cf6"
              fill="url(#radarGradient)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="h-80">
        <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">Platform Scores Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar 
              dataKey="score" 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};