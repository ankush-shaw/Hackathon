import Tesseract from 'tesseract.js';
import type { OcrTextBlock, BoundingBox } from '../types/index.js';

export interface OcrExtractionResult {
  fullText: string;
  overallConfidence: number; // 0 - 100
  textBlocks: OcrTextBlock[];
  linesCount: number;
}

/**
 * Perform Optical Character Recognition (OCR) with bounding boxes using Tesseract.js
 */
export async function performOcrAnalysis(imageBuffer: Buffer): Promise<OcrExtractionResult> {
  try {
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: () => {} // quiet mode
      }
    );

    const { data } = result;
    const fullText = (data.text || '').trim();
    const overallConfidence = Math.round(data.confidence || 0);

    const textBlocks: OcrTextBlock[] = [];

    // Extract lines and blocks with bounding boxes
    if (data.lines && data.lines.length > 0) {
      data.lines.forEach((line, index) => {
        const text = line.text.trim();
        // Ignore single stray symbols or empty lines
        if (text.length >= 2 && line.confidence > 15) {
          const bbox: BoundingBox = {
            x0: line.bbox.x0,
            y0: line.bbox.y0,
            x1: line.bbox.x1,
            y1: line.bbox.y1,
            width: Math.max(1, line.bbox.x1 - line.bbox.x0),
            height: Math.max(1, line.bbox.y1 - line.bbox.y0)
          };

          textBlocks.push({
            id: `ocr-line-${index}-${line.bbox.x0}-${line.bbox.y0}`,
            text,
            confidence: Math.round(line.confidence),
            bbox,
            lineIndex: index
          });
        }
      });
    }

    // Fallback: If no lines were parsed, create a default bounding box for the full text
    if (textBlocks.length === 0 && fullText.length > 0) {
      textBlocks.push({
        id: `ocr-full-${Date.now()}`,
        text: fullText,
        confidence: overallConfidence,
        bbox: {
          x0: 10,
          y0: 10,
          x1: 200,
          y1: 50,
          width: 190,
          height: 40
        }
      });
    }

    return {
      fullText,
      overallConfidence,
      textBlocks,
      linesCount: textBlocks.length
    };
  } catch (err: any) {
    console.error('Tesseract OCR Error:', err?.message || err);
    return {
      fullText: '',
      overallConfidence: 0,
      textBlocks: [],
      linesCount: 0
    };
  }
}
