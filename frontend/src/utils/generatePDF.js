import html2pdf from 'html2pdf.js';

export const handleDownloadPDF = (elementId, filename = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found for PDF generation.`);
    return;
  }

  // Configuration for html2pdf
  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  // Temporarily add a specific class for PDF styling if needed
  element.classList.add('pdf-export');
  
  html2pdf().set(opt).from(element).save().then(() => {
    // Remove the temporary class after PDF generation
    element.classList.remove('pdf-export');
  });
};
