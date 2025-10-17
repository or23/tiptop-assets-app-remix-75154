import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveEvent {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: string;
  event_target: string;
  page_url: string;
  timestamp: string;
  metadata: any;
}

export const useLiveEvents = (limit: number = 20) => {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    // Fetch initial events
    const fetchInitialEvents = async () => {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching initial events:', error);
        return;
      }

      setEvents(data || []);
    };

    fetchInitialEvents();

    // Subscribe to new events
    const channel = supabase
      .channel('behavior-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_events',
        },
        (payload) => {
          console.log('🔴 New event received:', payload);
          setEvents((prev) => [payload.new as LiveEvent, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return events;
};
