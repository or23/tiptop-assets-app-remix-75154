import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export const useBehaviorAnalytics = (days: number = 1) => {
  const startDate = startOfDay(subDays(new Date(), days));
  const endDate = endOfDay(new Date());

  // Total events today
  const { data: totalEvents = 0 } = useQuery({
    queryKey: ['total-events', days],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  // Top actions
  const { data: topActions = [] } = useQuery({
    queryKey: ['top-actions', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_events')
        .select('event_target')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Count occurrences
      const counts = (data || []).reduce((acc, event) => {
        acc[event.event_target] = (acc[event.event_target] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort
      return Object.entries(counts)
        .map(([target, count]) => ({ target, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Activity timeline (events per hour)
  const { data: activityTimeline = [] } = useQuery({
    queryKey: ['activity-timeline', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_events')
        .select('timestamp, event_type')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Group by hour
      const hourlyData: Record<string, Record<string, number>> = {};
      
      (data || []).forEach((event) => {
        const hour = new Date(event.timestamp).toISOString().slice(0, 13) + ':00:00';
        if (!hourlyData[hour]) {
          hourlyData[hour] = { page_view: 0, click: 0, form_submit: 0, interaction: 0 };
        }
        hourlyData[hour][event.event_type]++;
      });

      return Object.entries(hourlyData).map(([hour, counts]) => ({
        hour,
        ...counts,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      }));
    },
  });

  // Page funnel (simplified)
  const { data: pageFunnel = [] } = useQuery({
    queryKey: ['page-funnel', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_events')
        .select('page_url, session_id')
        .eq('event_type', 'page_view')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Count unique sessions per page
      const pageSessions: Record<string, Set<string>> = {};
      
      (data || []).forEach((event) => {
        if (!pageSessions[event.page_url]) {
          pageSessions[event.page_url] = new Set();
        }
        pageSessions[event.page_url].add(event.session_id);
      });

      return Object.entries(pageSessions)
        .map(([page, sessions]) => ({
          page,
          sessions: sessions.size,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);
    },
  });

  return {
    totalEvents,
    topActions,
    activityTimeline,
    pageFunnel,
  };
};
