const fs = require('fs');
// Import ShadingType for table header shading and ImageRun for logos
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, 
        BorderStyle, WidthType, Header, Footer, PageNumber, PageBreak, HeadingLevel, SymbolRun, ShadingType, ImageRun } = require('docx');

// Parse frontmatter and markdown content
function parseMarkdown(content) {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatter = {};
    let mdContent = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '---') {
            if (!inFrontmatter && i === 0) {
                inFrontmatter = true;
            } else if (inFrontmatter) {
                inFrontmatter = false;
            }
            continue;
        }
        
        if (inFrontmatter) {
            const match = line.match(/^(\w+):\s*"?(.+?)"?$/);
            if (match) {
                frontmatter[match[1]] = match[2].replace(/^"|"$/g, '');
            }
        } else {
            mdContent.push(line);
        }
    }
    
    return { frontmatter, content: mdContent.join('\n') };
}

// Extract cover page info from HTML divs
function extractCoverPageInfo(content) {
    const lines = content.split('\n');
    let inFirstDiv = false;
    let inSecondDiv = false;
    let customerName = '';
    let customerAddressLines = [];  // Changed to array
    let appName = '';
    let assuranceLevel = '';  // New field
    let preparedByInfo = [];
    let docTitle = '';
    let version = '';
    let date = '';
    let copyright = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '<div align="center">') {
            if (!inFirstDiv && !inSecondDiv) {
                inFirstDiv = true;
            } else if (inFirstDiv && !inSecondDiv) {
                inSecondDiv = true;
            }
            continue;
        }
        
        if (line === '</div>') {
            if (inSecondDiv) {
                inSecondDiv = false;
            } else if (inFirstDiv) {
                inFirstDiv = false;
            }
            continue;
        }
        
        if (inFirstDiv && !inSecondDiv) {
            if (line.startsWith('#')) {
                docTitle = line.replace(/^#+\s*/, '');
            } else if (line.startsWith('**Version')) {
                version = line.replace(/\*\*/g, '').trim();
            } else if (line.startsWith('©')) {
                copyright = line;
            } else if (line && !line.startsWith('**') && line !== '' && !copyright) {
                // Only process lines BEFORE copyright is found
                const cleanLine = line.replace(/<br>|<br\/>|<br \/>/g, '').trim();
                if (cleanLine) {
                    // Skip empty lines
                    if (!cleanLine) {
                        // Don't process
                    }
                    // Date line (e.g., "December 2025")
                    else if (/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/.test(cleanLine)) {
                        date = cleanLine;
                    }
                    // App name line (contains parentheses with acronym)
                    else if (cleanLine.includes('(') && cleanLine.includes(')')) {
                        appName = cleanLine;
                    }
                    // Customer name (first non-special line)
                    else if (!customerName) {
                        customerName = cleanLine;
                    }
                    // Assurance level (comes right after app name, check for known patterns)
                    else if (!assuranceLevel && (cleanLine.includes('FedRAMP') || cleanLine.includes('Moderate') || cleanLine.includes('High') || cleanLine.includes('Low'))) {
                        assuranceLevel = cleanLine;
                    }
                    // Skip "Prepared By" line - it's handled separately in the second div
                    else if (cleanLine.toLowerCase().includes('prepared by')) {
                        // Don't add to address
                    }
                    // Everything else after customer name is address
                    else {
                        customerAddressLines.push(cleanLine);
                    }
                }
            }
        }
        
        if (inSecondDiv) {
            const cleanLine = line.replace(/<br>|<br\/>|<br \/>/g, '').trim();
            if (cleanLine) {
                preparedByInfo.push(cleanLine);
            }
        }
    }
    
    return { customerName, customerAddressLines, appName, assuranceLevel, preparedByInfo, docTitle, version, date, copyright };
}

