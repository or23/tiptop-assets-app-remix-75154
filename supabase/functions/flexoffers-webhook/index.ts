
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Validate the security token (implement your security check here)
const validateSecurityToken = (token: string): boolean => {
  const validToken = Deno.env.get('FLEXOFFERS_WEBHOOK_SECRET')
  return token === validToken
}

// Find the user associated with the sub-affiliate ID
const findUserIdBySubAffiliateId = async (subAffiliateId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('flexoffers_user_mapping')
      .select('user_id')
      .eq('sub_affiliate_id', subAffiliateId)
      .single()
    
    if (error) {
      console.error('Error finding user by sub-affiliate ID:', error)
      return null
    }
    
    return data?.user_id || null
  } catch (err) {
    console.error('Exception finding user by sub-affiliate ID:', err)
    return null
  }
}

// Process the FlexOffers transaction and update earnings
const processFlexOffersTransaction = async (
  userId: string,
  transactionData: any
): Promise<boolean> => {
  try {
    // Extract transaction details
    const {
      transaction_id,
      program_name,
      commission,
      status,
      click_date,
      transaction_date,
    } = transactionData

    // Insert transaction record
    const { error: transactionError } = await supabase
      .from('flexoffers_transactions')
      .insert({
        user_id: userId,
        transaction_id,
        program_name,
        commission,
        status,
        click_date: click_date ? new Date(click_date) : null,
        transaction_date: new Date(transaction_date),
        payload: transactionData,
      })
      .select()
    
    if (transactionError) {
      if (transactionError.code === '23505') { // Unique violation
        console.log('Transaction already exists, skipping:', transaction_id)
        return true // Not an error, just a duplicate
      }
      
      console.error('Error inserting transaction:', transactionError)
      return false
    }
    
    // Update the affiliate_earnings table for the user
    const { data: existingEarnings, error: fetchError } = await supabase
      .from('affiliate_earnings')
      .select('earnings_amount')
      .eq('user_id', userId)
      .eq('provider_name', 'FlexOffers')
      .maybeSingle()
    
    if (fetchError && (fetchError as any).code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching existing earnings:', fetchError)
      return false
    }
    
    // Determine if we need to insert or update
    if (!existingEarnings) {
      // Insert new earnings record using current schema
      const { error: insertError } = await supabase
        .from('affiliate_earnings')
        .insert({
          user_id: userId,
          provider_name: 'FlexOffers',
          earnings_amount: parseFloat(commission),
          status: 'success',
          updated_at: new Date().toISOString(),
        })
      
      if (insertError) {
        console.error('Error inserting earnings:', insertError)
        return false
      }
    } else {
      // Update existing earnings
      const current = Number(existingEarnings.earnings_amount || 0)
      const newEarnings = current + parseFloat(commission)
      
      const { error: updateError } = await supabase
        .from('affiliate_earnings')
        .update({
          earnings_amount: newEarnings,
          status: 'success',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider_name', 'FlexOffers')
      
      if (updateError) {
        console.error('Error updating earnings:', updateError)
        return false
      }
    }
    
    return true
  } catch (err) {
    console.error('Exception processing transaction:', err)
    return false
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }
  
  // Log the incoming request for debugging
  console.log(`FlexOffers webhook received: ${req.method} ${req.url}`)
  
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Parse the request body
    const contentType = req.headers.get('content-type') || ''
    let payload: any
    
    if (contentType.includes('application/json')) {
      payload = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      
      // Convert form data to object
      payload = {}
      for (const [key, value] of formData.entries()) {
        payload[key] = value
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported content type' }),
        { 
          status: 415, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    console.log('Received payload:', payload)
    
    // Extract and validate security token
    const securityToken = payload.token || req.headers.get('x-flexoffers-token') || ''
    
    if (!validateSecurityToken(securityToken)) {
      console.error('Invalid security token provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Extract sub-affiliate ID from the payload
    const subAffiliateId = payload.sub_id || payload.sub_affiliate_id || ''
    
    if (!subAffiliateId) {
      console.error('No sub-affiliate ID provided in payload')
      return new Response(
        JSON.stringify({ error: 'Missing sub-affiliate ID' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Find the user associated with this sub-affiliate ID
    const userId = await findUserIdBySubAffiliateId(subAffiliateId)
    
    if (!userId) {
      console.error('No user found for sub-affiliate ID:', subAffiliateId)
      return new Response(
        JSON.stringify({ error: 'No user found for the provided sub-affiliate ID' }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Process the transaction
    const success = await processFlexOffersTransaction(userId, payload)
    
    if (success) {
      return new Response(
        JSON.stringify({ status: 'success', message: 'Transaction processed successfully' }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to process transaction' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
  } catch (err) {
    // Log the error for debugging
    console.error('Error processing webhook:', err)
    
    // Return a generic error response
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
