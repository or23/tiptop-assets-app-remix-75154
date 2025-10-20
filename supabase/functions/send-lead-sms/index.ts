import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  leadId: string;
  phoneNumber: string;
  ownerName: string;
  propertyAddress: string;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📱 send-lead-sms function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, phoneNumber, ownerName, propertyAddress, customMessage }: SmsRequest = await req.json();
    
    console.log("📱 Sending SMS to:", phoneNumber);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error("Twilio credentials not configured");
    }

    const defaultMessage = `Hi ${ownerName}! Your property analysis for ${propertyAddress} is ready. We've identified revenue opportunities for you. Check your email or visit tiptop.com to view your full report. - TipTop Team`;
    
    const message = customMessage || defaultMessage;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('From', twilioPhone);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Twilio API error:", errorData);
      throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
    }

    const twilioResponse = await response.json();
    console.log("✅ SMS sent successfully:", twilioResponse.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResponse.sid,
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
    console.error("❌ Error in send-lead-sms function:", error);
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