// Create cover page paragraphs
function createCoverPage(coverInfo, logoPath1, logoPath2) {
    const paragraphs = [];
    
    // Logo 1 - Above customer name at the very top
    if (logoPath1 && fs.existsSync(logoPath1)) {
        const logo1 = fs.readFileSync(logoPath1);
        // Detect image type from file extension
        const ext = logoPath1.toLowerCase().split('.').pop();
        
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
                new ImageRun({
                    data: logo1,
                    transformation: {
                        width: 200,  // Adjust width as needed
                        height: 100   // Adjust height as needed
                    },
                    type: ext === 'jpg' ? 'jpeg' : ext  // Convert 'jpg' to 'jpeg' for docx library
                })
            ]
        }));
        // One blank line after logo
        paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    }
    
    
    // Customer name (line 1) - bold 20pt centered
    if (coverInfo.customerName) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.customerName, bold: true, size: 40 })]
        }));
    }
    
    // One blank line
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    
    // Customer address lines (11pt centered) - display all of them
    if (coverInfo.customerAddressLines && coverInfo.customerAddressLines.length > 0) {
        coverInfo.customerAddressLines.forEach(addressLine => {
            paragraphs.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
                children: [new TextRun({ text: addressLine, size: 22 })]
            }));
        });
    }
    
    // Two blank lines
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    
    // App name and acronym (18pt bold centered)
    if (coverInfo.appName) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.appName, bold: true, size: 36 })]
        }));
    }
    
    // Assurance level (14pt centered) - NEW: right after app name
    if (coverInfo.assuranceLevel) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.assuranceLevel, size: 28 })]
        }));
    }
    
    // Two blank lines
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    
    // Document title (16pt bold centered)
    if (coverInfo.docTitle) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.docTitle, bold: true, size: 32 })]
        }));
    }
    
    // Version and Date
    if (coverInfo.version) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.version, size: 22 })]
        }));
    }
    
    if (coverInfo.date) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: coverInfo.date, size: 22 })]
        }));
    }
    
    // Two blank lines before copyright
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    
    // Copyright line
    if (coverInfo.copyright) {
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: '\u00A9' + coverInfo.copyright.replace(/©/, ''), size: 16 })]
        }));
    }
    
    // START Prepared By Section
    
    // Two blank lines before logo/Prepared By
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    
    // Create a table with logo on the left and "Prepared By" text on the right
    if (logoPath2 && fs.existsSync(logoPath2)) {
        const logo2 = fs.readFileSync(logoPath2);
        const ext = logoPath2.toLowerCase().split('.').pop();
        
        // Prepared By text lines
        const preparedByLines = [
            "Prepared By",
            "stackArmor",
            "11950 Democracy Dr.",
            "Suite 650",
            "Reston, VA 20190"
        ];
        
        // Create paragraphs for the text
        const textParagraphs = preparedByLines.map(line => 
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
                children: [new TextRun({ text: line, size: 22 })]
            })
        );
        
        // Create a table with the logo on the left and text on the right
        const preparedByTable = new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
                new TableRow({
                    children: [
                        // Left cell: Logo
                        new TableCell({
                            width: { size: 30, type: WidthType.PERCENTAGE },
                            verticalAlign: "center",
                            margins: {
                                top: 200,    // Add 200 twips (about 0.14 inches) of padding
                                bottom: 200,
                                left: 0,
                                right: 0
                            },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new ImageRun({
                                            data: logo2,
                                            transformation: {
                                                width: 125,
                                                height: 60
                                            },
                                            type: ext === 'jpg' ? 'jpeg' : ext
                                        })
                                    ]
                                })
                            ],
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            }
                        }),
                        // Right cell: Text
                        new TableCell({
                            width: { size: 70, type: WidthType.PERCENTAGE },
                            verticalAlign: "center",
                            margins: {
                                top: 200,    // Add 200 twips (about 0.14 inches) of padding
                                bottom: 200,
                                left: 0,
                                right: 0
                            },
                            children: textParagraphs,
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            }
                        })
                    ]
                })
            ]
        });
        
        paragraphs.push(preparedByTable);
        
    } else {
        // No logo2, just add the text centered as before
        const preparedByLines = [
            "Prepared By",
            "stackArmor",
            "11950 Democracy Dr.",
            "Suite 650",
            "Reston, VA 20190"
        ];
        
        for (const line of preparedByLines) {
            paragraphs.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
                children: [new TextRun({ text: line, size: 22 })]
            }));
        }
    }
    
    // END Prepared By Section
    
    // Four blank lines before Revision History
    for (let i = 0; i < 4; i++) {
        paragraphs.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } }));
    }
    
    // Revision History heading
    paragraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Revision History", bold: true, size: 24 })]
    }));
    
    return paragraphs;
}

