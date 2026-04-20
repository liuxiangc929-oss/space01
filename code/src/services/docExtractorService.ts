import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Vite syntax to load the worker file safely
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { WordObject } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const strictPosPattern = /^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|phr)$/i;

function cleanWordStrict(raw: string) {
  let cleaned = raw.replace(/^[0-9\.\-\)\]•\s]+/, '').trim();
  const parts = cleaned.split(/\s+/);
  while(parts.length > 1 && strictPosPattern.test(parts[parts.length-1].replace(/[^a-zA-Z]/g,''))) {
    parts.pop();
  }
  return parts.join(' ');
}

function extractWordAndMeaning(beforeChinese: string, meaning: string) {
  const phraseMatch = beforeChinese.match(/(?:^\s*(?:\d+[\.\)\]]*|[-•])?\s*)([a-zA-Z]+(?:[-'][a-zA-Z]+)*(?:\s+[a-zA-Z]+(?:[-'][a-zA-Z]+)*)*)/);
  if (!phraseMatch) return null;
  
  let wordsList = phraseMatch[1].split(/\s+/);
  while (wordsList.length > 1) {
    const last = wordsList[wordsList.length - 1].replace(/[^a-zA-Z]/g, '');
    if (strictPosPattern.test(last)) {
      wordsList.pop();
    } else {
      break;
    }
  }
  
  if (wordsList.length === 0) return null;
  
  const targetWord = wordsList.join(' ');
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRegex = new RegExp("(^|\\s*\\d*[\\.\\)\\]\\-•]*\\s*)" + escapeRegExp(targetWord) + "\\s*", "i");
  let remainingBefore = beforeChinese.replace(wordRegex, '').trim();
  
  const def = remainingBefore ? `${remainingBefore} ${meaning}` : meaning;
  return { word: targetWord, def };
}

// Shared text parsing logic
export function parseTextToWords(text: string): WordObject[] {
  const lines = text.split('\n');
  const wordObjects: WordObject[] = [];
  let lastWord: WordObject | null = null;
  let pendingEnglishWord = '';
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const chineseMatch = cleanLine.match(/([\u4e00-\u9fa5]+.*)/);
    
    // --- NO CHINESE ON THIS LINE ---
    if (!chineseMatch) {
      // Check if it's a standalone vocabulary word awaiting a definition line
      const isStandalone = /^(?:\d+[\.\)\]]*|[-•])?\s*([a-zA-Z]+(?:[-'][a-zA-Z]+)*(?:\s+[a-zA-Z]+(?:[-'][a-zA-Z]+)*){0,4})\s*$/.test(cleanLine);
      
      const justLetters = cleanLine.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/).filter(Boolean);
      const allTokensArePos = justLetters.length > 0 && justLetters.every(t => strictPosPattern.test(t));

      if (isStandalone && !allTokensArePos) {
        // It's a new word!
        pendingEnglishWord = (pendingEnglishWord ? pendingEnglishWord + ' ' : '') + cleanLine;
      } else {
        // It's part of a translation spanning multiple lines (either POS alone, or english text)
        if (lastWord) {
          lastWord.originalDef += '\n' + cleanLine;
        }
      }
      continue;
    }

    // --- CHINESE FOUND ---
    const meaning = chineseMatch[1].trim();
    const beforeChinese = cleanLine.substring(0, chineseMatch.index).trim();
    
    const justLettersBefore = beforeChinese.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/).filter(Boolean);
    let isContLine = false;
    
    if (justLettersBefore.length === 0) {
      isContLine = true;
    } else {
      const allTokensArePos = justLettersBefore.every(t => strictPosPattern.test(t));
      if (allTokensArePos) {
        const firstMatch = beforeChinese.match(/^[A-Za-z]+/);
        const firstWord = firstMatch ? firstMatch[0].toLowerCase() : '';
        // Protect common English words that happen to share POS abbreviations (e.g. "art")
        if (/^(art|pro|con|in|num)$/.test(firstWord) && !beforeChinese.replace(/\s+/g,'').startsWith(firstWord+'.')) {
          isContLine = false;
        } else {
          isContLine = true;
        }
      }
    }

    // If we have a pending word, we must resolve it.
    if (pendingEnglishWord) {
      let targetWord = '';
      let formattedLineMeaning = '';
      
      if (!isContLine) {
        // The current line has its own word!
        const extraction = extractWordAndMeaning(beforeChinese, meaning);
        if (extraction) {
          targetWord = extraction.word;
          formattedLineMeaning = extraction.def;
        } else {
          targetWord = cleanWordStrict(pendingEnglishWord);
          formattedLineMeaning = beforeChinese ? `${beforeChinese} ${meaning}` : meaning;
        }
      } else {
        // Current line is just a translation block for the pending word
        targetWord = cleanWordStrict(pendingEnglishWord);
        const cleanBefore = beforeChinese.replace(/^[\s\d\.\-\)\]•]+/, '').trim();
        const prefix = cleanBefore ? `${cleanBefore} ` : '';
        formattedLineMeaning = prefix + meaning;
      }
      
      if (targetWord) {
        const newWord: WordObject = {
          id: crypto.randomUUID(),
          word: targetWord.toLowerCase(),
          pos: '',
          originalDef: formattedLineMeaning,
          isUserWord: true,
        };
        wordObjects.push(newWord);
        lastWord = newWord;
      }
      pendingEnglishWord = '';
      continue;
    }

    // No pending word
    if (isContLine) {
      if (lastWord) {
        const cleanBefore = beforeChinese.replace(/^[\s\d\.\-\)\]•]+/, '').trim();
        const prefix = cleanBefore ? `${cleanBefore} ` : '';
        lastWord.originalDef += '\n' + prefix + meaning;
      }
    } else {
      const extraction = extractWordAndMeaning(beforeChinese, meaning);
      if (extraction) {
        const newWord: WordObject = {
          id: crypto.randomUUID(),
          word: extraction.word.toLowerCase(),
          pos: '',
          originalDef: extraction.def,
          isUserWord: true,
        };
        wordObjects.push(newWord);
        lastWord = newWord;
      } else if (lastWord) {
        lastWord.originalDef += '\n' + cleanLine;
      }
    }
  }
  
  return wordObjects;
}

export async function extractWordsFromDocx(file: File): Promise<WordObject[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return parseTextToWords(result.value);
  } catch (error) {
    console.error("DOCX Extraction Error: ", error);
    throw error;
  }
}

export async function extractWordsFromPdf(file: File): Promise<WordObject[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map((item: any) => item.str);
        fullText += strings.join(' ') + '\n';
    }
    
    return parseTextToWords(fullText);
  } catch (error) {
    console.error("PDF Extraction Error: ", error);
    throw error;
  }
}
