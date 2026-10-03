/**
 * Utility to generate an ePub file from journal entries.
 * Uses jszip to package the OCF structure.
 */
import JSZip from 'jszip';

function sanitizeForXhtml(html = "") {
  if (!html) return "<p>No reflection text recorded.</p>";
  return String(html)
    .replace(/<img([^>]*?)(?<!\/)>/gi, '<img$1 />')
    .replace(/<br(?!\s*\/)([^>]*)>/gi, '<br />')
    .replace(/<hr(?!\s*\/)([^>]*)>/gi, '<hr />')
    .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi, '&amp;');
}

export async function generateJournalEpub(entries = [], userName = "MLC Client") {
  const zip = new JSZip();

  // 1. Mimetype - MUST be the first file and uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.folder('META-INF').file('container.xml', containerXml);

  // 3. Content.opf
  const date = new Date().toISOString();
  const manifestItems = entries.map((_, i) => 
    `<item id="chapter${i}" href="chapter${i}.xhtml" media-type="application/xhtml+xml"/>`
  ).join('\n    ');
  
  const spineItems = entries.map((_, i) => 
    `<itemref idref="chapter${i}"/>`
  ).join('\n    ');

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">mlc-journal-${Date.now()}</dc:identifier>
    <dc:title>My Therapeutic Journey</dc:title>
    <dc:creator>${userName}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${date}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover"/>
    ${spineItems}
  </spine>
</package>`;
  zip.folder('OEBPS').file('content.opf', contentOpf);

  // 4. toc.ncx
  const navPoints = entries.map((entry, i) => {
    const d = entry.created_at ? new Date(entry.created_at).toLocaleDateString() : `Entry ${i + 1}`;
    return `
    <navPoint id="navPoint-${i+1}" playOrder="${i+2}">
      <navLabel><text>${d} - ${entry.mood || 'Reflection'}</text></navLabel>
      <content src="chapter${i}.xhtml"/>
    </navPoint>`;
  }).join('');

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="mlc-journal-${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle><text>My Therapeutic Journey</text></docTitle>
  <navMap>
    <navPoint id="cover" playOrder="1">
      <navLabel><text>Cover</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
    ${navPoints}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', tocNcx);

  // 5. Styles
  const css = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 6%; color: #263A33; }
    h1 { color: #56756D; text-align: center; margin-top: 15%; font-weight: 600; font-size: 2em; }
    .date { color: #718096; font-size: 0.85em; text-align: center; margin-bottom: 1.5em; text-transform: uppercase; letter-spacing: 0.05em; }
    .mood { display: inline-block; background: rgba(86, 117, 109, 0.12); padding: 4px 14px; border-radius: 9999px; font-size: 0.85em; color: #56756D; font-weight: 600; margin-bottom: 1.5em; }
    .entry-body { margin-top: 1.5em; line-height: 1.7; color: #263A33; }
    .tag { font-size: 0.75em; color: #5A6E65; background: #FAF8F5; border: 1px solid rgba(86, 117, 109, 0.16); padding: 3px 8px; border-radius: 6px; margin-right: 6px; display: inline-block; }
    .footer-note { margin-top: 3em; font-size: 0.75em; color: #718096; border-top: 1px solid rgba(86, 117, 109, 0.15); padding-top: 1em; text-align: center; }
  `;
  zip.file('OEBPS/style.css', css);

  // 6. Cover Page
  const coverHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Cover</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <div style="text-align: center; margin-top: 25%;">
    <p style="color: #56756D; font-weight: 700; letter-spacing: 0.08em; font-size: 0.85em; text-transform: uppercase;">MLC Therapy &amp; Wellness</p>
    <h1>My Therapeutic Journey</h1>
    <p style="color: #5A6E65; font-size: 1.05em; margin-top: 0.5em;">Personal Journal &amp; Mindful Reflections</p>
    <div style="margin-top: 18%; padding: 1.5em; background: #FAF8F5; border-radius: 12px; display: inline-block; border: 1px solid rgba(86, 117, 109, 0.14);">
      <p style="font-weight: 600; color: #263A33;">Client: ${userName}</p>
      <p style="font-size: 0.85em; color: #5A6E65; margin-top: 0.4em;">Total Reflections: ${entries.length}</p>
      <p style="font-size: 0.8em; color: #718096; margin-top: 0.4em;">Archived: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
  zip.file('OEBPS/cover.xhtml', coverHtml);

  // 7. Chapters (Entries)
  entries.forEach((entry, i) => {
    const rawDate = entry.created_at ? new Date(entry.created_at) : new Date();
    const timeFormatted = !isNaN(rawDate.getTime()) ? rawDate.toLocaleString() : "Reflection";
    const dateTitle = !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString() : `Entry ${i + 1}`;
    const cleanEntry = sanitizeForXhtml(entry.entry);
    const tags = Array.isArray(entry.extra_data?.tags) ? entry.extra_data.tags : [];

    const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${dateTitle}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <div class="date">${timeFormatted}</div>
  <div style="text-align: center;">
    <span class="mood">${entry.mood || 'Reflection'}</span>
  </div>
  <div class="entry-body">
    ${cleanEntry}
  </div>
  ${tags.length > 0 ? `<div style="margin-top: 2em;">${tags.map(t => `<span class="tag">#${t}</span>`).join(' ')}</div>` : ''}
</body>
</html>`;
    zip.file(`OEBPS/chapter${i}.xhtml`, chapterHtml);
  });

  // Generate blob
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}
