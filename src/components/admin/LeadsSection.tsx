import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { LeadCRM } from './LeadCRM';

interface UnifiedLead {
  id: string;
  contactType: 'email' | 'phone';
  contactValue: string;
  source: 'post_analysis' | 'homeowner_b';
  propertyAddress?: string;
  capturedAt: string;
  landingPage?: string;
  referrer?: string;
  userId?: string | null;
  sessionId?: string;
}

export const LeadsSection = () => {
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    emailLeads: 0,
    phoneLeads: 0,
    landingPageLeads: 0
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch post-analysis leads from visitor_sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('visitor_sessions')
        .select('*')
        .not('extra_data', 'is', null)
        .order('started_at', { ascending: false });

      if (sessionError) throw sessionError;

      // Transform post-analysis leads
      const postAnalysisLeads: UnifiedLead[] = (sessionData || [])
        .filter(session => {
          const extraData = session.extra_data as any;
          return extraData?.lead_email || extraData?.lead_phone;
        })
        .map(session => {
          const extraData = session.extra_data as any;
          const isEmail = !!extraData.lead_email;
          
          return {
            id: `session-${session.id}`,
            contactType: isEmail ? 'email' as const : 'phone' as const,
            contactValue: isEmail ? extraData.lead_email : extraData.lead_phone,
            source: 'post_analysis' as const,
            propertyAddress: session.property_address || undefined,
            capturedAt: extraData.lead_captured_at || session.started_at,
            landingPage: session.landing_page || undefined,
            referrer: session.referrer || undefined,
            userId: session.user_id,
            sessionId: session.session_id
          };
        });

      // Fetch landing page leads from leads table
      const { data: landingPageData, error: landingPageError } = await (supabase as any)
        .from('leads')
        .select('id, email, phone, source, metadata, created_at')
        .eq('source', 'homeowner_b')
        .order('created_at', { ascending: false });

      if (landingPageError) throw landingPageError;

      // Transform landing page leads
      const landingPageLeads: UnifiedLead[] = (landingPageData || [])
        .filter((lead: any) => lead.email || lead.phone)
        .map((lead: any) => {
          const isEmail = !!lead.email;
          const metadata = (lead.metadata as any) || {};
          
          return {
            id: `landing-${lead.id}`,
            contactType: isEmail ? 'email' as const : 'phone' as const,
            contactValue: isEmail ? lead.email : lead.phone,
            source: 'homeowner_b' as const,
            propertyAddress: metadata.property_address || undefined,
            capturedAt: lead.created_at,
            landingPage: metadata.landing_page || undefined,
            referrer: metadata.referrer || undefined,
            userId: null
          };
        });

      // Combine and sort by captured date
      const allLeads = [...postAnalysisLeads, ...landingPageLeads]
        .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());

      setLeads(allLeads);

      // Calculate combined stats
      const emailCount = allLeads.filter(l => l.contactType === 'email').length;
      const phoneCount = allLeads.filter(l => l.contactType === 'phone').length;
      const landingPageCount = allLeads.filter(l => l.source === 'homeowner_b').length;

      setStats({
        totalLeads: allLeads.length,
        emailLeads: emailCount,
        phoneLeads: phoneCount,
        landingPageLeads: landingPageCount
      });

    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

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

  const getSourceBadge = (source: 'post_analysis' | 'homeowner_b') => {
    if (source === 'homeowner_b') {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Landing Page
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Post-Analysis
      </Badge>
    );
  };

  // Transform leads for CRM
  const crmLeads = leads.map(lead => ({
    id: lead.id,
    email: lead.contactType === 'email' ? lead.contactValue : undefined,
    phone: lead.contactType === 'phone' ? lead.contactValue : undefined,
    source: lead.source,
    status: 'new',
    propertyAddress: lead.propertyAddress,
    createdAt: lead.capturedAt,
  }));

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
            <CardTitle className="text-sm font-medium">Landing Page Leads</CardTitle>
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

      {/* Leads Management */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crm" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crm">CRM View</TabsTrigger>
              <TabsTrigger value="list">List View ({leads.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crm" className="mt-4">
              <LeadCRM leads={crmLeads} onLeadUpdate={fetchLeads} />
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No leads captured yet
                </p>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div 
                      key={lead.id}
                      className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {lead.contactType === 'email' ? (
                            <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                          ) : (
                            <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {lead.contactValue}
                              </p>
                              {getSourceBadge(lead.source)}
                            </div>
                            {lead.propertyAddress && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  {lead.propertyAddress}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(lead.capturedAt), 'MMM d, HH:mm')}
                          </div>
                          {lead.userId && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Converted
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8">
                        {lead.landingPage && (
                          <span>Landing: {lead.landingPage}</span>
                        )}
                        {lead.referrer && lead.referrer !== 'direct' && (
                          <span>Referrer: {lead.referrer}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};