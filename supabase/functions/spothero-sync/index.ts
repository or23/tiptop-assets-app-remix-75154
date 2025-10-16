import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[SpotHero Sync] Syncing earnings for user:', user_id);

    // Get provider commission rate
    const { data: providerData, error: providerError } = await supabase
      .from('provider_commissions')
      .select('tiptop_commission_rate, user_earning_rate')
      .eq('provider_name', 'SpotHero')
      .single();

    if (providerError) {
      console.error('[SpotHero] Error fetching commission rates:', providerError);
      throw providerError;
    }

    const commissionRate = providerData.tiptop_commission_rate || 0.20;
    const userRate = providerData.user_earning_rate || 0.80;

    // TODO: Add actual SpotHero API integration here
    // For now, we'll create a placeholder showing the structure
    
    // Example of how to fetch from SpotHero API (when implemented):
    // const spotHeroApiKey = Deno.env.get('SPOTHERO_API_KEY');
    // const response = await fetch('https://api.spothero.com/v1/earnings', {
    //   headers: { 'Authorization': `Bearer ${spotHeroApiKey}` }
    // });
    // const data = await response.json();

    // Mock earnings data for demonstration
    const totalEarnings = 0; // Will be replaced with actual API data
    
    const userEarnings = totalEarnings * userRate;
    const tiptopRevenue = totalEarnings * commissionRate;

    // Update or insert earnings record
    const { data: existingEarning, error: fetchError } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('user_id', user_id)
      .eq('provider_name', 'SpotHero')
      .maybeSingle();

    if (fetchError) {
      console.error('[SpotHero] Error fetching existing earnings:', fetchError);
      throw fetchError;
    }

    if (existingEarning) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('affiliate_earnings')
        .update({
          earnings_amount: totalEarnings,
          user_earnings: userEarnings,
          tiptop_revenue: tiptopRevenue,
          commission_rate: commissionRate,
          status: 'active',
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEarning.id);

      if (updateError) {
        console.error('[SpotHero] Error updating earnings:', updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('affiliate_earnings')
        .insert({
          user_id,
          provider_name: 'SpotHero',
          earnings_amount: totalEarnings,
          user_earnings: userEarnings,
          tiptop_revenue: tiptopRevenue,
          commission_rate: commissionRate,
          status: 'active',
          is_verified: true,
        });

      if (insertError) {
        console.error('[SpotHero] Error inserting earnings:', insertError);
        throw insertError;
      }
    }

    console.log('[SpotHero] Successfully synced earnings:', {
      totalEarnings,
      userEarnings,
      tiptopRevenue,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          provider: 'SpotHero',
          total_earnings: totalEarnings,
          user_earnings: userEarnings,
          tiptop_revenue: tiptopRevenue,
          commission_rate: commissionRate,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SpotHero] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
