import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  GraduationCap, 
  Save,
  Code2,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  batch: string;
  department: string;
  phone: string;
  created_at: string;
}

interface CodingProfile {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  last_synced: string | null;
  stats: any;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [codingProfiles, setCodingProfiles] = useState<CodingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'coding'>('personal');
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      // Fetch student profile
      const { data: profileData } = await supabase
        .from('students')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch coding profiles with stats
      const { data: codingData } = await supabase
        .from('coding_profiles')
        .select(`
          *,
          coding_stats(*)
        `)
        .eq('student_id', user!.id);

      if (codingData) {
        const formattedProfiles = codingData.map(profile => ({
          ...profile,
          stats: profile.coding_stats[0] || null,
        }));
        setCodingProfiles(formattedProfiles);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('students')
        .update({
          full_name: profile.full_name,
          batch: profile.batch,
          department: profile.department,
          phone: profile.phone,
        })
        .eq('id', profile.id);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleUpdateCodingProfile = async (profileId: string, newUsername: string) => {
    try {
      const profileToUpdate = codingProfiles.find(p => p.id === profileId);
      if (!profileToUpdate) return;

      const platformUrls = {
        leetcode: 'https://leetcode.com/u/',
        codeforces: 'https://codeforces.com/profile/',
        codechef: 'https://www.codechef.com/users/',
        gfg: 'https://www.geeksforgeeks.org/user/',
        hackerrank: 'https://www.hackerrank.com/profile/',
      };

      const newProfileUrl = `${platformUrls[profileToUpdate.platform as keyof typeof platformUrls]}${newUsername}`;

      const { error } = await supabase
        .from('coding_profiles')
        .update({
          username: newUsername,
          profile_url: newProfileUrl,
        })
        .eq('id', profileId);

      if (error) {
        setError(error.message);
      } else {
        setEditingProfile(null);
        setNewUsername('');
        fetchProfileData();
        
        // Refresh stats for updated profile
        await handleRefreshProfile(profileId, profileToUpdate.platform);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleRefreshProfile = async (profileId: string, platform: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-coding-stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          platform,
          username: codingProfiles.find(p => p.id === profileId)?.username,
        }),
      });

      if (response.ok) {
        // Recalculate unified score
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-unified-score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId: user!.id }),
        });

        fetchProfileData();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this coding profile?')) return;

    try {
      const { error } = await supabase
        .from('coding_profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        setError(error.message);
      } else {
        fetchProfileData();
        
        // Recalculate unified score after deletion
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
      setError('Failed to delete profile');
    }
  };

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

  const platformColors = {
    leetcode: 'from-orange-500 to-orange-600',
    codeforces: 'from-blue-500 to-blue-600',
    codechef: 'from-amber-500 to-amber-600',
    gfg: 'from-green-500 to-green-600',
    hackerrank: 'from-emerald-500 to-emerald-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Profile Not Found</h3>
        <p className="text-slate-600">Unable to load your profile information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Profile Management</h1>
        <p className="text-purple-100">Manage your personal information and coding profiles</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'personal'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'coding'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4 inline mr-2" />
            Coding Profiles
          </button>
        </div>
      </div>

      {/* Personal Details Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h2>
            
            <form onSubmit={handlePersonalSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Student ID (Read-only)
                  </label>
                  <input
                    type="text"
                    value={profile.student_id}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Batch
                  </label>
                  <input
                    type="text"
                    value={profile.batch}
                    onChange={(e) => handleInputChange('batch', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm">Profile updated successfully!</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-700">Account Created</p>
                <p className="text-slate-600">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Account ID</p>
                <p className="text-slate-600 font-mono text-xs">{profile.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coding Profiles Tab */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          {/* DSA Profiles Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">DSA Profiles</h2>
              <AddProfileButton onSuccess={fetchProfileData} />
            </div>

            <div className="space-y-4">
              {codingProfiles.map((codingProfile) => (
                <div key={codingProfile.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[codingProfile.platform as keyof typeof platformColors]} rounded-lg flex items-center justify-center text-white font-semibold`}>
                        {formatPlatformName(codingProfile.platform).charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {formatPlatformName(codingProfile.platform)} username
                          </span>
                          <span className="text-red-500">*</span>
                        </div>
                        
                        {editingProfile === codingProfile.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder={codingProfile.username}
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateCodingProfile(codingProfile.id, newUsername)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => {
                                setEditingProfile(null);
                                setNewUsername('');
                              }}
                              className="px-3 py-1 bg-slate-300 text-slate-700 text-sm rounded hover:bg-slate-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-600">{codingProfile.username}</span>
                            <button
                              onClick={() => {
                                setEditingProfile(codingProfile.id);
                                setNewUsername(codingProfile.username);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRefreshProfile(codingProfile.id, codingProfile.platform)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Refresh stats"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      
                      <a
                        href={codingProfile.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteProfile(codingProfile.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Preview */}
                  {codingProfile.stats && (
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{codingProfile.stats.problems_solved}</p>
                        <p className="text-xs text-slate-600">Problems</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{codingProfile.stats.rating}</p>
                        <p className="text-xs text-slate-600">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{codingProfile.stats.contests_participated}</p>
                        <p className="text-xs text-slate-600">Contests</p>
                      </div>
                    </div>
                  )}

                  {codingProfile.last_synced && (
                    <div className="mt-2 text-xs text-slate-500">
                      Last updated: {new Date(codingProfile.last_synced).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}

              {codingProfiles.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm">No coding profiles added yet</p>
                  <p className="text-xs mt-1">Add your first profile to start tracking progress</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AddProfileButtonProps {
  onSuccess: () => void;
}

const AddProfileButton: React.FC<AddProfileButtonProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
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
        onSuccess();
        setShowModal(false);
        setUsername('');
        setPlatform('leetcode');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        Add Profile
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Add Coding Profile</h3>
            
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
                  onClick={() => setShowModal(false)}
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
      )}
    </>
  );
};