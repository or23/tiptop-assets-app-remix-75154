import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TopActionsChart = () => {
  const { topActions } = useBehaviorAnalytics(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Actions Today</CardTitle>
        <CardDescription>Most clicked buttons and interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {topActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No actions tracked yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topActions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="target" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
