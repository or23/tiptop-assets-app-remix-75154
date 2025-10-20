import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EmailTemplateEditor } from './EmailTemplateEditor';
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
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, FileText, Clock, User, CheckCircle2, XCircle, Eye, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateLeadPropertyReport, ReportData } from '@/utils/leadReportGenerator';
import { getDefaultEmailTemplate, renderEmailTemplate, EmailTemplate } from '@/utils/emailTemplates';

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
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(getDefaultEmailTemplate());
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

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
        
        // Render email template with variables
        const emailContent = renderEmailTemplate(emailTemplate, {
          ownerName: reportData.ownerName,
          propertyAddress: reportData.propertyAddress,
          email: selectedLead.email!,
          customMessage: customMessage || ''
        });
        
        const { data, error } = await supabase.functions.invoke('send-lead-email', {
          body: {
            leadId: selectedLead.id,
            email: selectedLead.email,
            subject: emailContent.subject,
            htmlContent: emailContent.html,
            pdfBlob: base64data.split(',')[1]
          }
        });

        if (error) throw error;

        // Update lead status
        await supabase
          .from('leads')
          .update({
            status: newStatus || 'report_sent',
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
            <DialogTitle className="flex items-center justify-between">
              <span>
                {actionType === 'email' && 'Send Email with Report'}
                {actionType === 'sms' && 'Send SMS'}
              </span>
              {actionType === 'email' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplatePreview(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateEditor(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Template
                  </Button>
                </div>
              )}
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

      {/* Template Editor */}
      <EmailTemplateEditor
        template={emailTemplate}
        open={showTemplateEditor}
        onOpenChange={setShowTemplateEditor}
        onSave={(template) => {
          setEmailTemplate(template);
          toast({
            title: "Template saved",
            description: "Email template has been updated successfully",
          });
        }}
        previewVariables={
          selectedLead
            ? {
                ownerName: selectedLead.email?.split('@')[0] || 'Customer',
                propertyAddress: selectedLead.propertyAddress || 'Property Address',
                email: selectedLead.email || 'email@example.com',
                customMessage: customMessage || 'This is a preview of your custom message.'
              }
            : undefined
        }
      />

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {selectedLead && (
              <>
                <div className="space-y-2">
                  <Label>Subject:</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {renderEmailTemplate(emailTemplate, {
                      ownerName: selectedLead.email?.split('@')[0] || 'Customer',
                      propertyAddress: selectedLead.propertyAddress || 'Property Address',
                      email: selectedLead.email || 'email@example.com',
                      customMessage: customMessage || ''
                    }).subject}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Body:</Label>
                  <div className="border rounded-md bg-background">
                    <iframe
                      srcDoc={renderEmailTemplate(emailTemplate, {
                        ownerName: selectedLead.email?.split('@')[0] || 'Customer',
                        propertyAddress: selectedLead.propertyAddress || 'Property Address',
                        email: selectedLead.email || 'email@example.com',
                        customMessage: customMessage || ''
                      }).html}
                      className="w-full h-[500px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};