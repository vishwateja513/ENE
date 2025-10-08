// Mock Supabase client for demo purposes
export interface MockUser {
  id: string;
  email: string;
}

export interface MockSession {
  user: MockUser;
  access_token: string;
}

class MockSupabaseClient {
  private currentUser: MockUser | null = null;
  private currentSession: MockSession | null = null;
  private authListeners: ((event: string, session: MockSession | null) => void)[] = [];
  private mockData = {
    students: [] as any[],
    coding_profiles: [] as any[],
    unified_scores: [] as any[],
  };

  auth = {
    getSession: async () => {
      return { data: { session: this.currentSession } };
    },

    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      this.authListeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authListeners.indexOf(callback);
              if (index > -1) {
                this.authListeners.splice(index, 1);
              }
            }
          }
        }
      };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Mock successful login
      const user: MockUser = {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email
      };
      
      const session: MockSession = {
        user,
        access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9)
      };

      this.currentUser = user;
      this.currentSession = session;

      // Notify listeners
      this.authListeners.forEach(callback => callback('SIGNED_IN', session));

      return { error: null, data: { user, session } };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      // Mock successful signup
      const user: MockUser = {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email
      };
      
      const session: MockSession = {
        user,
        access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9)
      };

      this.currentUser = user;
      this.currentSession = session;

      // Notify listeners
      this.authListeners.forEach(callback => callback('SIGNED_UP', session));

      return { error: null, data: { user, session } };
    },

    signOut: async () => {
      this.currentUser = null;
      this.currentSession = null;

      // Notify listeners
      this.authListeners.forEach(callback => callback('SIGNED_OUT', null));

      return { error: null };
    }
  };

  from = (table: string) => {
    return {
      select: (columns: string) => ({
        neq: (column: string, value: any) => ({
          then: async (callback: any) => {
            // Mock department data
            if (table === 'students') {
              const mockDeptData = [
                { department: 'Computer Science' },
                { department: 'Information Technology' },
                { department: 'Electronics' },
              ];
              return callback({ data: mockDeptData });
            }
            return callback({ data: [] });
          }
        }),
        eq: (column: string, value: any) => ({
          single: async () => {
            // Mock student data
            if (table === 'students') {
              return {
                data: {
                  id: this.currentUser?.id || 'demo-user',
                  email: this.currentUser?.email || 'demo@example.com',
                  full_name: 'Demo User',
                  student_id: 'DEMO001',
                  batch: '2024',
                  department: 'Computer Science',
                  phone: '+1234567890',
                  is_admin: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              };
            }
            if (table === 'coding_profiles') {
              return { data: [] };
            }
            if (table === 'unified_scores') {
              return {
                data: {
                  id: 'demo-score',
                  student_id: this.currentUser?.id || 'demo-user',
                  total_score: 75.5,
                  leetcode_score: 80.0,
                  codeforces_score: 70.0,
                  codechef_score: 75.0,
                  gfg_score: 72.0,
                  hackerrank_score: 78.0,
                  rank_position: 5,
                  updated_at: new Date().toISOString()
                }
              };
            }
            return { data: null };
          },
          limit: (count: number) => ({
            then: async (callback: any) => {
              if (table === 'students') {
                const mockBatchmates = [
                  {
                    id: 'demo-mate-1',
                    full_name: 'Alice Johnson',
                    student_id: 'DEMO002',
                    unified_scores: [{ total_score: 85.2, rank_position: 3 }]
                  },
                  {
                    id: 'demo-mate-2', 
                    full_name: 'Bob Smith',
                    student_id: 'DEMO003',
                    unified_scores: [{ total_score: 72.8, rank_position: 7 }]
                  }
                ];
                return callback({ data: mockBatchmates });
              }
              return callback({ data: [] });
            }
          })
        }),
        order: (column: string, options?: any) => ({
          then: async (callback: any) => {
            if (table === 'unified_scores') {
              const mockLeaderboard = [
                {
                  student_id: 'demo-user-1',
                  total_score: 95.5,
                  leetcode_score: 90.0,
                  codeforces_score: 85.0,
                  codechef_score: 88.0,
                  gfg_score: 92.0,
                  hackerrank_score: 87.0,
                  students: {
                    full_name: 'Top Student',
                    student_id: 'TOP001',
                    batch: '2024',
                    department: 'Computer Science'
                  }
                }
              ];
              return callback({ data: mockLeaderboard });
            }
            return callback({ data: [] });
          }
        }),
        then: async (callback: any) => {
          if (table === 'coding_profiles') {
            return callback({ data: [] });
          }
          return callback({ data: [] });
        }
      }),
      insert: (data: any) => ({
        then: async (callback: any) => {
          return callback({ error: null });
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => {
            return callback({ error: null });
          }
        })
      }),
      upsert: (data: any) => ({
        then: async (callback: any) => {
          return callback({ error: null });
        }
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => {
            return callback({ error: null });
          }
        })
      })
    };
  };
}

export const mockSupabase = new MockSupabaseClient();

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