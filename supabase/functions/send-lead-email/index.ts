import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  leadId: string;
  email: string;
  ownerName: string;
  propertyAddress: string;
  pdfBlob?: string; // Base64 encoded PDF
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📧 send-lead-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, ownerName, propertyAddress, pdfBlob, customMessage }: EmailRequest = await req.json();
    
    console.log("📧 Sending email to:", email);

    const subject = `Your Property Monetization Analysis - ${propertyAddress}`;
    
    const htmlContent = `
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
              <h2>Hi ${ownerName},</h2>
              
              <p>Thank you for your interest in monetizing your property at <strong>${propertyAddress}</strong>!</p>
              
              ${customMessage ? `<div class="highlight"><p>${customMessage}</p></div>` : ''}
              
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
              <p>This analysis is confidential and intended only for ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailOptions: any = {
      from: "TipTop Property Analysis <analysis@tiptop.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    };

    // Add PDF attachment if provided
    if (pdfBlob) {
      emailOptions.attachments = [{
        filename: `TipTop-Analysis-${propertyAddress.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
        content: pdfBlob,
      }];
    }

    const emailResponse = await resend.emails.send(emailOptions);
    
    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.id,
        leadId 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);