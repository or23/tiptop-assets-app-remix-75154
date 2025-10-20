import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Lead {
  id: string;
  session_id: string;
  extra_data: any;
  property_address: string | null;
  landing_page: string | null;
  referrer: string | null;
  started_at: string;
  user_id: string | null;
}

export const LeadsSection = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    emailLeads: 0,
    phoneLeads: 0,
    convertedLeads: 0
  });

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Fetch all visitor sessions that have lead data
        const { data, error } = await supabase
          .from('visitor_sessions')
          .select('*')
          .not('extra_data', 'is', null)
          .order('started_at', { ascending: false });

        if (error) throw error;

        // Filter sessions that actually have lead contact info
        const leadsWithContact = (data || []).filter(session => {
          const extraData = session.extra_data as any;
          return extraData?.lead_email || extraData?.lead_phone;
        });

        setLeads(leadsWithContact);

        // Calculate stats
        const emailCount = leadsWithContact.filter(l => {
          const extraData = l.extra_data as any;
          return extraData?.lead_email;
        }).length;

        const phoneCount = leadsWithContact.filter(l => {
          const extraData = l.extra_data as any;
          return extraData?.lead_phone;
        }).length;

        const convertedCount = leadsWithContact.filter(l => l.user_id).length;

        setStats({
          totalLeads: leadsWithContact.length,
          emailLeads: emailCount,
          phoneLeads: phoneCount,
          convertedLeads: convertedCount
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
    const extraData = lead.extra_data as any;
    if (extraData?.lead_email) {
      return { type: 'email', value: extraData.lead_email };
    }
    if (extraData?.lead_phone) {
      return { type: 'phone', value: extraData.lead_phone };
    }
    return null;
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
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? `${Math.round((stats.convertedLeads / stats.totalLeads) * 100)}% conversion` : 'No conversions yet'}
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
                const extraData = lead.extra_data as any;
                
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
                          {lead.property_address && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {lead.property_address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(extraData.lead_captured_at || lead.started_at), 'MMM d, HH:mm')}
                        </div>
                        {lead.user_id && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Converted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8">
                      {lead.landing_page && (
                        <span>Landing: {lead.landing_page}</span>
                      )}
                      {lead.referrer && lead.referrer !== 'direct' && (
                        <span>Source: {lead.referrer}</span>
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
