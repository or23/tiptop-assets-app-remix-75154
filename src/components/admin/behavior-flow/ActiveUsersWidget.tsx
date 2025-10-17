import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { Users } from 'lucide-react';

export const ActiveUsersWidget = () => {
  const { data: activeUsers = 0 } = useActiveUsers(5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeUsers}</div>
        <p className="text-xs text-muted-foreground">
          Active in the last 5 minutes
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </CardContent>
    </Card>
  );
};
