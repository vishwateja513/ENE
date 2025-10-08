import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { StatsCard } from './StatsCard';
import { PlatformCard } from './PlatformCard';
import { PerformanceChart } from './PerformanceChart';
import { BatchFilter } from './BatchFilter';
import { Trophy, Target, TrendingUp, Award, Plus, Code as Code2 } from 'lucide-react';

interface StudentProfile {
  id: string;
  full_name: string;
  student_id: string;
  batch: string;
  department: string;
}

interface CodingProfile {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  last_synced: string | null;
  stats: any;
}

interface UnifiedScore {
  total_score: number;
  leetcode_score: number;
  codeforces_score: number;
  codechef_score: number;
  gfg_score: number;
  hackerrank_score: number;
  rank_position: number | null;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profiles, setProfiles] = useState<CodingProfile[]>([]);
  const [scores, setScores] = useState<UnifiedScore | null>(null);
  const [batchmates, setBatchmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProfile, setShowAddProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch student profile
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (studentData) {
        setProfile(studentData);
      }

      // Fetch coding profiles with stats
      const { data: profilesData } = await supabase
        .from('coding_profiles')
        .select(`
          *,
          coding_stats(*)
        `)
        .eq('student_id', user!.id);

      if (profilesData) {
        const formattedProfiles = profilesData.map(profile => ({
          ...profile,
          stats: profile.coding_stats[0] || null,
        }));
        setProfiles(formattedProfiles);
      }

      // Fetch unified scores
      const { data: scoresData } = await supabase
        .from('unified_scores')
        .select('*')
        .eq('student_id', user!.id);

      if (scoresData && scoresData.length > 0) {
        setScores(scoresData[0]);
      } else {
        // Initialize unified score if it doesn't exist
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-unified-score`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId: user!.id }),
          });
          
          // Fetch again after initialization
          const { data: newScoresData } = await supabase
            .from('unified_scores')
            .select('*')
            .eq('student_id', user!.id);
            
          if (newScoresData && newScoresData.length > 0) {
            setScores(newScoresData[0]);
          }
        } catch (error) {
          console.warn('Failed to initialize unified score:', error);
        }
      }

      // Fetch batchmates for comparison
      if (studentData?.batch) {
        const { data: batchmatesData } = await supabase
          .from('students')
          .select(`
            id,
            full_name,
            student_id,
            unified_scores(total_score, rank_position)
          `)
          .eq('batch', studentData.batch)
          .neq('id', user!.id)
          .limit(5);

        if (batchmatesData) {
          setBatchmates(batchmatesData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProfile = async (profileId: string, platform: string) => {
    try {
      // Fetch fresh stats from the platform
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-coding-stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          platform,
          username: profiles.find(p => p.id === profileId)?.username,
        }),
      });

      // Recalculate unified score
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-unified-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: user!.id }),
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const totalProblems = profiles.reduce((total, profile) => {
    return total + (profile.stats?.problems_solved || 0);
  }, 0);

  const totalContests = profiles.reduce((total, profile) => {
    return total + (profile.stats?.contests_participated || 0);
  }, 0);

  const avgRating = profiles.length > 0 
    ? Math.round(profiles.reduce((total, profile) => {
        return total + (profile.stats?.rating || 0);
      }, 0) / profiles.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.full_name || 'Student'}!
        </h1>
        <p className="text-purple-100">
          {profile?.student_id} • {profile?.department} • Batch {profile?.batch}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Problems"
          value={totalProblems}
          icon={Target}
          gradient="from-green-500 to-emerald-600"
          description="Across all platforms"
        />
        <StatsCard
          title="Contests"
          value={totalContests}
          icon={Trophy}
          gradient="from-blue-500 to-indigo-600"
          description="Participated"
        />
        <StatsCard
          title="Avg Rating"
          value={avgRating}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-600"
          description="Cross-platform average"
        />
        <StatsCard
          title="Overall Rank"
          value={scores?.rank_position || 'N/A'}
          icon={Award}
          gradient="from-orange-500 to-red-600"
          description="Global position"
        />
      </div>

      {/* Performance Chart */}
      {scores && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Performance</h2>
          <PerformanceChart scores={scores} />
        </div>
      )}

      {/* Batch Comparison */}
      {profile?.batch && batchmates.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Batch {profile.batch} Comparison
          </h2>
          <BatchFilter 
            currentUser={{
              name: profile.full_name,
              score: scores?.total_score || 0,
              rank: scores?.rank_position || 0,
            }}
            batchmates={batchmates.map(mate => ({
              name: mate.full_name,
              studentId: mate.student_id,
              score: mate.unified_scores?.[0]?.total_score || 0,
              rank: mate.unified_scores?.[0]?.rank_position || 0,
            }))}
          />
        </div>
      )}

      {/* Coding Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Coding Profiles</h2>
          <button
            onClick={() => setShowAddProfile(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Profile
          </button>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <PlatformCard
                key={profile.id}
                platform={profile.platform}
                username={profile.username}
                profileUrl={profile.profile_url}
                stats={profile.stats}
                lastSynced={profile.last_synced}
                onRefresh={() => handleRefreshProfile(profile.id, profile.platform)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
            <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Coding Profiles</h3>
            <p className="text-slate-600 mb-4">Add your coding platform profiles to start tracking your progress</p>
            <button
              onClick={() => setShowAddProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Your First Profile
            </button>
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      {showAddProfile && (
        <AddProfileModal
          onClose={() => setShowAddProfile(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

interface AddProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState('leetcode');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = [
    { id: 'leetcode', name: 'LeetCode', baseUrl: 'https://leetcode.com/u/' },
    { id: 'codeforces', name: 'Codeforces', baseUrl: 'https://codeforces.com/profile/' },
    { id: 'codechef', name: 'CodeChef', baseUrl: 'https://www.codechef.com/users/' },
    { id: 'gfg', name: 'GeeksforGeeks', baseUrl: 'https://www.geeksforgeeks.org/user/' },
    { id: 'hackerrank', name: 'HackerRank', baseUrl: 'https://www.hackerrank.com/profile/' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const selectedPlatform = platforms.find(p => p.id === platform);
      const profileUrl = `${selectedPlatform?.baseUrl}${username}`;

      const { error } = await supabase
        .from('coding_profiles')
        .insert({
          student_id: user!.id,
          platform,
          username,
          profile_url: profileUrl,
        });

      if (error) {
        if (error.code === '23505') {
          setError('You already have a profile for this platform');
        } else {
          setError(error.message);
        }
      } else {
        // Fetch initial stats for the new profile
        try {
          const { data: newProfile } = await supabase
            .from('coding_profiles')
            .select('id')
            .eq('student_id', user!.id)
            .eq('platform', platform)
            .eq('username', username)
            .single();

          if (newProfile) {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-coding-stats`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profileId: newProfile.id,
                platform,
                username,
              }),
            });

            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-unified-score`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ studentId: user!.id }),
            });
          }
        } catch (err) {
          console.warn('Failed to fetch initial stats:', err);
        }

        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Add Coding Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your username"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};