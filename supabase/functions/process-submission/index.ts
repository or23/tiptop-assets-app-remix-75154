
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const NEIGHBOR_API_KEY = Deno.env.get('NEIGHBOR_API_KEY') || '';
const HONEYGAIN_USERNAME = Deno.env.get('HONEYGAIN_USERNAME') || '';
const SWIMPLY_REF = Deno.env.get('SWIMPLY_REF') || '';

interface PropertySubmission {
  full_name: string;
  email: string;
  property_address: string;
  has_garage: boolean;
  has_pool: boolean;
  has_driveway: boolean;
  has_internet: boolean;
  additional_info?: string;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  services: {
    neighbor: { sent: boolean; message?: string; error?: string };
    honeygain: { sent: boolean; referralLink?: string; error?: string };
    swimply: { sent: boolean; referralLink?: string; error?: string };
  };
  estimatedEarnings: number;
  bundle: BundleResult;
}

interface ServiceInfo {
  name: string;
  description: string;
  estimated_monthly: string;
  integration: string;
  confidence: number;
}

interface BundleResult {
  bundle_name: string;
  services: ServiceInfo[];
  estimated_total_monthly: string;
}

// Calculate estimated earnings based on property features
function calculateEstimatedEarnings(submission: PropertySubmission): number {
  let total = 0;
  
  // Basic estimates for different asset types
  if (submission.has_garage || submission.has_driveway) {
    total += 200; // $200/month for garage/driveway space
  }
  
  if (submission.has_pool) {
    total += 250; // $250/month for pool rental
  }
  
  if (submission.has_internet) {
    total += 50; // $50/month for internet sharing
  }
  
  return total;
}

// Generate a personalized bundle based on property features
function generateBundle(submission: PropertySubmission): BundleResult {
  const services: ServiceInfo[] = [];
  let totalEarnings = 0;
  let bundleName = "Custom Income Bundle";
  
  // Add Neighbor if has garage or driveway
  if (submission.has_garage || submission.has_driveway) {
    const monthlyEarning = submission.has_garage ? 200 : 150;
    totalEarnings += monthlyEarning;
    services.push({
      name: "Neighbor",
      description: "Rent your garage or driveway for storage or parking.",
      estimated_monthly: `$${monthlyEarning}`,
      integration: "API",
      confidence: 95
    });
  }
  
  // Add Honeygain if has internet
  if (submission.has_internet) {
    const monthlyEarning = 30;
    totalEarnings += monthlyEarning;
    services.push({
      name: "Honeygain",
      description: "Earn by sharing your unused internet bandwidth.",
      estimated_monthly: `$${monthlyEarning}`,
      integration: "Referral",
      confidence: 85
    });
  }
  
  // Add Swimply if has pool
  if (submission.has_pool) {
    const monthlyEarning = 250;
    totalEarnings += monthlyEarning;
    services.push({
      name: "Swimply",
      description: "List your backyard pool for hourly rentals.",
      estimated_monthly: `$${monthlyEarning}`,
      integration: "iframe",
      confidence: 88
    });
  }
  
  // Create appropriate bundle name based on services
  if (services.length >= 3) {
    bundleName = "Ultimate Passive Income Bundle";
  } else if (services.length === 2) {
    bundleName = "Dual Income Stream";
  } else if (services.length === 1) {
    bundleName = `${services[0].name} Income Plan`;
  } else {
    bundleName = "Custom Property Analysis";
  }
  
  return {
    bundle_name: bundleName,
    services,
    estimated_total_monthly: `$${totalEarnings}`
  };
}

// Call the Neighbor API to submit a lead
async function submitToNeighbor(submission: PropertySubmission): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!NEIGHBOR_API_KEY) {
    return { success: false, error: "API key not configured" };
  }
  
  if (!(submission.has_garage || submission.has_driveway)) {
    return { success: false, message: "Property doesn't qualify for Neighbor" };
  }
  
  try {
    const response = await fetch("https://api.neighbor.com/leads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEIGHBOR_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: submission.full_name,
        email: submission.email,
        address: submission.property_address,
        lead_source: "TipTop"
      })
    });
    
    if (response.ok) {
      return { success: true, message: "Lead submitted to Neighbor" };
    } else {
      const errorText = await response.text();
      console.error("Neighbor API error:", errorText);
      return { 
        success: false, 
        error: `API error: ${response.status}`,
        message: "We couldn't submit your information to Neighbor at this time." 
      };
    }
    } catch (error) {
      console.error("Error submitting to Neighbor:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "An error occurred while submitting to Neighbor" 
      };
    }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const submission: PropertySubmission = await req.json();
    
    // Create Supabase client to store submission
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Calculate estimated earnings
    const estimatedEarnings = calculateEstimatedEarnings(submission);
    
    // Generate personalized bundle
    const bundle = generateBundle(submission);
    
    // Track API responses
    const result: SubmissionResult = {
      success: true,
      message: "Property submission processed",
      services: {
        neighbor: { sent: false },
        honeygain: { sent: false },
        swimply: { sent: false }
      },
      estimatedEarnings,
      bundle
    };
    
    // Process Neighbor submission if the property qualifies
    if (submission.has_garage || submission.has_driveway) {
      const neighborResult = await submitToNeighbor(submission);
      result.services.neighbor = {
        ...neighborResult,
        sent: neighborResult.success
      };
    }
    
    // Generate Honeygain referral link if internet sharing is available
    if (submission.has_internet && HONEYGAIN_USERNAME) {
      result.services.honeygain = {
        sent: true,
        referralLink: `https://dashboard.honeygain.com/ref/${HONEYGAIN_USERNAME}`
      };
    }
    
    // Generate Swimply referral if the property has a pool
    if (submission.has_pool && SWIMPLY_REF) {
      result.services.swimply = {
        sent: true,
        referralLink: `https://swimply.com/signup?ref=${SWIMPLY_REF}`
      };
    }
    
    // Store the submission in Supabase
    const { error } = await supabase
      .from('property_submissions')
      .insert({
        full_name: submission.full_name,
        email: submission.email,
        property_address: submission.property_address,
        has_garage: submission.has_garage,
        has_pool: submission.has_pool,
        has_driveway: submission.has_driveway,
        has_internet: submission.has_internet,
        additional_info: submission.additional_info,
        estimated_earnings: estimatedEarnings,
        sent_to_neighbor: result.services.neighbor.sent,
        sent_to_honeygain: result.services.honeygain.sent,
        sent_to_swimply: result.services.swimply.sent
      });
    
    if (error) {
      console.error("Error storing submission:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to store submission",
          error: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Error processing submission",
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
