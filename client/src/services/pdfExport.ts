import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResumeData } from '../types/cv';

export async function exportResumeToPDF(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Élément de CV introuvable pour l\'export');
  }

  // Generate clean filename from user's name
  const firstName = resumeData.personalInfo.firstName?.trim() || '';
  const lastName = resumeData.personalInfo.lastName?.trim() || '';
  let filename = 'CV.pdf';
  if (firstName || lastName) {
    const cleanFirst = firstName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    const cleanLast = lastName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    filename = `CV_${cleanLast}${cleanFirst ? `_${cleanFirst}` : ''}.pdf`;
  }
  if (options?.customFileName) {
    filename = options.customFileName.endsWith('.pdf') ? options.customFileName : `${options.customFileName}.pdf`;
  }

  try {
    // Capture canvas with 2x scale for crisp print quality
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, // Standard A4 at 96 DPI
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.borderRadius = '0';
          clonedEl.style.width = '794px';
          clonedEl.style.minHeight = '1123px';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(filename);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF avec html2canvas, bascule vers l\'impression système:', error);
    // Fallback: browser print dialog
    window.print();
  }
}