// Parse markdown table
function parseTable(lines, startIdx) {
    const rows = [];
    let i = startIdx;
    
    while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(c => c);
        // Only collect actual content rows, skipping the separator line
        if (cells.length > 0 && !lines[i].trim().match(/^\|[-:\s]+\|/)) {
            rows.push(cells);
        }
        i++;
    }
    
    return { rows, endIdx: i };
}

// Create table from parsed data
function createTable(rows, headerColor = null) {
    const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
    
    // Find the maximum number of columns across all rows
    const numCols = Math.max(...rows.map(row => row.length));
    
    // Set custom column widths for 2-column tables (30% / 70% split)
    // For other column counts, divide equally
    let columnWidths;
    let colWidth;
    
    if (numCols === 2) {
        columnWidths = [3744, 5616];  // 30% and 70% of 9360
        colWidth = 4680;  // Average for cell width calculations
    } else {
        colWidth = Math.floor(9360 / numCols);
        columnWidths = new Array(numCols).fill(colWidth);
    }
    
    const tableRows = rows.map((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    // Use custom header color if provided, otherwise default to gray (D9D9D9)
    const headerFillColor = headerColor ? headerColor.replace(/^#/, '') : "D9D9D9";
    const shading = isHeader ? { fill: headerFillColor, type: ShadingType.CLEAR, color: "auto" } : undefined;
    
    // Create cells for this row
    const cells = row.map((cellText, colIdx) => new TableCell({
        borders: cellBorders,
        width: { size: columnWidths[colIdx] || colWidth, type: WidthType.DXA },
        shading,
        children: [new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: cellText, bold: isHeader, size: 20 })]
        })]
    }));
    
    // If this row has fewer cells than numCols, merge the first cell to span all columns
    if (row.length < numCols && row.length === 1) {
        const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
        cells[0] = new TableCell({
            borders: cellBorders,
            width: { size: totalWidth, type: WidthType.DXA },
            columnSpan: numCols,
            shading,
            children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: row[0], bold: isHeader, size: 20 })]
            })]
        });
    }
    
    return new TableRow({
        tableHeader: isHeader,
        children: cells
    });
});
    
    return new Table({
        columnWidths,
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: tableRows
    });
}

