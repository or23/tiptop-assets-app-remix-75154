import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMinutes } from 'date-fns';

export const useActiveUsers = (minutesAgo: number = 5) => {
  return useQuery({
    queryKey: ['active-users', minutesAgo],
    queryFn: async () => {
      const cutoffTime = subMinutes(new Date(), minutesAgo);

      const { data, error } = await supabase
        .from('user_events')
        .select('session_id')
        .gte('timestamp', cutoffTime.toISOString());

      if (error) throw error;

      // Count unique sessions
      const uniqueSessions = new Set((data || []).map(event => event.session_id));
      return uniqueSessions.size;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
