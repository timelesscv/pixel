
import { jsPDF } from "jspdf";
import { CustomTemplate, TemplateField } from '../types';

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : 
    [0, 0, 0];
};

const getImageFormat = (base64: string): string => {
  if (base64.startsWith('data:image/png')) return 'PNG';
  if (base64.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

const getFitFontSize = (doc: jsPDF, text: string, maxW: number, startSize: number): number => {
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxW && size > 4) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
};

export const generateTemplatePDF = async (
  data: any,
  template: CustomTemplate
): Promise<void> => {
    
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  for (let i = 0; i < template.pages.length; i++) {
    if (i > 0) doc.addPage();
    
    const bg = template.pages[i];
    if (bg) {
      try {
        doc.addImage(bg, getImageFormat(bg), 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      } catch (e) {
        console.warn(`Background failed on page ${i + 1}`);
      }
    }

    const sortedFields = [...template.fields]
      .filter(f => f.page === i + 1)
      .sort((a, b) => (a.type === 'image' ? -1 : 1));

    sortedFields.forEach(field => {
      let val = data[field.key];
      
      if (field.key === 'photoFace') val = data.photos?.face;
      else if (field.key === 'photoFull') val = data.photos?.full;
      else if (field.key === 'photoPassport') val = data.photos?.passport;

      if (!val && val !== 0) return;

      // Convert percentage to mm
      const mmX = (field.x / 100) * PAGE_WIDTH;
      const mmY = (field.y / 100) * PAGE_HEIGHT;
      const mmW = (field.width / 100) * PAGE_WIDTH;
      const mmH = (field.height / 100) * PAGE_HEIGHT;

      if (field.type === 'image') {
        try {
          if (typeof val === 'string' && val.startsWith('data:image')) {
            doc.addImage(val, getImageFormat(val), mmX, mmY, mmW, mmH);
          }
        } catch (e) { console.warn(`Asset failed: ${field.key}`); }
        return;
      }

      if (field.type === 'checkmark' || field.type === 'boolean') {
        if (val === true || val === 'true' || val === 'YES' || val === 'X') {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(field.fontSize || 12);
          doc.setTextColor(0, 0, 0);
          doc.text('X', mmX + (mmW / 2), mmY + (mmH / 2), { align: 'center' });
        }
        return;
      }

      const rgb = hexToRgb(field.color || '#000000');
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      
      let style = 'normal';
      if (field.bold && field.italic) style = 'bolditalic';
      else if (field.bold) style = 'bold';
      else if (field.italic) style = 'italic';
      
      doc.setFont(field.fontFamily || 'Helvetica', style);

      let text = String(val);
      if (field.key.toLowerCase().includes('date') || field.key === 'dob') {
        text = formatDate(text);
      }

      const finalSize = getFitFontSize(doc, text, mmW || 50, field.fontSize || 10);
      doc.setFontSize(finalSize);

      doc.text(text, mmX, mmY, { 
        align: field.align || 'left',
        maxWidth: mmW 
      });
    });
  }

  doc.save(`${data.fullName || 'Export'}_${template.name}.pdf`);
};
