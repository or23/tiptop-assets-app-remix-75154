import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PageFunnel = () => {
  const { pageFunnel } = useBehaviorAnalytics(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page View Funnel</CardTitle>
        <CardDescription>Unique sessions per page</CardDescription>
      </CardHeader>
      <CardContent>
        {pageFunnel.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No page views tracked yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="page" 
                type="category" 
                width={150}
              />
              <Tooltip />
              <Bar dataKey="sessions" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
