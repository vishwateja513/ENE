import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          student_id: string;
          batch: string;
          department: string;
          phone: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          student_id: string;
          batch?: string;
          department?: string;
          phone?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          student_id?: string;
          batch?: string;
          department?: string;
          phone?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coding_profiles: {
        Row: {
          id: string;
          student_id: string;
          platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'hackerrank';
          username: string;
          profile_url: string;
          last_synced: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'hackerrank';
          username: string;
          profile_url?: string;
          last_synced?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          platform?: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'hackerrank';
          username?: string;
          profile_url?: string;
          last_synced?: string | null;
          created_at?: string;
        };
      };
      coding_stats: {
        Row: {
          id: string;
          profile_id: string;
          problems_solved: number;
          contests_participated: number;
          rating: number;
          max_rating: number;
          rank: string;
          easy_solved: number;
          medium_solved: number;
          hard_solved: number;
          acceptance_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          problems_solved?: number;
          contests_participated?: number;
          rating?: number;
          max_rating?: number;
          rank?: string;
          easy_solved?: number;
          medium_solved?: number;
          hard_solved?: number;
          acceptance_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          problems_solved?: number;
          contests_participated?: number;
          rating?: number;
          max_rating?: number;
          rank?: string;
          easy_solved?: number;
          medium_solved?: number;
          hard_solved?: number;
          acceptance_rate?: number;
          created_at?: string;
        };
      };
      unified_scores: {
        Row: {
          id: string;
          student_id: string;
          total_score: number;
          leetcode_score: number;
          codeforces_score: number;
          codechef_score: number;
          gfg_score: number;
          hackerrank_score: number;
          rank_position: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          total_score?: number;
          leetcode_score?: number;
          codeforces_score?: number;
          codechef_score?: number;
          gfg_score?: number;
          hackerrank_score?: number;
          rank_position?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          total_score?: number;
          leetcode_score?: number;
          codeforces_score?: number;
          codechef_score?: number;
          gfg_score?: number;
          hackerrank_score?: number;
          rank_position?: number | null;
          updated_at?: string;
        };
      };
    };
  };
};