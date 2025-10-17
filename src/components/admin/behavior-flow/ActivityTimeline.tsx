import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const ActivityTimeline = () => {
  const { activityTimeline } = useBehaviorAnalytics(1);

  const formatHour = (hour: string) => {
    try {
      return format(new Date(hour), 'HH:mm');
    } catch {
      return hour;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Over Time</CardTitle>
        <CardDescription>Events grouped by hour</CardDescription>
      </CardHeader>
      <CardContent>
        {activityTimeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={formatHour}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={formatHour}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="page_view" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                name="Page Views"
              />
              <Line 
                type="monotone" 
                dataKey="click" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Clicks"
              />
              <Line 
                type="monotone" 
                dataKey="form_submit" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="Form Submits"
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
