import { NextRequest, NextResponse } from "next/server";
import { INITIAL_BOOKS } from "@/lib/seed-data";

/**
 * Creates a valid minimal multi-page PDF binary (PDF-1.4 spec)
 * with chapter titles, solved examples, and exam notes for ExamKart reader.
 */
function generateSamplePdfBuffer(title: string, category: string, isSample: boolean = false): Uint8Array {
  const pagesCount = isSample ? 5 : 12;
  const headerTitle = title || "ExamKart Digital E-Book";
  const subCategory = category || "Competitive Exams";

  let objects: string[] = [];
  
  // Obj 1: Catalog
  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;
  
  // Obj 3: Font
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`;
  objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`;

  const pageObjIds: number[] = [];
  let nextObjId = 5;

  for (let p = 1; p <= pagesCount; p++) {
    const pageObjId = nextObjId++;
    const contentObjId = nextObjId++;
    pageObjIds.push(pageObjId);

    const isCover = p === 1;
    const isWatermarkSample = isSample && p > 3;

    let streamText = "";
    if (isCover) {
      streamText = `
BT
/F2 22 Tf
50 720 Td
(${headerTitle.replace(/[()]/g, "")}) Tj
/F1 12 Tf
0 -30 Td
(Category: ${subCategory.replace(/[()]/g, "")} - Official Study Material) Tj
/F1 10 Tf
0 -20 Td
(Publisher: ExamKart Digital Publications - 2026 Edition) Tj
0 -40 Td
(---------------------------------------------------------------------------------------------------) Tj
0 -30 Td
/F2 14 Tf
(CHAPTER INDEX & STUDY GUIDE) Tj
/F1 11 Tf
0 -25 Td
(1. Core Principles & Fundamental Shortcuts ......................... Page 2) Tj
0 -20 Td
(2. Solved Previous Year Questions & Formulas ....................... Page 3) Tj
0 -20 Td
(3. High-Frequency Practice Sets & Solutions ........................ Page 4) Tj
0 -20 Td
(4. Speed Drills & Final Exam Strategy .............................. Page 5) Tj
0 -40 Td
/F1 10 Tf
(Instructions: Scroll or pinch-to-zoom for crystal clear vector rendering.) Tj
ET
`;
    } else {
      const chapterNum = Math.min(p - 1, 4);
      streamText = `
BT
/F2 10 Tf
50 750 Td
(ExamKart Digital Reader - ${headerTitle.replace(/[()]/g, "")}) Tj
50 735 Td
(---------------------------------------------------------------------------------------------------) Tj
/F2 16 Tf
50 700 Td
(Chapter ${chapterNum}: Key Concepts & Practice Questions) Tj
/F1 11 Tf
0 -30 Td
(To excel in ${subCategory.replace(/[()]/g, "")} competitive examinations, mastering systematic shortcuts) Tj
0 -18 Td
(and conceptual clarity is critical. Review the solved examples below:) Tj
0 -30 Td
/F2 12 Tf
(Q${(p-1)*2 - 1}. Sample Solved Question with Explanation) Tj
/F1 10 Tf
0 -20 Td
(Statement: Calculate the efficiency ratio and relative velocity given distance d=150m.) Tj
0 -15 Td
(Solution: Speed = Distance / Time. Therefore, S = 150m / 10s = 15 m/s = 54 km/h.) Tj
0 -30 Td
/F2 12 Tf
(Q${(p-1)*2}. High-Yield Formula & Concept Review) Tj
/F1 10 Tf
0 -20 Td
(1. Compound Interest Shortcut: A = P * \(1 + r/100\)^n) Tj
0 -15 Td
(2. Trigonometric Identity: sin^2\(x\) + cos^2\(x\) = 1) Tj
0 -15 Td
(3. Percentage Change Formula: \(\(New - Old\) / Old\) * 100) Tj
0 -40 Td
${isWatermarkSample ? `/F2 14 Tf\n(*** FREE SAMPLE PREVIEW - UNLOCK FULL E-BOOK TO CONTINUE ***) Tj\n0 -20 Td\n` : ""}
/F1 10 Tf
50 50 Td
(Page ${p} of ${pagesCount} | ExamKart E-Book) Tj
ET
`;
    }

    const streamBytes = new TextEncoder().encode(streamText.trim());
    objects[contentObjId] = `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamText.trim()}\nendstream\nendobj`;
    objects[pageObjId] = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`;
  }

  // Obj 2: Pages
  const pageKidsStr = pageObjIds.map(id => `${id} 0 R`).join(" ");
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageKidsStr}] /Count ${pagesCount} >>\nendobj`;

  // Build PDF structure
  let pdfString = `%PDF-1.4\n`;
  let xrefOffsets: number[] = [0];

  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue;
    xrefOffsets[i] = new TextEncoder().encode(pdfString).length;
    pdfString += objects[i] + "\n";
  }

  const xrefStart = new TextEncoder().encode(pdfString).length;
  pdfString += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) {
    const offsetStr = (xrefOffsets[i] || 0).toString().padStart(10, "0");
    pdfString += `${offsetStr} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new TextEncoder().encode(pdfString);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url") || searchParams.get("file");
  const bookId = searchParams.get("bookId");
  const type = searchParams.get("type") || "sample";

  // 1. If targetUrl is a full external URL, attempt to proxy fetch it
  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": buffer.byteLength.toString(),
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    } catch (err) {
      console.warn("Proxy fetch failed for targetUrl:", targetUrl, err);
    }
  }

  // 2. Identify book details or use defaults
  let title = "ExamKart E-Book";
  let category = "Competitive Exams";

  if (bookId) {
    const matched = INITIAL_BOOKS.find(b => b.id === bookId || b.slug === bookId);
    if (matched) {
      title = matched.title;
      category = matched.category;
    }
  } else if (targetUrl) {
    const filename = decodeURIComponent(targetUrl).split("/").pop() || "";
    if (filename) {
      title = filename.replace(/\.(pdf|epub)$/i, "").replace(/_/g, " ").toUpperCase();
    }
  }

  const isSample = type === "sample" || targetUrl?.includes("sample");
  const pdfBytes = generateSamplePdfBuffer(title, category, isSample);

  return new NextResponse(pdfBytes.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": pdfBytes.byteLength.toString(),
      "Cache-Control": "public, max-age=3600"
    }
  });
}
