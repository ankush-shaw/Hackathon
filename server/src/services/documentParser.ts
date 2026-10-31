import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  wordCount: number;
  extractedFactsSummary?: string;
}

export async function parseDocumentFile(filePath: string, mimeType: string): Promise<ParsedDocument> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  // Handle plain text files
  if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
    const rawText = fs.readFileSync(filePath, 'utf-8');
    const words = rawText.trim().split(/\s+/).filter(Boolean).length;
    return {
      text: rawText,
      pageCount: 1,
      wordCount: words,
      extractedFactsSummary: rawText.slice(0, 300)
    };
  }

  // Handle PDF files
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    let extractedText = '';
    let pageCount = 1;

    if (typeof pdf === 'function') {
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } else if (pdf && typeof pdf.PDFParse === 'function') {
      const parser = new pdf.PDFParse({ data: dataBuffer });
      try {
        const textResult = await parser.getText();
        extractedText = textResult?.text || '';
        pageCount = textResult?.total || 1;
      } finally {
        await parser.destroy();
      }
    } else {
      throw new Error('PDF parsing engine could not be initialized.');
    }

    const words = extractedText.trim().split(/\s+/).filter(Boolean).length;
    return {
      text: extractedText,
      pageCount,
      wordCount: words,
      extractedFactsSummary: extractedText.replace(/\s+/g, ' ').slice(0, 400)
    };
  }

  throw new Error(`Unsupported document format: ${mimeType}. Supported formats: PDF, TXT.`);
}
