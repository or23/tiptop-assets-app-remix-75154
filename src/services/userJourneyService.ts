
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

// Generate a unique session ID for tracking
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID from localStorage
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('tiptop_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('tiptop_session_id', sessionId);
  }
  return sessionId;
};

// Initialize journey tracking when user enters the site
export const initializeJourney = async (referrer?: string, landingPage?: string) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'site_entry',
      p_data: {
        referrer: referrer || document.referrer,
        landing_page: landingPage || window.location.href,
        user_agent: navigator.userAgent
      }
    });

    if (error) {
      console.error('❌ Error initializing journey:', error);
      return null;
    }

    console.log('✅ Journey initialized for session:', sessionId);
    return data;
  } catch (error) {
    console.error('❌ Error in initializeJourney:', error);
    return null;
  }
};

// Track when user enters an address
export const trackAddressEntered = async (address: string, coordinates?: any) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'address_entered',
      p_data: {
        property_address: address,
        property_coordinates: coordinates
      }
    });

    if (error) {
      console.error('❌ Error tracking address entered:', error);
      return null;
    }

    console.log('✅ Address entered tracked:', address);
    return data;
  } catch (error) {
    console.error('❌ Error in trackAddressEntered:', error);
    return null;
  }
};

// Enhanced analysis tracking with proper user association and analysis ID linking
export const trackAnalysisCompleted = async (
  address: string,
  analysisResults: AnalysisResults,
  coordinates?: any,
  analysisId?: string
) => {
  const sessionId = getSessionId();
  
  console.log('📊 Tracking analysis completion for:', address);
  console.log('📈 Analysis results:', analysisResults);
  console.log('🔍 Analysis ID:', analysisId);
  
  // Enhanced data extraction from nested analysis results
  let totalMonthlyRevenue = 0;
  let totalOpportunities = 0;

  // More robust property address extraction
  const propertyAddress = (analysisResults as any).propertyAddress || 
                         (analysisResults as any).address || 
                         (analysisResults as any).property_address ||
                         address;

  // Enhanced calculation logic - try multiple data sources
  if (analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
    console.log('📊 Calculating from topOpportunities:', analysisResults.topOpportunities);
    totalMonthlyRevenue = analysisResults.topOpportunities.reduce(
      (sum, opp) => sum + (opp.monthlyRevenue || (opp as any).revenue || 0), 0
    );
    
    // Apartment-aware opportunities counting
    if ((analysisResults as any).propertyType === 'apartment') {
      let apartmentOpps = 0;
      if ((analysisResults.bandwidth?.revenue || (analysisResults.bandwidth as any)?.monthlyRevenue || 0) > 0) apartmentOpps++;
      if ((analysisResults.storage?.revenue || (analysisResults.storage as any)?.monthlyRevenue || 0) > 0) apartmentOpps++;
      totalOpportunities = apartmentOpps;
      console.log('🏢 Apartment opportunities calculated:', { bandwidth: analysisResults.bandwidth?.revenue, storage: analysisResults.storage?.revenue, totalOpportunities });
    } else {
      totalOpportunities = analysisResults.topOpportunities.length;
    }
  } else {
    console.log('📊 Fallback calculation from individual assets');
    // Enhanced fallback: calculate from all possible asset types and structures
    const assetRevenues = [
      analysisResults.rooftop?.revenue || (analysisResults.rooftop as any)?.monthlyRevenue || 0,
      analysisResults.parking?.revenue || (analysisResults.parking as any)?.monthlyRevenue || 0,
      analysisResults.garden?.revenue || (analysisResults.garden as any)?.monthlyRevenue || 0,
      analysisResults.pool?.revenue || (analysisResults.pool as any)?.monthlyRevenue || 0,
      analysisResults.storage?.revenue || (analysisResults.storage as any)?.monthlyRevenue || 0,
      analysisResults.bandwidth?.revenue || (analysisResults.bandwidth as any)?.monthlyRevenue || 0,
      (analysisResults as any).internet?.monthlyRevenue || (analysisResults as any).internet?.revenue || 0,
      (analysisResults as any).solar?.monthlyRevenue || (analysisResults as any).solar?.revenue || 0,
      (analysisResults as any).ev?.monthlyRevenue || (analysisResults as any).ev?.revenue || 0
    ];
    
    totalMonthlyRevenue = assetRevenues.reduce((sum, revenue) => sum + revenue, 0);
    
    // Apartment-aware opportunities counting in fallback too
    if ((analysisResults as any).propertyType === 'apartment') {
      let apartmentOpps = 0;
      if ((analysisResults.bandwidth?.revenue || (analysisResults.bandwidth as any)?.monthlyRevenue || 0) > 0) apartmentOpps++;
      if ((analysisResults.storage?.revenue || (analysisResults.storage as any)?.monthlyRevenue || 0) > 0) apartmentOpps++;
      totalOpportunities = apartmentOpps;
      console.log('🏢 Apartment opportunities calculated (fallback):', { bandwidth: analysisResults.bandwidth?.revenue, storage: analysisResults.storage?.revenue, totalOpportunities });
    } else {
      totalOpportunities = assetRevenues.filter(revenue => revenue > 0).length;
    }
  }

  // Use pre-calculated totals if available and higher
  if ((analysisResults as any).totalMonthlyRevenue && (analysisResults as any).totalMonthlyRevenue > totalMonthlyRevenue) {
    totalMonthlyRevenue = (analysisResults as any).totalMonthlyRevenue;
  }
  
  // Ensure we have meaningful totals
  if (totalMonthlyRevenue === 0 && (analysisResults as any).totalRevenue) {
    totalMonthlyRevenue = (analysisResults as any).totalRevenue;
  }

  console.log('💰 Calculated totals:', { totalMonthlyRevenue, totalOpportunities });
  
  try {
    // CRITICAL: Ensure analysis_id is properly passed to journey tracking
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'analysis_completed',
      p_data: {
        property_address: propertyAddress,
        property_coordinates: coordinates,
        analysis_results: analysisResults as any,
        analysis_id: analysisId, // This is crucial for linking
        total_monthly_revenue: totalMonthlyRevenue,
        total_opportunities: totalOpportunities
      }
    });

    if (error) {
      console.error('❌ Error tracking analysis completed:', error);
      
      // Store in localStorage as backup
      const backupData = {
        sessionId,
        address: propertyAddress,
        analysisResults,
        coordinates,
        analysisId,
        totalMonthlyRevenue,
        totalOpportunities,
        timestamp: new Date().toISOString()
      };
      
      const existingBackups = JSON.parse(localStorage.getItem('tiptop_analysis_backup') || '[]');
      existingBackups.push(backupData);
      localStorage.setItem('tiptop_analysis_backup', JSON.stringify(existingBackups));
      
      console.log('💾 Stored analysis as backup in localStorage');
      return null;
    }

    console.log('✅ Analysis completion tracked for:', propertyAddress);
    console.log('💰 Revenue tracked:', totalMonthlyRevenue);
    console.log('🎯 Opportunities tracked:', totalOpportunities);
    console.log('🆔 Analysis ID tracked:', analysisId);
    return data;
  } catch (error) {
    console.error('❌ Error in trackAnalysisCompleted:', error);
    return null;
  }
};

