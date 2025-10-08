import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Users, Trophy, Target } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [batchStats, setBatchStats] = useState<any[]>([]);
  const [platformDistribution, setPlatformDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch department-wise statistics
      const { data: deptData } = await supabase
        .from('students')
        .select('department')
        .neq('department', '');

      if (deptData) {
        const deptCounts = deptData.reduce((acc, student) => {
          acc[student.department] = (acc[student.department] || 0) + 1;
          return acc;
        }, {});

        setDepartmentStats(
          Object.entries(deptCounts).map(([department, count]) => ({
            department,
            students: count,
          }))
        );
      }

      // Fetch batch-wise statistics
      const { data: batchData } = await supabase
        .from('students')
        .select('batch')
        .neq('batch', '');

      if (batchData) {
        const batchCounts = batchData.reduce((acc, student) => {
          acc[student.batch] = (acc[student.batch] || 0) + 1;
          return acc;
        }, {});

        setBatchStats(
          Object.entries(batchCounts).map(([batch, count]) => ({
            batch,
            students: count,
          }))
        );
      }

      // Fetch platform distribution
      const { data: profileData } = await supabase
        .from('coding_profiles')
        .select('platform');

      if (profileData) {
        const platformCounts = profileData.reduce((acc, profile) => {
          acc[profile.platform] = (acc[profile.platform] || 0) + 1;
          return acc;
        }, {});

        setPlatformDistribution(
          Object.entries(platformCounts).map(([platform, count]) => ({
            platform,
            count,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-purple-100">Insights into student performance and engagement</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{departmentStats.reduce((sum, dept) => sum + dept.students, 0)}</p>
              <p className="text-sm text-slate-600">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{platformDistribution.reduce((sum, platform) => sum + platform.count, 0)}</p>
              <p className="text-sm text-slate-600">Active Profiles</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{departmentStats.length}</p>
              <p className="text-sm text-slate-600">Departments</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{batchStats.length}</p>
              <p className="text-sm text-slate-600">Batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Students by Department</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="department" 
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
                  dataKey="students" 
                  fill="url(#deptGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Usage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Batch Trends */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Batch Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={batchStats.sort((a, b) => a.batch.localeCompare(b.batch))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="batch" 
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
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#8b5cf6' }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};