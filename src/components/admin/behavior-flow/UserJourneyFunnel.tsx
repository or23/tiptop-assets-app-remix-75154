import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight } from 'lucide-react';
import { subDays } from 'date-fns';

interface JourneyStep {
  name: string;
  path: string;
  users: number;
  color: string;
}

export const UserJourneyFunnel = () => {
  const { data: journeySteps = [], isLoading } = useQuery({
    queryKey: ['user-journey-funnel'],
    queryFn: async () => {
      const startDate = subDays(new Date(), 7); // Last 7 days

      // Define the journey steps we want to track
      const steps = [
        { name: 'Homepage', path: '/', color: 'bg-blue-500' },
        { name: 'Enter Address', path: '/new-address', color: 'bg-green-500' },
        { name: 'Selected Assets', path: '/options', color: 'bg-purple-500' },
        { name: 'Sign In', path: '/auth', color: 'bg-orange-500' },
        { name: 'Dashboard', path: '/dashboard', color: 'bg-pink-500' },
        { name: 'Integrated Services', path: '/dashboard/onboarding', color: 'bg-indigo-500' },
      ];

      // Fetch unique users for each step
      const { data, error } = await supabase
        .from('user_events')
        .select('page_url, session_id')
        .eq('event_type', 'page_view')
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Count unique sessions per page
      const stepsWithCounts: JourneyStep[] = steps.map(step => {
        const uniqueSessions = new Set(
          (data || [])
            .filter(event => event.page_url === step.path)
            .map(event => event.session_id)
        );
        
        return {
          ...step,
          users: uniqueSessions.size,
        };
      });

      return stepsWithCounts;
    },
  });

  const maxUsers = Math.max(...journeySteps.map(s => s.users), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Journey Funnel</CardTitle>
        <CardDescription>User progression through key pages (last 7 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading journey data...</div>
        ) : journeySteps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No journey data available yet.</div>
        ) : (
          <div className="space-y-4">
            {journeySteps.map((step, index) => {
              const percentage = (step.users / maxUsers) * 100;
              const dropoffRate = index > 0 
                ? ((journeySteps[index - 1].users - step.users) / journeySteps[index - 1].users * 100)
                : 0;

              return (
                <div key={step.path} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <div className={`w-3 h-3 rounded-full ${step.color}`} />
                      <span className="font-medium text-sm">{step.name}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1">
                      <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${step.color} opacity-70 transition-all duration-500 flex items-center justify-end px-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-white font-bold text-sm">
                            {step.users}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Percentage */}
                    <div className="min-w-[60px] text-right">
                      <span className="text-sm font-medium">
                        {((step.users / (journeySteps[0]?.users || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Dropoff indicator */}
                  {index > 0 && dropoffRate > 0 && (
                    <div className="flex items-center gap-2 ml-[215px] text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">
                        {dropoffRate.toFixed(1)}% drop-off from previous step
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {journeySteps[0]?.users || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Started Journey</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {journeySteps[journeySteps.length - 1]?.users || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed Journey</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {journeySteps[0]?.users > 0
                      ? ((journeySteps[journeySteps.length - 1]?.users / journeySteps[0].users) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
