
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, WifiIcon, Waves } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generatePropertyReportPDF } from '@/utils/pdfGenerator';

import PropertySubmissionForm, { FormValues } from '@/components/property/PropertySubmissionForm';
import SubmissionResults from '@/components/property/SubmissionResults';
import { ServiceCardProps } from '@/components/property/ServiceCard';

const SubmitProperty = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [services, setServices] = useState<ServiceCardProps[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const { toast } = useToast();
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setFormData(values); // Store the form data for PDF generation
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('process-submission', {
        body: {
          full_name: values.full_name,
          email: values.email,
          property_address: values.property_address,
          has_garage: values.has_garage,
          has_driveway: values.has_driveway,
          has_pool: values.has_pool,
          has_internet: values.has_internet,
          additional_info: values.additional_info,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process the result
      const serviceCards: ServiceCardProps[] = [];
      
      // Neighbor service card
      if (data.services.neighbor.sent) {
        serviceCards.push({
          id: 'neighbor',
          title: 'Neighbor Storage',
          description: 'You\'ve been referred to Neighbor. Earn money by renting out your garage or driveway.',
          earnings: '$150–$300/mo',
          icon: <Building size={24} className="text-tiptop-purple" />,
        });
      }
      
      // Honeygain service card
      if (data.services.honeygain.sent) {
        serviceCards.push({
          id: 'honeygain',
          title: 'Honeygain',
          description: 'Share your internet connection and earn passive income.',
          earnings: '$50–$100/mo',
          icon: <WifiIcon size={24} className="text-tiptop-purple" />,
          link: data.services.honeygain.referralLink,
          linkText: 'Sign up for Honeygain'
        });
      }
      
      // Swimply service card
      if (data.services.swimply.sent) {
        serviceCards.push({
          id: 'swimply',
          title: 'Swimply',
          description: 'Rent out your swimming pool by the hour.',
          earnings: '$200–$500/mo',
          icon: <Waves size={24} className="text-tiptop-purple" />,
          link: data.services.swimply.referralLink,
          linkText: 'Sign up for Swimply'
        });
      }
      
      setServices(serviceCards);
      setTotalEarnings(data.estimatedEarnings);
      setSubmissionComplete(true);
      
    } catch (err) {
      console.error('Submission error:', err);
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Download PDF report
  const handleDownloadPDF = () => {
    if (!formData) return;
    
    try {
      const pdfBlob = generatePropertyReportPDF(
        formData.property_address,
        totalEarnings,
        services.map(({ id, title, description, earnings }) => ({ id, title, description, earnings })),
        formData.full_name
      );
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TipTop_Property_Report.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: "Your property report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download Error',
        description: 'There was a problem generating your PDF report.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="page-container flex flex-col bg-gradient-to-b from-black to-purple-900">
      {/* Header */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
        <div 
          className="text-2xl md:text-3xl font-bold text-tiptop-purple hover:scale-105 transition-transform flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          tiptop
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pb-12">
        {!submissionComplete ? (
          <PropertySubmissionForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        ) : (
          <SubmissionResults 
            totalEarnings={totalEarnings}
            services={services}
            formData={formData}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>
    </div>
  );
};

export default SubmitProperty;
