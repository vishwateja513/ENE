import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAutoRefresh = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Skip auto-refresh if using mock Supabase
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-id')) {
      return;
    }

    // Check for auto-refresh every hour
    const interval = setInterval(async () => {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-refresh-profiles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Auto-refresh failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    const initialCheck = async () => {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-refresh-profiles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Initial auto-refresh check failed:', error);
      }
    };

    initialCheck();

    return () => clearInterval(interval);
  }, [user]);
};