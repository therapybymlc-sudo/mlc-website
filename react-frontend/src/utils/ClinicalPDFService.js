import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ClinicalPDFService
 * Handles high-fidelity clinical record exports with watermarking and legal disclaimers.
 */
export const exportNoteToPDF = async (client, note, therapistName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 🔹 1. Institutional Branding & Watermark
  const addWatermark = (pdf) => {
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.05 }));
    pdf.setFontSize(40);
    pdf.setTextColor(150, 150, 150);
    pdf.text("MLC Health and Wellness Centre", pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    pdf.restoreGraphicsState();
  };

  // 🔹 2. Coversheet / Header
  const addHeader = (pdf) => {
    pdf.setFontSize(22);
    pdf.setTextColor(86, 117, 109); // MLC Green
    pdf.text("Clinical Session Record", 20, 30);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 38);
    
    pdf.setDrawColor(86, 117, 109);
    pdf.line(20, 42, pageWidth - 20, 42);
  };

  // 🔹 3. Legal Disclaimer
  const addDisclaimer = (pdf) => {
    const disclaimer = "CONFIDENTIALITY NOTICE: This information is confidential and is intended only for those with explicit consent from the client. Any unauthorized possession of this record outside those authorities shall hold the clinical practitioner in charge liable.";
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - 40);
    pdf.text(splitDisclaimer, 20, pageHeight - 15);
  };

  // 🔹 4. Render Note Content
  addWatermark(doc);
  addHeader(doc);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Patient: ${client.name || 'N/A'}`, 20, 55);
  doc.text(`Clinician: ${therapistName || 'MLC Professional'}`, 20, 62);
  doc.text(`Template: ${note.template_name || 'Standard Note'}`, 20, 69);

  // Content Table
  const tableData = Object.entries(note.data || {}).map(([key, val]) => [
    key.replace(/_/g, ' ').toUpperCase(),
    Array.isArray(val) ? val.join(', ') : String(val)
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['Clinical Inquiry', 'Observations / Plan']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillStyle: 'dark', fillColor: [86, 117, 109] },
    margin: { left: 20, right: 20 },
    didDrawPage: (data) => {
      addWatermark(doc);
      addDisclaimer(doc);
    }
  });

  doc.save(`MLC_Note_${client.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};

export const exportAllClientNotes = async (client, notes, therapistName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addWatermark = (pdf) => {
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.05 }));
    pdf.setFontSize(40);
    pdf.setTextColor(150, 150, 150);
    pdf.text("MLC Health and Wellness Centre", pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    pdf.restoreGraphicsState();
  };

  const addDisclaimer = (pdf) => {
    const disclaimer = "CONFIDENTIALITY NOTICE: This information is confidential and is intended only for those with explicit consent from the client. Any unauthorized possession of this record outside those authorities shall hold the clinical practitioner in charge liable.";
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - 40);
    pdf.text(splitDisclaimer, 20, pageHeight - 15);
  };

  // 🔹 First Page: Patient Dossier
  addWatermark(doc);
  doc.setFontSize(26);
  doc.setTextColor(86, 117, 109);
  doc.text("MLC HEALTH", pageWidth / 2, 50, { align: 'center' });
  doc.setFontSize(14);
  doc.text("Clinical Dossier & Composite Session History", pageWidth / 2, 60, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(40, 70, pageWidth - 40, 70);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`CLIENT FULL NAME: ${client.name}`, 40, 85);
  doc.text(`PRIMARY CLINICIAN: ${therapistName}`, 40, 95);
  doc.text(`RECORDS GENERATED: ${new Date().toLocaleString()}`, 40, 105);
  doc.text(`TOTAL SESSIONS RECORDED: ${notes.length}`, 40, 115);

  addDisclaimer(doc);

  // 🔹 Sequential Notes
  notes.forEach((note, idx) => {
    doc.addPage();
    addWatermark(doc);
    
    doc.setFontSize(18);
    doc.setTextColor(86, 117, 109);
    doc.text(`Session Record #${idx + 1}`, 20, 25);
    doc.setFontSize(10);
    doc.text(`Template: ${note.template_name || 'Note'}`, 20, 32);

    const tableData = Object.entries(note.data || {}).map(([key, val]) => [
      key.toUpperCase(),
      Array.isArray(val) ? val.join(', ') : String(val)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Clinical Content']],
      body: tableData,
      theme: 'plain',
      headStyles: { fillColor: [245, 245, 245], textColor: [86, 117, 109] },
      margin: { bottom: 30 },
      didDrawPage: (data) => {
         addDisclaimer(doc);
      }
    });
  });

  doc.save(`MLC_Dossier_${client.name.replace(/\s+/g, '_')}.pdf`);
};