// Track lead capture
export const trackLeadCaptured = async (contact: string, contactType: 'email' | 'phone') => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'analysis_completed',
      p_data: {
        extra_form_data: {
          lead_contact: contact,
          lead_type: contactType,
          lead_captured_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('❌ Error tracking lead capture:', error);
      return null;
    }

    console.log('✅ Lead capture tracked:', { contactType });
    return data;
  } catch (error) {
    console.error('❌ Error in trackLeadCaptured:', error);
    return null;
  }
};

// Track when user views services
export const trackServicesViewed = async (viewedServices: string[]) => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'services_viewed',
      p_data: {
        interested_services: viewedServices
      }
    });

    if (error) {
      console.error('❌ Error tracking services viewed:', error);
      return null;
    }

    console.log('✅ Services viewed tracked:', viewedServices);
    return data;
  } catch (error) {
    console.error('❌ Error in trackServicesViewed:', error);
    return null;
  }
};

// Track when user selects an option (manual/concierge)
export const trackOptionSelected = async (selectedOption: 'manual' | 'concierge') => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'options_selected',
      p_data: {
        selected_option: selectedOption
      }
    });

    if (error) {
      console.error('❌ Error tracking option selected:', error);
      return null;
    }

    console.log('✅ Option selection tracked:', selectedOption);
    return data;
  } catch (error) {
    console.error('❌ Error in trackOptionSelected:', error);
    return null;
  }
};

