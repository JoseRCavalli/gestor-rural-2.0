
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const generateReportPDF = (reportData: any, title: string) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text(title, 20, 30);
  
  // Date
  pdf.setFontSize(12);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
  
  let yPosition = 60;
  
  // Report content
  if (reportData.totalItems) {
    pdf.text(`Total de Itens: ${reportData.totalItems}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (reportData.lowStockItems) {
    pdf.text(`Itens com Baixo Estoque: ${reportData.lowStockItems}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (reportData.totalEvents) {
    pdf.text(`Total de Eventos: ${reportData.totalEvents}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (reportData.items && Array.isArray(reportData.items)) {
    pdf.text('Detalhes:', 20, yPosition + 10);
    yPosition += 20;
    
    reportData.items.forEach((item: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${item.name || item.title}: ${item.quantity || item.description || ''}`, 20, yPosition);
      yPosition += 8;
    });
  }
  
  return pdf;
};
