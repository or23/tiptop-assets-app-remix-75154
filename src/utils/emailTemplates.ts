export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
}

export const getDefaultEmailTemplate = (): EmailTemplate => ({
  id: 'default',
  name: 'Default Property Analysis Email',
  subject: 'Your Property Monetization Analysis - {{propertyAddress}}',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #800080 0%, #9b59b6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: #fff; padding: 20px; border-left: 4px solid #800080; margin: 20px 0; border-radius: 4px; }
          .cta { background: #800080; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 TipTop</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Property Monetization Platform</p>
          </div>
          
          <div class="content">
            <h2>Hi {{ownerName}},</h2>
            
            <p>Thank you for your interest in monetizing your property at <strong>{{propertyAddress}}</strong>!</p>
            
            {{#customMessage}}
            <div class="highlight">
              <p>{{customMessage}}</p>
            </div>
            {{/customMessage}}
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #800080;">📊 Your Property Analysis is Ready</h3>
              <p>We've analyzed your property and identified multiple revenue opportunities. Please find your detailed analysis report attached to this email.</p>
              
              <p><strong>What's inside your report:</strong></p>
              <ul>
                <li>Complete property revenue potential assessment</li>
                <li>Asset-by-asset monetization breakdown</li>
                <li>Setup costs and ROI calculations</li>
                <li>Recommended service provider bundles</li>
                <li>Next steps to start earning</li>
              </ul>
            </div>
            
            <p>Ready to start earning from your property?</p>
            
            <a href="https://tiptop.com/dashboard" class="cta">View Full Dashboard →</a>
            
            <p style="margin-top: 30px;">If you have any questions, simply reply to this email and our team will be happy to help!</p>
            
            <p>Best regards,<br>
            <strong>The TipTop Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2025 TipTop Property Monetization Platform</p>
            <p>This analysis is confidential and intended only for {{email}}</p>
          </div>
        </div>
      </body>
    </html>
  `
});

export const renderEmailTemplate = (
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; html: string } => {
  let subject = template.subject;
  let html = template.html;

  // Simple template variable replacement
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
  });

  // Handle conditional blocks (simple implementation)
  // {{#customMessage}}...{{/customMessage}}
  const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
  html = html.replace(conditionalRegex, (match, key, content) => {
    return variables[key] ? content : '';
  });

  return { subject, html };
};
