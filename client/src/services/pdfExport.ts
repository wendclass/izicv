import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResumeData } from '../types/cv';

export interface PDFExportResult {
  filename: string;
  blob: Blob;
}

/**
 * Computes standard sanitized filename: CV_Nom_Prenom.pdf
 */
export function getResumePDFFilename(resumeData: ResumeData, customTitle?: string): string {
  const firstName = resumeData.personalInfo?.firstName?.trim() || '';
  const lastName = resumeData.personalInfo?.lastName?.trim() || '';

  if (lastName || firstName) {
    const cleanLast = lastName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    const cleanFirst = firstName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    return `CV_${cleanLast}${cleanFirst ? `_${cleanFirst}` : ''}.pdf`;
  }

  if (customTitle?.trim()) {
    return `CV_${customTitle.trim().replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_')}.pdf`;
  }

  return 'Mon_CV.pdf';
}

/**
 * Generate PDF Blob with high quality and reasonable size
 */
export async function generateResumePDFBlob(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<PDFExportResult> {
  // 1. Wait for document fonts to be completely ready
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element de CV introuvable pour l'export.");
  }

  const filename = options?.customFileName
    ? (options.customFileName.endsWith('.pdf') ? options.customFileName : `${options.customFileName}.pdf`)
    : getResumePDFFilename(resumeData);

  // Capture canvas with 2 scale for crisp print while staying fast and avoiding memory limits
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (!clonedEl) return;

      // Copy loaded fonts into cloned document
      if (typeof document !== 'undefined' && document.fonts && (clonedDoc as any).fonts) {
        try {
          document.fonts.forEach((font) => {
            (clonedDoc as any).fonts.add(font);
          });
        } catch {}
      }

      // Detach clonedEl from any parent wrappers, scaled containers, or display:none parents
      clonedDoc.body.innerHTML = '';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.background = '#ffffff';
      clonedDoc.body.style.width = '794px';
      clonedDoc.body.style.minHeight = '1123px';
      clonedDoc.body.appendChild(clonedEl);

      // Force pristine unscaled A4 dimensions and clean layout
      clonedEl.style.position = 'static';
      clonedEl.style.left = '0';
      clonedEl.style.top = '0';
      clonedEl.style.transform = 'none';
      clonedEl.style.boxShadow = 'none';
      clonedEl.style.borderRadius = '0';
      clonedEl.style.width = '794px';
      clonedEl.style.minHeight = '1123px';
      clonedEl.style.maxWidth = '794px';
      clonedEl.style.margin = '0';
      clonedEl.style.visibility = 'visible';
      clonedEl.style.opacity = '1';
      clonedEl.style.display = 'flex';

      // Fix html2canvas character rendering and spacing bugs:
      // - Disable font ligatures so character pairs (fi, fl, ti, etc.) are never dropped
      // - Disable text justification which causes character collision in canvas
      // - Add micro letter-spacing to prevent adjacent glyph bounding box collapse
      const allElements = clonedEl.querySelectorAll<HTMLElement>('*');
      allElements.forEach((el) => {
        el.style.fontVariantLigatures = 'none';
        (el.style as any).fontFeatureSettings = '"liga" 0, "clig" 0';
        el.style.letterSpacing = '0.015px';
        if (el.style.textAlign === 'justify' || el.classList.contains('text-justify')) {
          el.style.textAlign = 'left';
        }
      });
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Standard A4: 210 x 297 mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  const blob = pdf.output('blob');
  return { filename, blob };
}

/**
 * Direct file download
 */
export async function exportResumeToPDF(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<string> {
  const { filename, blob } = await generateResumePDFBlob(elementId, resumeData, options);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return filename;
}

/**
 * Share PDF using Android Web Share API (WhatsApp, Gmail, Drive, etc.)
 * Falls back to standard download if Web Share API with files is unsupported.
 */
export async function shareResumePDF(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<{ filename: string; shared: boolean }> {
  const { filename, blob } = await generateResumePDFBlob(elementId, resumeData, options);

  const file = new File([blob], filename, { type: 'application/pdf' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Mon CV',
        text: 'Voici mon CV au format PDF.',
        files: [file],
      });
      return { filename, shared: true };
    } catch (err: any) {
      // User cancelled share dialog or error occurred; fall back to download
      if (err.name === 'AbortError') {
        return { filename, shared: false };
      }
    }
  }

  // Fallback to direct download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return { filename, shared: false };
}
