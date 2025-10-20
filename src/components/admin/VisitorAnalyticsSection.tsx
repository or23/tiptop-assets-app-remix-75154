import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, TrendingUp, Clock, MousePointer } from 'lucide-react';
import { getVisitorAnalytics } from '@/services/visitorTrackingService';
import { format } from 'date-fns';

export const VisitorAnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const data = await getVisitorAnalytics();
      setAnalytics(data);
      setLoading(false);
    };

    fetchAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.uniqueVisitors} unique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active sessions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conversions} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time on Site</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics.avgTimeOnSite)}</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Visitors</span>
                <span className="font-medium">
                  {analytics.totalVisitors - analytics.returningVisitors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Returning Visitors</span>
                <span className="font-medium">{analytics.returningVisitors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Converted to Users</span>
                <span className="font-medium text-green-600">{analytics.conversions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Direct Traffic</span>
                <span className="font-medium">
                  {analytics.recentSessions.filter((s: any) => s.referrer === 'direct').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Referral Traffic</span>
                <span className="font-medium">
                  {analytics.recentSessions.filter((s: any) => s.referrer !== 'direct').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Session Duration</span>
                <span className="font-medium">{formatTime(analytics.avgTimeOnSite)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visitor Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visitor Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visitor sessions yet</p>
            ) : (
              analytics.recentSessions.map((session: any) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${session.user_id ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {session.landing_page || 'Home'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.referrer === 'direct' ? 'Direct visit' : `From: ${session.referrer}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {format(new Date(session.started_at), 'MMM d, HH:mm')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user_id ? (
                        <span className="text-green-600">Converted</span>
                      ) : (
                        `${formatTime(session.total_time_seconds || 0)}`
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
