import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ScoreCalculationRequest {
  studentId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId }: ScoreCalculationRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all coding stats for the student
    const { data: profiles } = await supabase
      .from('coding_profiles')
      .select(`
        *,
        coding_stats(*)
      `)
      .eq('student_id', studentId);

    if (!profiles) {
      throw new Error('No profiles found for student');
    }

    // Calculate platform-specific scores
    const platformScores = {
      leetcode_score: 0,
      codeforces_score: 0,
      codechef_score: 0,
      gfg_score: 0,
      hackerrank_score: 0,
    };

    profiles.forEach(profile => {
      const stats = profile.coding_stats[0];
      if (!stats) return;

      const score = calculatePlatformScore(profile.platform, stats);
      
      switch (profile.platform) {
        case 'leetcode':
          platformScores.leetcode_score = score;
          break;
        case 'codeforces':
          platformScores.codeforces_score = score;
          break;
        case 'codechef':
          platformScores.codechef_score = score;
          break;
        case 'gfg':
          platformScores.gfg_score = score;
          break;
        case 'hackerrank':
          platformScores.hackerrank_score = score;
          break;
      }
    });

    // Calculate total score (weighted average)
    const weights = {
      leetcode: 0.3,
      codeforces: 0.25,
      codechef: 0.2,
      gfg: 0.15,
      hackerrank: 0.1,
    };

    const totalScore = 
      platformScores.leetcode_score * weights.leetcode +
      platformScores.codeforces_score * weights.codeforces +
      platformScores.codechef_score * weights.codechef +
      platformScores.gfg_score * weights.gfg +
      platformScores.hackerrank_score * weights.hackerrank;

    // Upsert unified score
    const { error } = await supabase
      .from('unified_scores')
      .upsert({
        student_id: studentId,
        total_score: totalScore,
        ...platformScores,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    // Calculate rank position
    const { data: allScores } = await supabase
      .from('unified_scores')
      .select('student_id, total_score')
      .order('total_score', { ascending: false });

    if (allScores) {
      const rankPosition = allScores.findIndex(score => score.student_id === studentId) + 1;
      
      await supabase
        .from('unified_scores')
        .update({ rank_position: rankPosition })
        .eq('student_id', studentId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalScore,
        platformScores 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculatePlatformScore(platform: string, stats: any): number {
  const {
    problems_solved = 0,
    rating = 0,
    contests_participated = 0,
    easy_solved = 0,
    medium_solved = 0,
    hard_solved = 0,
    acceptance_rate = 0,
  } = stats;

  switch (platform) {
    case 'leetcode':
      // LeetCode scoring: problems + difficulty weighting + acceptance rate
      const difficultyScore = (easy_solved * 1) + (medium_solved * 3) + (hard_solved * 5);
      const acceptanceBonus = (acceptance_rate / 100) * 10;
      return Math.min(100, (difficultyScore * 0.1) + acceptanceBonus + (contests_participated * 2));

    case 'codeforces':
      // Codeforces scoring: rating-based with contest participation
      const ratingScore = Math.min(50, rating / 40); // Max 50 points for 2000+ rating
      const contestScore = Math.min(30, contests_participated * 1.5);
      const problemScore = Math.min(20, problems_solved * 0.05);
      return ratingScore + contestScore + problemScore;

    case 'codechef':
      // CodeChef scoring: similar to Codeforces
      const ccRatingScore = Math.min(45, rating / 45);
      const ccContestScore = Math.min(25, contests_participated * 2);
      const ccProblemScore = Math.min(30, problems_solved * 0.1);
      return ccRatingScore + ccContestScore + ccProblemScore;

    case 'gfg':
      // GFG scoring: problem-focused
      const gfgProblemScore = Math.min(60, problems_solved * 0.15);
      const gfgContestScore = Math.min(40, contests_participated * 3);
      return gfgProblemScore + gfgContestScore;

    case 'hackerrank':
      // HackerRank scoring: balanced approach
      const hrProblemScore = Math.min(50, problems_solved * 0.2);
      const hrContestScore = Math.min(30, contests_participated * 2.5);
      const hrRatingScore = Math.min(20, rating / 100);
      return hrProblemScore + hrContestScore + hrRatingScore;

    default:
      return 0;
  }
}