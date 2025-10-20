import { supabase } from '@/integrations/supabase/client';

// Generate a unique visitor ID
const generateVisitorId = (): string => {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Get or create visitor session ID
export const getVisitorSessionId = (): string => {
  let sessionId = localStorage.getItem('visitor_session_id');
  
  if (!sessionId) {
    sessionId = generateVisitorId();
    localStorage.setItem('visitor_session_id', sessionId);
    localStorage.setItem('visitor_first_seen', new Date().toISOString());
  }
  
  return sessionId;
};

// Track visitor page view
export const trackVisitorPageView = async (page: string) => {
  try {
    const sessionId = getVisitorSessionId();
    const referrer = document.referrer || 'direct';
    const userAgent = navigator.userAgent;
    
    // Check if visitor session exists
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('id, started_at')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (existingSession) {
      // Update existing session
      await supabase
        .from('visitor_sessions')
        .update({
          landing_page: page,
          updated_at: new Date().toISOString(),
          total_time_seconds: Math.floor(
            (new Date().getTime() - new Date(existingSession.started_at).getTime()) / 1000
          )
        })
        .eq('session_id', sessionId);
    } else {
      // Create new session
      await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          landing_page: page,
          referrer: referrer,
          user_agent: userAgent,
          current_step: 'landing',
          started_at: new Date().toISOString(),
          total_time_seconds: 0
        });
    }
    
    console.log('Visitor page view tracked:', { sessionId, page });
  } catch (error) {
    console.error('Error tracking visitor page view:', error);
  }
};

// Track visitor conversion (when they sign up)
export const trackVisitorConversion = async (userId: string, conversionType: string) => {
  try {
    const sessionId = getVisitorSessionId();
    
    await supabase
      .from('visitor_sessions')
      .update({
        user_id: userId,
        conversion_type: conversionType,
        completed_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
    
    console.log('Visitor conversion tracked:', { sessionId, userId, conversionType });
  } catch (error) {
    console.error('Error tracking visitor conversion:', error);
  }
};

// Get visitor analytics
export const getVisitorAnalytics = async () => {
  try {
    const { data: sessions, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalVisitors = sessions?.length || 0;
    const uniqueVisitors = new Set(sessions?.map(s => s.session_id)).size;
    const todayVisitors = sessions?.filter(s => 
      new Date(s.started_at) >= today
    ).length || 0;
    
    const returningVisitors = sessions?.filter(s => {
      const sessionCount = sessions.filter(sess => 
        sess.session_id === s.session_id
      ).length;
      return sessionCount > 1;
    }).length || 0;
    
    const conversions = sessions?.filter(s => s.user_id).length || 0;
    const conversionRate = totalVisitors > 0 
      ? ((conversions / totalVisitors) * 100).toFixed(1)
      : '0';
    
    const avgTimeOnSite = sessions && sessions.length > 0
      ? Math.floor(
          sessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0) / sessions.length
        )
      : 0;
    
    return {
      totalVisitors,
      uniqueVisitors,
      todayVisitors,
      returningVisitors,
      conversions,
      conversionRate,
      avgTimeOnSite,
      recentSessions: sessions || []
    };
  } catch (error) {
    console.error('Error getting visitor analytics:', error);
    return null;
  }
};

// Save lead contact information
export const saveLeadContact = async (
  contact: string,
  contactType: 'email' | 'phone'
) => {
  try {
    const sessionId = getVisitorSessionId();
    
    const leadData = {
      lead_captured_at: new Date().toISOString(),
      lead_type: contactType,
      ...(contactType === 'email' ? { lead_email: contact } : { lead_phone: contact })
    };
    
    // Update visitor session with lead data in extra_data
    const { error } = await supabase
      .from('visitor_sessions')
      .update({
        extra_data: leadData,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
    
    if (error) throw error;
    
    console.log('Lead contact saved:', { sessionId, contactType });
    return true;
  } catch (error) {
    console.error('Error saving lead contact:', error);
    throw error;
  }
};

// Update visitor session time
export const updateVisitorSessionTime = async () => {
  try {
    const sessionId = getVisitorSessionId();
    const firstSeen = localStorage.getItem('visitor_first_seen');
    
    if (!firstSeen) return;
    
    const totalTimeSeconds = Math.floor(
      (new Date().getTime() - new Date(firstSeen).getTime()) / 1000
    );
    
    await supabase
      .from('visitor_sessions')
      .update({
        total_time_seconds: totalTimeSeconds,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error updating visitor session time:', error);
  }
};

// Clear visitor session (on logout or new session)
export const clearVisitorSession = () => {
  localStorage.removeItem('visitor_session_id');
  localStorage.removeItem('visitor_first_seen');
};
