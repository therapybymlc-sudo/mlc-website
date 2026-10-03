/**
 * Utility to generate a high-fidelity PDF document from client journal entries.
 * Uses jsPDF with automated multi-page handling and institutional branding.
 */
export async function generateJournalPDF(entries, userName = "MLC Client", saveFilename = null) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - (margin * 2);

  // Helper to cleanly strip HTML and decode common entities
  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  // ─── 1. Decorative Cover Page ───
  // Primary Sage accent band at top
  doc.setFillColor(86, 117, 109); // #56756D
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Eyebrow Brand Tag
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(86, 117, 109);
  doc.text("MLC THERAPY & WELLNESS", pageWidth / 2, 65, { align: "center" });

  // Main Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(38, 58, 51); // #263A33
  doc.text("My Therapeutic Journey", pageWidth / 2, 80, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90, 110, 101); // #5A6E65
  doc.text("Personal Journal & Therapeutic Reflections", pageWidth / 2, 89, { align: "center" });

  // Decorative Rule
  doc.setDrawColor(86, 117, 109);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 25, 98, pageWidth / 2 + 25, 98);

  // Archive Metadata Box
  doc.setFillColor(250, 248, 245); // #FAF8F5
  doc.setDrawColor(220, 228, 224);
  doc.roundedRect(pageWidth / 2 - 60, 115, 120, 42, 3, 3, 'FD');

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(38, 58, 51);
  doc.text(`Client: ${userName}`, pageWidth / 2, 126, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 110, 101);
  doc.text(`Total Entries: ${entries.length}`, pageWidth / 2, 134, { align: "center" });
  doc.text(`Archived: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 142, { align: "center" });
  doc.text("Format: Comprehensive Clinical PDF Archive", pageWidth / 2, 150, { align: "center" });

  // Bottom Confidentiality Notice
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 145);
  doc.text("CONFIDENTIAL: Strictly intended for personal healing, reflection, and authorized clinical continuity.", pageWidth / 2, pageHeight - 20, { align: "center" });

  // ─── 2. Journal Entry Pages ───
  entries.forEach((entry, idx) => {
    doc.addPage();

    // Subtle header rule
    doc.setDrawColor(225, 232, 228);
    doc.setLineWidth(0.3);
    doc.line(margin, 18, pageWidth - margin, 18);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 140, 135);
    doc.text("MY THERAPEUTIC JOURNEY", margin, 14);
    doc.text(`ENTRY ${idx + 1} OF ${entries.length}`, pageWidth - margin, 14, { align: "right" });

    let currentY = 28;

    // Date
    const entryDate = entry.created_at 
      ? new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : "Undated Entry";
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(38, 58, 51);
    doc.text(entryDate, margin, currentY);
    currentY += 7;

    // Mood & Tags
    const mood = entry.mood || "Reflective";
    const tags = Array.isArray(entry.extra_data?.tags) ? entry.extra_data.tags : [];
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(86, 117, 109);
    const metaLine = `Mood: ${mood}` + (tags.length > 0 ? `   |   Tags: ${tags.join(', ')}` : "");
    doc.text(metaLine, margin, currentY);
    currentY += 8;

    // Accent Line
    doc.setDrawColor(86, 117, 109);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + 35, currentY);
    currentY += 10;

    // Cleaned Entry Content
    const plainText = stripHtml(entry.entry);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 50, 45);
    
    const lines = doc.splitTextToSize(plainText, contentWidth);
    const lineHeight = 5.8;

    for (let i = 0; i < lines.length; i++) {
      if (currentY + lineHeight > pageHeight - 20) {
        // Page footer before adding new page
        doc.setFontSize(8);
        doc.setTextColor(140, 150, 145);
        doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" });

        doc.addPage();
        currentY = 24;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 50, 45);
      }
      doc.text(lines[i], margin, currentY);
      currentY += lineHeight;
    }

    // Page footer on entry page
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 145);
    doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  });

  const blob = doc.output('blob');
  if (saveFilename) {
    triggerBlobDownload(blob, saveFilename);
  }
  return blob;
}

/**
 * Universal safe blob downloader that prevents premature URL revocation
 * in Chromium-based browsers (Chrome, Edge) where immediate revocation aborts downloads.
 */
export function triggerBlobDownload(blob, filename) {
  if (typeof window === 'undefined' || !blob) return;

  // 1. Sanitize filename for Windows & OS filesystem compatibility
  const safeFilename = (filename || 'My_Therapeutic_Journey.pdf')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');

  // 2. Create object URL
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = safeFilename;
  a.setAttribute('download', safeFilename);
  document.body.appendChild(a);

  // 3. Trigger native download click
  a.click();

  // 4. Defer revocation by 2 minutes so browser download manager has plenty of time
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    } catch {}
    window.URL.revokeObjectURL(url);
  }, 120000);
}
