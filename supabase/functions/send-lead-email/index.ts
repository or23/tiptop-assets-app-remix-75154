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
  subject: string;
  htmlContent: string;
  pdfBlob?: string; // Base64 encoded PDF
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📧 send-lead-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, subject, htmlContent, pdfBlob }: EmailRequest = await req.json();
    
    console.log("📧 Sending email to:", email);

    const emailOptions: any = {
      from: "TipTop Property Analysis <analysis@tiptop.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    };

    // Add PDF attachment if provided
    if (pdfBlob) {
      emailOptions.attachments = [{
        filename: `TipTop-Property-Analysis.pdf`,
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