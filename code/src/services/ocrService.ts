import Tesseract from 'tesseract.js';
import { WordObject } from '../types';
import { parseTextToWords } from './docExtractorService';

// Prepares image: grayscale + contrast (makes OCR more accurate)
export function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        // Apply filters
        ctx.filter = 'grayscale(100%) contrast(150%)';
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract words using rigorous regex
export async function extractWordsFromImage(file: File, onProgress: (p: number) => void): Promise<WordObject[]> {
  try {
    const processedImageData = await preprocessImage(file);
    
    const worker = await Tesseract.createWorker('eng+chi_sim');
    
    const { data: { text } } = await worker.recognize(processedImageData);
    await worker.terminate();

    return parseTextToWords(text);
  } catch (error) {
    console.error("OCR Error: ", error);
    throw error;
  }
}
