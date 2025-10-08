import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { AuthForm } from './components/auth/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { Profile } from './components/profile/Profile';
import { Analytics } from './components/analytics/Analytics';

type ViewType = 'dashboard' | 'leaderboard' | 'admin' | 'profile' | 'analytics';

const AppContent: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Enable automatic 24-hour refresh
  useAutoRefresh();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <Analytics />;
      case 'profile':
        return <Profile />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;