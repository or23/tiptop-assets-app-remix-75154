import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Save } from 'lucide-react';
import { EmailTemplate, renderEmailTemplate } from '@/utils/emailTemplates';

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: EmailTemplate) => void;
  previewVariables?: Record<string, string>;
}

export const EmailTemplateEditor = ({ 
  template, 
  open, 
  onOpenChange, 
  onSave,
  previewVariables = {
    ownerName: 'John Doe',
    propertyAddress: '123 Main St, San Francisco, CA',
    email: 'john@example.com',
    customMessage: 'This is a preview of your custom message.'
  }
}: EmailTemplateEditorProps) => {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(template);

  const handleSave = () => {
    onSave(editedTemplate);
    onOpenChange(false);
  };

  const preview = renderEmailTemplate(editedTemplate, previewVariables);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Template Editor</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={editedTemplate.name}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Email Subject</Label>
              <Input
                id="template-subject"
                value={editedTemplate.subject}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                placeholder="Use {{variable}} for dynamic content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-html">HTML Template</Label>
              <Textarea
                id="template-html"
                value={editedTemplate.html}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, html: e.target.value })}
                rows={20}
                className="font-mono text-sm"
                placeholder="Use {{variable}} for dynamic content and {{#variable}}...{{/variable}} for conditional blocks"
              />
            </div>

            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-semibold mb-2">Available Variables:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><code>{'{{ownerName}}'}</code> - Lead's name</li>
                <li><code>{'{{propertyAddress}}'}</code> - Property address</li>
                <li><code>{'{{email}}'}</code> - Lead's email</li>
                <li><code>{'{{customMessage}}'}</code> - Custom message (optional)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Preview:</Label>
                <div className="p-3 bg-muted rounded-md">
                  {preview.subject}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Body Preview:</Label>
                <div className="border rounded-md bg-background">
                  <iframe
                    srcDoc={preview.html}
                    className="w-full h-[500px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
