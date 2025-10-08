import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  student_id: string;
  batch: string;
  department: string;
  total_score: number;
  rank_position: number;
  leetcode_score: number;
  codeforces_score: number;
  codechef_score: number;
  gfg_score: number;
  hackerrank_score: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'batch' | 'department'>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, selectedBatch, selectedDepartment]);

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from('unified_scores')
        .select(`
          *,
          students!inner(
            id,
            full_name,
            student_id,
            batch,
            department
          )
        `)
        .order('total_score', { ascending: false });

      if (filter === 'batch' && selectedBatch) {
        query = query.eq('students.batch', selectedBatch);
      }
      
      if (filter === 'department' && selectedDepartment) {
        query = query.eq('students.department', selectedDepartment);
      }

      const { data } = await query;

      if (data) {
        const formattedData = data.map((entry, index) => ({
          id: entry.student_id,
          full_name: entry.students.full_name,
          student_id: entry.students.student_id,
          batch: entry.students.batch,
          department: entry.students.department,
          total_score: entry.total_score,
          rank_position: index + 1,
          leetcode_score: entry.leetcode_score,
          codeforces_score: entry.codeforces_score,
          codechef_score: entry.codechef_score,
          gfg_score: entry.gfg_score,
          hackerrank_score: entry.hackerrank_score,
        }));
        setLeaderboard(formattedData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-slate-600 font-semibold text-sm">{position}</span>;
  };

  const getRankBadge = (position: number) => {
    if (position <= 3) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (position <= 10) return 'bg-gradient-to-r from-purple-500 to-blue-600';
    return 'bg-gradient-to-r from-slate-400 to-slate-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
        <p className="text-purple-100">Compete with your peers across all coding platforms</p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Students</option>
              <option value="batch">Batch</option>
              <option value="department">Department</option>
            </select>
          </div>

          {filter === 'batch' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Batch:</label>
              <input
                type="text"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 2024"
              />
            </div>
          )}

          {filter === 'department' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department:</label>
              <input
                type="text"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., CSE"
              />
            </div>
          )}
        </div>
      </div>

      {/* Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div
              key={entry.id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6 text-center relative overflow-hidden ${
                index === 0 ? 'transform scale-105' : ''
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRankBadge(index + 1)}`}></div>
              
              <div className="mb-4">
                {getRankIcon(index + 1)}
              </div>
              
              <h3 className="font-semibold text-slate-900 mb-1">{entry.full_name}</h3>
              <p className="text-sm text-slate-600 mb-2">{entry.student_id}</p>
              <p className="text-xs text-slate-500 mb-4">{entry.department} • {entry.batch}</p>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{entry.total_score.toFixed(1)}</p>
                <p className="text-xs text-slate-600">Total Score</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Full Rankings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">GFG</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leaderboard.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className="font-medium text-slate-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-slate-900">{entry.full_name}</div>
                      <div className="text-sm text-slate-500">{entry.student_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.batch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-purple-600">{entry.total_score.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.leetcode_score.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.codeforces_score.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.codechef_score.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.gfg_score.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{entry.hackerrank_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-600">Students need to add their coding profiles to appear on the leaderboard</p>
          </div>
        )}
      </div>
    </div>
  );
};