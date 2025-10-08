import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profiles that need refresh (24+ hours old)
    const { data: profilesToRefresh } = await supabase
      .from('coding_profiles')
      .select(`
        id,
        student_id,
        platform,
        username,
        last_synced
      `)
      .or('last_synced.is.null,last_synced.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!profilesToRefresh || profilesToRefresh.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No profiles need refresh', refreshed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let refreshedCount = 0;
    const errors: string[] = [];

    // Process each profile
    for (const profile of profilesToRefresh) {
      try {
        // Fetch fresh stats
        const statsResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-coding-stats`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: profile.id,
            platform: profile.platform,
            username: profile.username,
          }),
        });

        if (statsResponse.ok) {
          refreshedCount++;
          
          // Update refresh schedule
          await supabase
            .from('refresh_schedule')
            .upsert({
              student_id: profile.student_id,
              last_auto_refresh: new Date().toISOString(),
              next_refresh_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              refresh_count: 1, // This would be incremented in a real implementation
            });
        }
      } catch (error) {
        errors.push(`Failed to refresh ${profile.platform} for ${profile.username}: ${error.message}`);
      }
    }

    // Recalculate unified scores for affected students
    const uniqueStudentIds = [...new Set(profilesToRefresh.map(p => p.student_id))];
    
    for (const studentId of uniqueStudentIds) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/calculate-unified-score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId }),
        });
      } catch (error) {
        errors.push(`Failed to recalculate score for student ${studentId}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Auto-refresh completed`,
        refreshed: refreshedCount,
        total: profilesToRefresh.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});