// Process markdown content after cover page
function processContent(content, headerColor = null) {
    const paragraphs = [];
    let lines = content.split('\n');
    let i = 0;
    let skipUntilRevisionHistory = true;
    
    while (i < lines.length) {
        let line = lines[i].trim();
        
        // Skip HTML tags and content until we find Revision History
        if (skipUntilRevisionHistory) {
            if (line.startsWith('#### Revision History') || line.startsWith('## Revision History')) {
                // Stop skipping, and also skip the table that immediately follows (so it doesn't duplicate)
                skipUntilRevisionHistory = false;
                i++; // move past heading
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    i++;
                }
                continue;
            }
            i++;
            continue;
        }
        
        // --- START PAGE BREAK FIXES ---
        
        // 1. Document Review heading - No manual page break needed here since the section break is after the cover page
        if (line.startsWith('## Document Review and Modification Statement')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun(line.replace(/^##\s*/, ''))]
            }));
            i++;
            continue;
        }
        
        // 2. Page break right before the SPECIFIC TEXT "1. Document Overview"
        // This regex specifically targets the exact wording you requested.
        if (line.match(/^###\s*1\.\d*\s*Document Overview/)) { 
            paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_2, // Keep as H2 to match the original markdown
                children: [new TextRun(line.replace(/^###\s*/, ''))]
            }));
            i++;
            continue;
        }

        // 3. Page break right before major Section 4 heading (e.g., "### 4.0 Awareness...")
        // This logic is kept because you confirmed it was working and only requested a change to the Section 1 rule.
        if (line.match(/^###\s*4(\.\d+)?\s*/)) { 
             paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
             paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_2, // Keep as H2 to match the original markdown
                children: [new TextRun(line.replace(/^###\s*/, ''))]
            }));
            i++;
            continue;
        }
        
        // --- END PAGE BREAK FIXES ---
        
        // Tables
        if (line.startsWith('|')) {
            const { rows, endIdx } = parseTable(lines, i);
            if (rows.length > 0) {
                // Check if the previous line (if it exists and isn't empty) should be the table header
                let tableHeaderText = null;
                if (i > 0) {
                    const prevLine = lines[i - 1].trim();
                    // If previous line is plain text (not empty, not a heading, not HTML)
                    if (prevLine && !prevLine.startsWith('#') && !prevLine.startsWith('<') && !prevLine.startsWith('|')) {
                        tableHeaderText = prevLine;
                        // Remove the last added paragraph since we'll incorporate it into the table
                        if (paragraphs.length > 0) {
                            paragraphs.pop();
                        }
                    }
                }
                
                // If we found a header, prepend it to rows as a single-cell row
                if (tableHeaderText) {
                    rows.unshift([tableHeaderText]);
                }
                
                paragraphs.push(createTable(rows, headerColor));
            }
            i = endIdx;
            continue;
        }
        
        // Headings (ensure these are only hit if not caught by conditional breaks above)
        if (line.startsWith('####')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_3,
                children: [new TextRun(line.replace(/^####\s*/, ''))]
            }));
        } else if (line.startsWith('###')) {
            // This captures all other H3 headings that don't match the specific break rules above.
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun(line.replace(/^###\s*/, ''))]
            }));
        } else if (line.startsWith('##')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun(line.replace(/^##\s*/, ''))]
            }));
        } else if (line.startsWith('#')) {
            paragraphs.push(new Paragraph({
                heading: HeadingLevel.TITLE,
                children: [new TextRun(line.replace(/^#\s*/, ''))]
            }));
        }
        // Bullet points
        else if (line.match(/^[-*]\s+/)) {
            // Strip HTML tags like <br>, <br/>, <br />
            const cleanLine = line.replace(/^[-*]\s+/, '').replace(/<br>|<br\/>|<br \/>/gi, '').trim();
            paragraphs.push(new Paragraph({
                children: [new TextRun(cleanLine)],
                bullet: { level: 0 }
            }));
        }
        // Regular paragraphs
        else if (line && !line.startsWith('<')) {
            // Strip HTML tags like <br>, <br/>, <br />
            const cleanLine = line.replace(/<br>|<br\/>|<br \/>/gi, '').trim();
            if (!cleanLine) {
                i++;
                continue;
            }
            
            // Handle bold text
            let textParts = [];
            let remaining = cleanLine;
            const boldRegex = /\*\*(.+?)\*\*/g;
            let lastIdx = 0;
            let match;
            
            while ((match = boldRegex.exec(cleanLine)) !== null) {
                if (match.index > lastIdx) {
                    textParts.push(new TextRun({ text: cleanLine.substring(lastIdx, match.index), size: 22 }));
                }
                textParts.push(new TextRun({ text: match[1], bold: true, size: 22 }));
                lastIdx = match.index + match[0].length;
            }
            
            if (lastIdx < cleanLine.length) {
                textParts.push(new TextRun({ text: cleanLine.substring(lastIdx), size: 22 }));
            }
            
            if (textParts.length === 0) {
                textParts.push(new TextRun({ text: cleanLine, size: 22 }));
            }
            
            paragraphs.push(new Paragraph({ children: textParts }));
        }
        // Empty lines
        else if (!line) {
            paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
        }
        
        i++;
    }
    
    return paragraphs;
}

// Main conversion function
async function convertMdToDocx(inputPath, outputPath, logoPath1 = null, logoPath2 = null) {
    const content = fs.readFileSync(inputPath, 'utf8');
    const { frontmatter, content: mdContent } = parseMarkdown(content);
    
    // Extract table header color from frontmatter (supports both 'tableHeaderColor' and 'table_header_color')
    const headerColor = frontmatter.tableHeaderColor || frontmatter.table_header_color || null;
    
    const coverInfo = extractCoverPageInfo(mdContent);
    const coverParagraphs = createCoverPage(coverInfo, logoPath1, logoPath2);
    
    // Find and extract revision history table from content (for cover page only)
    const contentLines = mdContent.split('\n');
    let revisionTableStart = -1;
    let revisionTableEnd = -1;
    
    for (let i = 0; i < contentLines.length; i++) {
        const trimmedLine = contentLines[i].trim();
        if (trimmedLine.startsWith('#### Revision History') || trimmedLine.startsWith('## Revision History')) {
            // Find the table that follows
            for (let j = i + 1; j < contentLines.length; j++) {
                if (contentLines[j].trim().startsWith('|')) {
                    revisionTableStart = j;
                    break;
                }
            }
            // Find end of table
            if (revisionTableStart !== -1) {
                for (let j = revisionTableStart; j < contentLines.length; j++) {
                    if (!contentLines[j].trim().startsWith('|')) {
                        revisionTableEnd = j;
                        break;
                    }
                }
            }
            break;
        }
    }
    
    // Add revision history table to cover page
    if (revisionTableStart !== -1) {
        const tableLines = contentLines.slice(revisionTableStart, revisionTableEnd);
        const { rows } = parseTable(tableLines, 0);
        if (rows.length > 0) {
            coverParagraphs.push(createTable(rows, headerColor));
        }
    }
    
    // Process remaining content (now skips the second revision table)
    const contentParagraphs = processContent(mdContent, headerColor);
    
    // Create document with two sections: cover page and content
    const doc = new Document({
        styles: {
            default: {
                document: { run: { font: "Arial", size: 22 } }
            },
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { size: 28, bold: true, color: "000000", font: "Arial" },
                    paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { size: 24, bold: true, color: "000000", font: "Arial" },
                    paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
                },
                {
                    id: "Heading3",
                    name: "Heading 3",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { size: 22, bold: true, color: "000000", font: "Arial" },
                    paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 }
                }
            ]
        },
        sections: [
            {
                // SECTION 1: COVER PAGE - NO HEADERS/FOOTERS
                properties: {
                    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
                },
                children: coverParagraphs
            },
            {
                // SECTION 2: MAIN CONTENT - NEW PAGE, WITH HEADERS/FOOTERS (the "Section Break")
                properties: {
                    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: `${coverInfo.customerName || ""}${coverInfo.appName ? " | " : ""}${coverInfo.appName || ""}${coverInfo.docTitle ? " | " : ""}${coverInfo.docTitle || ""}`, size: 16 }) // 8pt
                            ]
                        })]
                    })
                },
                footers: {
                    default: new Footer({
                        children: [
                            ...(coverInfo.copyright ? [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: coverInfo.copyright, size: 16 })] // 8pt
                            })] : []),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "Page ", size: 16 }), // 8pt
                                    new TextRun({ children: [PageNumber.CURRENT], size: 16 }) // 8pt
                                ]
                            })
                        ]
                    })
                },
                children: contentParagraphs
            }
        ]
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Converted: ${inputPath} → ${outputPath}`);
}

// Run conversion
const args = process.argv.slice(2);
if (args.length < 2 || args.length > 4) {
    console.error('Usage: node md_to_docx.js <input.md> <output.docx> [logo1.png] [logo2.png]');
    console.error('  logo1.png (optional): Logo to appear above customer name');
    console.error('  logo2.png (optional): Logo to appear above "Prepared By"');
    process.exit(1);
}

const logoPath1 = args.length >= 3 ? args[2] : null;
const logoPath2 = args.length >= 4 ? args[3] : 'sATytoLogo.png';

convertMdToDocx(args[0], args[1], logoPath1, logoPath2).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});