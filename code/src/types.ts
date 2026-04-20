export interface WordObject {
  id: string;
  word: string;
  pos: string;
  originalDef: string;
  isUserWord: boolean;
}

export type ViewMode = 'BILINGUAL' | 'SPLIT' | 'ENGLISH_ONLY';
export type HighlightMode = 'VISIBLE' | 'HIDDEN';
export type Difficulty = '高考' | 'CET-4' | 'CET-6' | '考研' | 'IELTS' | 'TOEFL';

export interface GeneratedSentence {
  english: string;
  chinese: string;
  usedWords: {
    word: string;
    isExtended: boolean;
  }[];
}

export interface GeneratedArticle {
  sentences: GeneratedSentence[];
}
