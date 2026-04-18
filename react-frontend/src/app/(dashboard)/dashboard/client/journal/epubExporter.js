/**
 * Utility to generate an ePub file from journal entries.
 * Uses jszip to package the OCF structure.
 */
import JSZip from 'jszip';

export async function generateJournalEpub(entries, userName = "MLC Client") {
  const zip = new JSZip();

  // 1. Mimetype - MUST be the first file and not compressed
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
  const navPoints = entries.map((entry, i) => `
    <navPoint id="navPoint-${i+1}" playOrder="${i+2}">
      <navLabel><text>${new Date(entry.created_at).toLocaleDateString()}</text></navLabel>
      <content src="chapter${i}.xhtml"/>
    </navPoint>`).join('');

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
    body { font-family: 'Serif', 'Playfair Display', Georgia, serif; line-height: 1.6; padding: 5%; color: #333; }
    h1 { color: #56756D; text-align: center; margin-top: 20%; }
    .date { color: #888; font-size: 0.9em; text-align: center; margin-bottom: 2em; }
    .mood { display: inline-block; background: #E9F2ED; padding: 2px 10px; border-radius: 10px; font-size: 0.8em; color: #56756D; }
    .entry-body { margin-top: 2em; }
    .tag { font-size: 0.7em; color: #666; font-style: italic; margin-right: 5px; }
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
  <div style="text-align: center; margin-top: 30%;">
    <h1 style="font-size: 2.5em;">My Therapeutic Journey</h1>
    <p>A collection of reflections and growth.</p>
    <p style="margin-top: 10%; color: #C9A960; font-weight: bold;">MLC HEALTH</p>
    <p style="font-size: 0.8em; color: #999;">${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`;
  zip.file('OEBPS/cover.xhtml', coverHtml);

  // 7. Chapters (Entries)
  entries.forEach((entry, i) => {
    const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${new Date(entry.created_at).toLocaleDateString()}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <div class="date">${new Date(entry.created_at).toLocaleString()}</div>
  <div style="text-align: center;">
    <span class="mood">${entry.mood}</span>
  </div>
  <div class="entry-body">
    ${entry.entry}
  </div>
  <div style="margin-top: 2em;">
    ${(entry.extra_data?.tags || []).map(t => `<span class="tag">#${t}</span>`).join(' ')}
  </div>
</body>
</html>`;
    zip.file(`OEBPS/chapter${i}.xhtml`, chapterHtml);
  });

  // Generate blob
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}