// Safe auth completion tracking with session isolation to prevent cross-user leakage
export const trackAuthCompleted = async (userId: string) => {
  const currentSessionId = getSessionId();

  try {
    console.log('🔐 Starting safe auth completion tracking for user:', userId);

    // Check the existing journey for this session
    const { data: existingJourney, error: journeyErr } = await supabase
      .from('user_journey_complete')
      .select('id, user_id, analysis_id, property_address')
      .eq('session_id', currentSessionId)
      .maybeSingle();

    if (journeyErr) {
      console.warn('⚠️ Could not fetch existing journey for session:', journeyErr);
    }

    const hasAnalysisOrAddress = !!(existingJourney?.analysis_id || (existingJourney?.property_address && existingJourney.property_address.trim() !== ''));
    const linkedToAnotherUser = !!(existingJourney?.user_id && existingJourney.user_id !== userId);

    if (!existingJourney || (!hasAnalysisOrAddress && !linkedToAnotherUser)) {
      // Safe to link this clean session journey to the authenticated user
      const { error: linkError } = await supabase.rpc('link_journey_to_user', {
        p_session_id: currentSessionId,
        p_user_id: userId
      });

      if (linkError) {
        console.error('❌ Error linking journey to user:', linkError);
      } else {
        console.log('✅ Journey linked to authenticated user:', userId);
      }
    } else {
      // Session has prior analysis/address or is linked to another user → rotate session to isolate
      const newSessionId = generateSessionId();
      localStorage.setItem('tiptop_session_id', newSessionId);
      console.log('🔄 Rotated session ID on auth to prevent data leakage:', { newSessionId });

      // Start a fresh journey for this user
      const { error: initErr } = await supabase.rpc('update_journey_step', {
        p_session_id: newSessionId,
        p_step: 'auth_completed',
        p_data: {}
      });
      if (initErr) console.warn('⚠️ Could not initialize fresh journey after rotation:', initErr);

      // Explicitly link the fresh session to the user
      const { error: linkNewErr } = await supabase.rpc('link_journey_to_user', {
        p_session_id: newSessionId,
        p_user_id: userId
      });
      if (linkNewErr) console.warn('⚠️ Could not link fresh session to user:', linkNewErr);
    }

    // Link session asset selections to the authenticated user (anonymous_session_id flow)
    try {
      const { linkSessionToUser } = await import('./sessionStorageService');
      const linkedAssetCount = await linkSessionToUser(userId);
      console.log('✅ Linked', linkedAssetCount, 'asset selections to user:', userId);
    } catch (linkAssetError) {
      console.error('❌ Error linking asset selections to user:', linkAssetError);
    }

    // Link any analyses that are explicitly referenced in user's journey data
    try {
      const { data: linkedAnalysesCount, error: linkAnalysesError } = await supabase.rpc('link_user_analyses_from_journey', {
        p_user_id: userId
      });

      if (linkAnalysesError) {
        console.error('❌ Error linking analyses to user:', linkAnalysesError);
      } else {
        console.log('✅ Linked', linkedAnalysesCount, 'analyses to user from journey data:', userId);
      }
    } catch (linkAnalysesError) {
      console.error('❌ Error linking analyses to user:', linkAnalysesError);
    }

    // Check for and recover backup data from localStorage
    const backupData = localStorage.getItem('tiptop_analysis_backup');
    if (backupData) {
      try {
        const backups = JSON.parse(backupData);
        console.log('🔄 Found backup analysis data, attempting to recover:', backups.length, 'items');

        // Use the latest session id after potential rotation
        const effectiveSessionId = localStorage.getItem('tiptop_session_id') || currentSessionId;
        
        for (const backup of backups) {
          const targetSession = backup.sessionId || effectiveSessionId;
          const { error: backupError } = await supabase.rpc('update_journey_step', {
            p_session_id: targetSession,
            p_step: 'analysis_completed',
            p_data: {
              property_address: backup.address,
              property_coordinates: backup.coordinates,
              analysis_results: backup.analysisResults,
              analysis_id: backup.analysisId,
              total_monthly_revenue: backup.totalMonthlyRevenue,
              total_opportunities: backup.totalOpportunities
            }
          });

          if (!backupError) {
            await supabase.rpc('link_journey_to_user', {
              p_session_id: targetSession,
              p_user_id: userId
            });
            console.log('✅ Recovered backup analysis for:', backup.address);
          }
        }

        localStorage.removeItem('tiptop_analysis_backup');
        console.log('🧹 Cleared backup data after recovery');

      } catch (parseError) {
        console.warn('⚠️ Could not parse backup data:', parseError);
      }
    }

    // Return the active session id
    return localStorage.getItem('tiptop_session_id');
  } catch (error) {
    console.error('❌ Error in trackAuthCompleted:', error);
    return null;
  }
};

