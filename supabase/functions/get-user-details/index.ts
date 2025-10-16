import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: user, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { userIds } = await req.json()

    if (!userIds || !Array.isArray(userIds)) {
      return new Response(JSON.stringify({ error: 'Invalid user IDs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user details from auth.users
    const userDetails = []
    
    for (const userId of userIds) {
      try {
        const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId)
        
        if (!error && authUser?.user) {
          const user = authUser.user
          userDetails.push({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  (user.user_metadata?.first_name && user.user_metadata?.last_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` 
                    : null),
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            avatar_url: user.user_metadata?.avatar_url,
            provider: user.app_metadata?.provider,
            created_at: user.created_at
          })
        }
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err)
      }
    }

    return new Response(JSON.stringify({ users: userDetails }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in get-user-details function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})