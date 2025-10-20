import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Lead {
  id: string;
  email?: string;
  phone?: string;
  source: string;
  metadata: {
    session_id?: string;
    property_address?: string;
    referrer?: string;
    user_agent?: string;
  };
  created_at: string;
  updated_at: string;
}

export const LeadsSection = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    emailLeads: 0,
    phoneLeads: 0,
    landingPageLeads: 0
  });

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Fetch all leads from the leads table (includes both landing page and post-analysis)
        const { data, error } = await (supabase as any)
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const allLeads = data || [];
        setLeads(allLeads);

        // Calculate stats from combined sources
        const emailCount = allLeads.filter((l: Lead) => l.email).length;
        const phoneCount = allLeads.filter((l: Lead) => l.phone).length;
        const landingPageCount = allLeads.filter((l: Lead) => l.source === 'landing_page').length;
        const postAnalysisCount = allLeads.filter((l: Lead) => l.source === 'homeowner_b').length;

        setStats({
          totalLeads: allLeads.length,
          emailLeads: emailCount,
          phoneLeads: phoneCount,
          landingPageLeads: landingPageCount
        });

        console.log('📊 Leads Stats:', {
          total: allLeads.length,
          landingPage: landingPageCount,
          postAnalysis: postAnalysisCount,
          email: emailCount,
          phone: phoneCount
        });

      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getContactInfo = (lead: Lead) => {
    if (lead.email) {
      return { type: 'email', value: lead.email };
    }
    if (lead.phone) {
      return { type: 'phone', value: lead.phone };
    }
    return null;
  };

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      'landing_page': { label: 'Landing Page', variant: 'default' },
      'homeowner_b': { label: 'Post-Analysis', variant: 'secondary' },
    };
    return badges[source] || { label: source, variant: 'outline' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Captured contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Leads</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailLeads}</div>
            <p className="text-xs text-muted-foreground">
              Email addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Leads</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.phoneLeads}</div>
            <p className="text-xs text-muted-foreground">
              Phone numbers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Landing Page</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.landingPageLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? `${Math.round((stats.landingPageLeads / stats.totalLeads) * 100)}% from landing` : 'No landing page leads'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Captured Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No leads captured yet
            </p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const contactInfo = getContactInfo(lead);
                const sourceBadge = getSourceBadge(lead.source);
                
                return (
                  <div 
                    key={lead.id}
                    className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {contactInfo?.type === 'email' ? (
                          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                        ) : (
                          <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {contactInfo?.value}
                          </p>
                          {lead.metadata?.property_address && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {lead.metadata.property_address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(lead.created_at), 'MMM d, HH:mm')}
                        </div>
                        <Badge variant={sourceBadge.variant}>
                          {sourceBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8">
                      {lead.metadata?.referrer && lead.metadata.referrer !== 'direct' && (
                        <span>Referrer: {lead.metadata.referrer}</span>
                      )}
                      {lead.metadata?.session_id && (
                        <span>Session: {lead.metadata.session_id.substring(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
