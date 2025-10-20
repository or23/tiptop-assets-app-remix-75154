import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  propertyAddress: string;
  ownerName: string;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  assets: Array<{
    name: string;
    monthlyRevenue: number;
    setupCost: number;
    description: string;
    roi?: number;
  }>;
  bundles?: Array<{
    name: string;
    description: string;
    totalSetupCost: number;
    totalMonthlyEarnings: number;
    assets: string[];
  }>;
  analysisDate: Date;
}

export const generateLeadPropertyReport = (data: ReportData): Blob => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header with TipTop Branding
  doc.setFontSize(28);
  doc.setTextColor(128, 0, 128); // Purple
  doc.text('TipTop', 14, yPos);
  
  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('Property Monetization Analysis', 50, yPos);
  yPos += 15;

  // Property Information Section
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Property Information', 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Address: ${data.propertyAddress}`, 14, yPos);
  yPos += 6;
  doc.text(`Owner: ${data.ownerName}`, 14, yPos);
  yPos += 6;
  doc.text(`Analysis Date: ${data.analysisDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 14, yPos);
  yPos += 15;

  // Revenue Summary Section
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Revenue Potential', 14, yPos);
  yPos += 10;

  // Highlighted revenue box
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(14, yPos - 5, 180, 20, 3, 3, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(0, 128, 0); // Green
  doc.text(`$${data.totalMonthlyRevenue.toLocaleString()}/month`, 20, yPos + 8);
  
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`${data.totalOpportunities} Monetization Opportunities`, 120, yPos + 8);
  yPos += 30;

  // Asset Opportunities Table
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Asset Monetization Opportunities', 14, yPos);
  yPos += 8;

  const assetTableData = data.assets.map(asset => [
    asset.name,
    `$${asset.monthlyRevenue.toLocaleString()}`,
    `$${asset.setupCost.toLocaleString()}`,
    asset.roi ? `${asset.roi} months` : 'N/A',
    asset.description.length > 50 ? asset.description.substring(0, 47) + '...' : asset.description
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Asset', 'Monthly Revenue', 'Setup Cost', 'ROI', 'Description']],
    body: assetTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [128, 0, 128],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Bundle Recommendations Section (if available)
  if (data.bundles && data.bundles.length > 0) {
    // Add new page if needed
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Recommended Bundles', 14, yPos);
    yPos += 8;

    data.bundles.forEach((bundle, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Bundle box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, 180, 35, 3, 3, 'F');

      doc.setFontSize(13);
      doc.setTextColor(128, 0, 128);
      doc.text(bundle.name, 20, yPos + 8);

      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(bundle.description, 20, yPos + 15);

      doc.setFontSize(11);
      doc.setTextColor(0, 128, 0);
      doc.text(`$${bundle.totalMonthlyEarnings.toLocaleString()}/mo`, 20, yPos + 23);
      
      doc.setTextColor(80);
      doc.text(`Setup: $${bundle.totalSetupCost.toLocaleString()}`, 80, yPos + 23);
      doc.text(`Assets: ${bundle.assets.join(', ')}`, 20, yPos + 30);

      yPos += 40;
    });
  }

  // Add new page for next steps
  doc.addPage();
  yPos = 20;

  // Next Steps Section
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('How TipTop Can Help', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setTextColor(80);
  const nextSteps = [
    'Complete Property Analysis: Our AI analyzes your property\'s unique features',
    'Partner Connections: We connect you with verified service providers',
    'Revenue Tracking: Monitor your earnings through our dashboard',
    'Automated Management: Set it and forget it - we handle the details',
    'Expert Support: Our team guides you through every step'
  ];

  nextSteps.forEach((step, index) => {
    doc.text(`${index + 1}. ${step}`, 20, yPos);
    yPos += 8;
  });

  yPos += 10;

  // Call to Action
  doc.setFillColor(128, 0, 128);
  doc.roundedRect(14, yPos, 180, 30, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Ready to Start Earning?', 70, yPos + 12);
  
  doc.setFontSize(11);
  doc.text('Visit tiptop.com or reply to this message to get started', 40, yPos + 22);

  // Footer
  yPos = 280;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('TipTop Property Monetization Platform', 14, yPos);
  doc.text('Confidential Property Analysis Report', 14, yPos + 5);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 155, yPos);

  return doc.output('blob');
};