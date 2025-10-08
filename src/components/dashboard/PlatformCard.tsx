import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface PlatformStats {
  problems_solved: number;
  rating: number;
  max_rating: number;
  contests_participated: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  acceptance_rate?: number;
  rank?: string;
}

interface PlatformCardProps {
  platform: string;
  username: string;
  profileUrl: string;
  stats: PlatformStats | null;
  lastSynced: string | null;
  onRefresh: () => void;
  loading?: boolean;
}

const platformColors = {
  leetcode: 'from-orange-500 to-orange-600',
  codeforces: 'from-blue-500 to-blue-600',
  codechef: 'from-amber-500 to-amber-600',
  gfg: 'from-green-500 to-green-600',
  hackerrank: 'from-emerald-500 to-emerald-600',
};

const platformLogos = {
  leetcode: '🔶',
  codeforces: '🔷',
  codechef: '👨‍🍳',
  gfg: '🌿',
  hackerrank: '🎯',
};

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  username,
  profileUrl,
  stats,
  lastSynced,
  onRefresh,
  loading = false,
}) => {
  const formatPlatformName = (platform: string) => {
    const names = {
      leetcode: 'LeetCode',
      codeforces: 'Codeforces',
      codechef: 'CodeChef',
      gfg: 'GeeksforGeeks',
      hackerrank: 'HackerRank',
    };
    return names[platform as keyof typeof names] || platform;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never synced';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[platform as keyof typeof platformColors]} rounded-lg flex items-center justify-center text-lg`}>
            {platformLogos[platform as keyof typeof platformLogos]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{formatPlatformName(platform)}</h3>
            <p className="text-sm text-slate-600">@{username}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.problems_solved}</p>
              <p className="text-xs text-slate-600">Problems Solved</p>
            </div>
            
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.rating}</p>
              <p className="text-xs text-slate-600">Current Rating</p>
            </div>
          </div>

          {platform === 'leetcode' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-semibold text-green-700">{stats.easy_solved || 0}</p>
                <p className="text-xs text-green-600">Easy</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <p className="text-lg font-semibold text-yellow-700">{stats.medium_solved || 0}</p>
                <p className="text-xs text-yellow-600">Medium</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-lg font-semibold text-red-700">{stats.hard_solved || 0}</p>
                <p className="text-xs text-red-600">Hard</p>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 flex justify-between">
            <span>Last synced: {formatDate(lastSynced)}</span>
            {stats.rank && <span>Rank: {stats.rank}</span>}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No stats available</p>
          <p className="text-xs mt-1">Click refresh to fetch data</p>
        </div>
      )}
    </div>
  );
};