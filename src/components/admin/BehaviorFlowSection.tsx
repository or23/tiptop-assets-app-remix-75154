import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';
import { ActiveUsersWidget } from './behavior-flow/ActiveUsersWidget';
import { LiveEventStream } from './behavior-flow/LiveEventStream';
import { TopActionsChart } from './behavior-flow/TopActionsChart';
import { PageFunnel } from './behavior-flow/PageFunnel';
import { ActivityTimeline } from './behavior-flow/ActivityTimeline';
import { UserJourneyFunnel } from './behavior-flow/UserJourneyFunnel';
import { Activity, MousePointerClick, TrendingUp } from 'lucide-react';

export const BehaviorFlowSection = () => {
  const { totalEvents, topActions } = useBehaviorAnalytics(1);

  const topAction = topActions[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveUsersWidget />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events tracked today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topAction?.count || 0}</div>
            <p className="text-xs text-muted-foreground truncate">
              {topAction?.target || 'No actions yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEvents > 0 ? Math.round(totalEvents / Math.max(1, topActions.length)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Events per action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Stream */}
      <LiveEventStream />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopActionsChart />
        <PageFunnel />
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline />

      {/* User Journey Funnel */}
      <UserJourneyFunnel />
    </div>
  );
};
