/**
 * Extract plain text from a PDF buffer (Node / Vercel safe).
 * Uses pdf-parse v1 — v2 pulls in pdf.js which needs DOMMatrix in the browser.
 */
async function extractPdfText(buffer) {
  if (!buffer?.length) {
    throw new Error("Empty PDF file");
  }

  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text?.trim() || "";
}

module.exports = { extractPdfText };
