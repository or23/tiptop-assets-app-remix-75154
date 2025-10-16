import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueByProvider {
  provider_name: string;
  active_users: number;
  total_transactions: number;
  total_user_earnings: number;
  total_tiptop_revenue: number;
  total_gross_revenue: number;
  avg_commission_rate: number;
  last_transaction: string;
  has_api: boolean;
  payment_model: string;
}

interface RevenueTimeline {
  date: string;
  provider_name: string;
  daily_tiptop_revenue: number;
  daily_user_earnings: number;
  active_users: number;
  transactions: number;
}

export const AdminRevenueSection = () => {
  const [revenueByProvider, setRevenueByProvider] = useState<RevenueByProvider[]>([]);
  const [revenueTimeline, setRevenueTimeline] = useState<RevenueTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUserEarnings, setTotalUserEarnings] = useState(0);

  useEffect(() => {
    fetchRevenueData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRevenueData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRevenueData = async () => {
    try {
      // Refresh materialized views first
      await supabase.rpc('refresh_admin_revenue_views');

      // Fetch revenue by provider
      const { data: providerData, error: providerError } = await supabase
        .from('admin_revenue_by_provider')
        .select('*');

      if (providerError) throw providerError;

      // Fetch revenue timeline
      const { data: timelineData, error: timelineError } = await supabase
        .from('admin_revenue_timeline')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (timelineError) throw timelineError;

      setRevenueByProvider(providerData || []);
      setRevenueTimeline(timelineData || []);

      // Calculate totals
      const totalTiptopRevenue = (providerData || []).reduce(
        (sum, p) => sum + Number(p.total_tiptop_revenue), 
        0
      );
      const totalUserEarningsSum = (providerData || []).reduce(
        (sum, p) => sum + Number(p.total_user_earnings), 
        0
      );

      setTotalRevenue(totalTiptopRevenue);
      setTotalUserEarnings(totalUserEarningsSum);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data (last 30 days aggregated)
  const chartData = revenueTimeline.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date);
    if (existing) {
      existing.revenue += Number(item.daily_tiptop_revenue);
      existing.user_earnings += Number(item.daily_user_earnings);
    } else {
      acc.push({
        date: item.date,
        revenue: Number(item.daily_tiptop_revenue),
        user_earnings: Number(item.daily_user_earnings),
      });
    }
    return acc;
  }, [] as Array<{ date: string; revenue: number; user_earnings: number }>)
  .reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TipTop Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total platform commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalUserEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total paid to users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue + totalUserEarnings).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross merchandise value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                name="TipTop Revenue"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="user_earnings" 
                stroke="hsl(var(--secondary))" 
                name="User Earnings"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Provider Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>API</TableHead>
                <TableHead className="text-right">Active Users</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">User Earnings</TableHead>
                <TableHead className="text-right">TipTop Revenue</TableHead>
                <TableHead className="text-right">Commission %</TableHead>
                <TableHead className="text-right">Total GMV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueByProvider.map((provider) => (
                <TableRow key={provider.provider_name}>
                  <TableCell className="font-medium">{provider.provider_name}</TableCell>
                  <TableCell>
                    {provider.has_api ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        API
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Manual
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{provider.active_users}</TableCell>
                  <TableCell className="text-right">{provider.total_transactions}</TableCell>
                  <TableCell className="text-right">
                    ${Number(provider.total_user_earnings).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${Number(provider.total_tiptop_revenue).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(Number(provider.avg_commission_rate) * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(provider.total_gross_revenue).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
