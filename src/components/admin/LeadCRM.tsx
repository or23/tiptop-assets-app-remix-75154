import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, MessageSquare, FileText, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateLeadPropertyReport, ReportData } from '@/utils/leadReportGenerator';

interface Lead {
  id: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  propertyAddress?: string;
  createdAt: string;
  contactedAt?: string;
  reportSentAt?: string;
  lastContactAt?: string;
  notes?: string;
  communicationHistory?: any[];
}

interface LeadCRMProps {
  leads: Lead[];
  onLeadUpdate: () => void;
}

export const LeadCRM = ({ leads, onLeadUpdate }: LeadCRMProps) => {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionType, setActionType] = useState<'email' | 'sms' | 'report' | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = (lead: Lead, action: 'email' | 'sms' | 'report') => {
    setSelectedLead(lead);
    setActionType(action);
    setCustomMessage('');
    setNotes(lead.notes || '');
    setNewStatus(lead.status);
  };

  const handleSendEmail = async () => {
    if (!selectedLead?.email) return;
    
    setLoading(true);
    try {
      // Generate PDF report
      const reportData: ReportData = {
        propertyAddress: selectedLead.propertyAddress || 'Address not available',
        ownerName: selectedLead.email.split('@')[0],
        totalMonthlyRevenue: 0, // TODO: Fetch from analysis
        totalOpportunities: 0,
        assets: [],
        analysisDate: new Date()
      };

      const pdfBlob = generateLeadPropertyReport(reportData);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('send-lead-email', {
          body: {
            leadId: selectedLead.id,
            email: selectedLead.email,
            ownerName: reportData.ownerName,
            propertyAddress: reportData.propertyAddress,
            pdfBlob: base64data.split(',')[1],
            customMessage
          }
        });

        if (error) throw error;

        // Update lead status
        await supabase
          .from('leads')
          .update({
            status: 'report_sent',
            report_sent_at: new Date().toISOString(),
            last_contact_at: new Date().toISOString(),
            contact_method: 'email',
            notes
          })
          .eq('id', selectedLead.id);

        // Add to communication history
        await supabase.rpc('add_lead_communication', {
          p_lead_id: selectedLead.id,
          p_method: 'email',
          p_message: customMessage || 'Property analysis report sent'
        });

        toast({
          title: "Email sent successfully",
          description: `Report sent to ${selectedLead.email}`,
        });

        onLeadUpdate();
        setSelectedLead(null);
        setActionType(null);
      };

      reader.readAsDataURL(pdfBlob);

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!selectedLead?.phone) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-sms', {
        body: {
          leadId: selectedLead.id,
          phoneNumber: selectedLead.phone,
          ownerName: selectedLead.phone,
          propertyAddress: selectedLead.propertyAddress || 'your property',
          customMessage
        }
      });

      if (error) throw error;

      // Update lead status
      await supabase
        .from('leads')
        .update({
          status: newStatus || 'contacted',
          contacted_at: new Date().toISOString(),
          last_contact_at: new Date().toISOString(),
          contact_method: 'sms',
          notes
        })
        .eq('id', selectedLead.id);

      // Add to communication history
      await supabase.rpc('add_lead_communication', {
        p_lead_id: selectedLead.id,
        p_method: 'sms',
        p_message: customMessage || 'SMS sent'
      });

      toast({
        title: "SMS sent successfully",
        description: `Message sent to ${selectedLead.phone}`,
      });

      onLeadUpdate();
      setSelectedLead(null);
      setActionType(null);

    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error sending SMS",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, notes })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Lead status changed to ${status}`,
      });

      onLeadUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      new: { variant: 'default', label: 'New', icon: User },
      contacted: { variant: 'secondary', label: 'Contacted', icon: MessageSquare },
      report_sent: { variant: 'outline', label: 'Report Sent', icon: FileText },
      follow_up: { variant: 'secondary', label: 'Follow-up', icon: Clock },
      converted: { variant: 'default', label: 'Converted', icon: CheckCircle2 },
      not_interested: { variant: 'destructive', label: 'Not Interested', icon: XCircle }
    };

    const statusInfo = variants[status] || variants.new;
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {lead.email || lead.phone}
                    {getStatusBadge(lead.status)}
                  </CardTitle>
                  {lead.propertyAddress && (
                    <p className="text-sm text-muted-foreground">
                      📍 {lead.propertyAddress}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {lead.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(lead, 'email')}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                  {lead.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(lead, 'sms')}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      SMS
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: {lead.source}</span>
                <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                {lead.lastContactAt && (
                  <span>Last contact: {new Date(lead.lastContactAt).toLocaleDateString()}</span>
                )}
              </div>
              {lead.notes && (
                <p className="mt-2 text-sm text-muted-foreground italic">{lead.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedLead && !!actionType} onOpenChange={() => { setSelectedLead(null); setActionType(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'email' && 'Send Email with Report'}
              {actionType === 'sms' && 'Send SMS'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Update Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="report_sent">Report Sent</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Custom Message</label>
              <Textarea
                placeholder={actionType === 'email' 
                  ? "Add a personal message (optional)" 
                  : "SMS message (default message will be used if empty)"}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Internal Notes</label>
              <Textarea
                placeholder="Add internal notes about this lead"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedLead(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={actionType === 'email' ? handleSendEmail : handleSendSMS}
              disabled={loading}
            >
              {loading ? 'Sending...' : actionType === 'email' ? 'Send Email' : 'Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};