// Track when user accesses dashboard  
export const trackDashboardAccessed = async () => {
  const sessionId = getSessionId();
  
  try {
    const { data, error } = await supabase.rpc('update_journey_step', {
      p_session_id: sessionId,
      p_step: 'dashboard_accessed',
      p_data: {}
    });

    if (error) {
      console.error('❌ Error tracking dashboard accessed:', error);
      return null;
    }

    console.log('✅ Dashboard access tracked');
    return data;
  } catch (error) {
    console.error('❌ Error in trackDashboardAccessed:', error);
    return null;
  }
};

// Enhanced dashboard data retrieval with user-specific filtering
export const getUserDashboardData = async (userId: string) => {
  try {
    console.log('📊 Fetching dashboard data for user with enhanced recovery:', userId);
    
    // Strategy 1: Try the RPC function first (most reliable)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_dashboard_data', {
      p_user_id: userId
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      console.log('✅ Found data via RPC function:', rpcData[0]);
      return rpcData[0];
    }

    console.log('🔄 RPC returned no data, trying direct queries with user filter...');

    // Strategy 2: Direct query with strict user filtering
    const { data: directData, error: directError } = await supabase
      .from('user_journey_complete')
      .select('*')
      .eq('user_id', userId) // Strict user filtering
      .not('property_address', 'is', null)
      .not('property_address', 'eq', '')
      .not('analysis_results', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!directError && directData && directData.length > 0) {
      console.log('✅ Found data via direct query:', directData[0]);
      return formatJourneyData(directData[0]);
    }

    console.log('❌ No dashboard data found for user after enhanced strategies');
    return null;
    
  } catch (error) {
    console.error('❌ Error in getUserDashboardData:', error);
    return null;
  }
};

// Helper function to format journey data consistently
const formatJourneyData = (journey: any) => {
  return {
    journey_id: journey.id,
    analysis_id: journey.analysis_id || null,
    property_address: journey.property_address,
    analysis_results: journey.analysis_results,
    total_monthly_revenue: journey.total_monthly_revenue || 0,
    total_opportunities: journey.total_opportunities || 0,
    selected_services: journey.selected_services || [],
    selected_option: journey.selected_option || 'manual',
    journey_progress: {
      steps_completed: [],
      current_step: journey.current_step || 'analysis_completed',
      journey_start: journey.journey_start_at || journey.created_at,
      last_activity: journey.updated_at
    }
  };
};

// Clear session data (for testing or logout)
export const clearSession = () => {
  localStorage.removeItem('tiptop_session_id');
  console.log('✅ Session cleared');
};
