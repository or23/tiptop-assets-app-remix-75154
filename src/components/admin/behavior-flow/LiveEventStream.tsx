import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const eventTypeColors = {
  page_view: 'bg-blue-500',
  click: 'bg-green-500',
  form_submit: 'bg-purple-500',
  interaction: 'bg-orange-500',
};

const eventTypeLabels = {
  page_view: 'Page View',
  click: 'Click',
  form_submit: 'Form Submit',
  interaction: 'Interaction',
};

export const LiveEventStream = () => {
  const events = useLiveEvents(20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Event Stream
        </CardTitle>
        <CardDescription>Last 20 tracked events in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet. Events will appear here as users interact with the platform.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${eventTypeColors[event.event_type as keyof typeof eventTypeColors]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="font-medium truncate">{event.event_target}</div>
                    <div className="text-sm text-muted-foreground truncate">{event.page_url}</div>
                    {event.user_id && (
                      <div className="text-xs text-muted-foreground mt-1">
                        User: {event.user_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
