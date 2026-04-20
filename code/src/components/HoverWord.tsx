import { useState, useRef } from 'react';
import { WordObject } from '../types';
import { getDictionaryDefinition } from '../services/dictionaryService';
import { motion, AnimatePresence } from 'motion/react';
// Remove BookOpen as we are matching the new unified header style

interface HoverWordProps {
  key?: number | string;
  word: string;
  isPunctuation: boolean;
  userWords: WordObject[];
  usedWordMeta?: { word: string; isExtended: boolean; };
  highlightMode: 'VISIBLE' | 'HIDDEN';
}

// Map long POS to standard short abbreviations
const posMap: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  preposition: 'prep.',
  conjunction: 'conj.',
  interjection: 'int.',
  trans: '译',
  '名词': 'n.',
  '动词': 'v.',
  '及物动词': 'vt.',
  '不及物动词': 'vi.',
  '形容词': 'adj.',
  '副词': 'adv.',
  '代名词': 'pron.',
  '代词': 'pron.',
  '前置词': 'prep.',
  '介词': 'prep.',
  '连词': 'conj.',
  '感叹词': 'int.',
};

export function HoverWord({ word, isPunctuation, userWords, usedWordMeta, highlightMode }: HoverWordProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [dictDef, setDictDef] = useState<any>(null);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  
  const spanRef = useRef<HTMLSpanElement>(null);

  const matchedUserWord = usedWordMeta ? userWords.find(w => w.word.toLowerCase() === usedWordMeta.word.toLowerCase()) : undefined;

  const handleMouseEnter = async () => {
    if (isPunctuation) return;
    
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      if (rect.top < 220) {
        setTooltipPosition('bottom');
      } else {
        setTooltipPosition('top');
      }
    }

    setIsHovered(true);

    if (!matchedUserWord && !dictDef && !isLoadingDict) {
      setIsLoadingDict(true);
      const def = await getDictionaryDefinition(word);
      setDictDef(def);
      setIsLoadingDict(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isPunctuation) {
    return <span className="text-text-primary">{word}</span>;
  }

  const isHighlighted = highlightMode === 'VISIBLE' && matchedUserWord;
  // Replace Tailwind /20 opacity with explicit hex/rgba to prevent html2canvas color-mix() parsing crash
  const highlightClass = isHighlighted ? 'text-[#0071e3] font-semibold border-b-[2px] border-[rgba(0,113,227,0.2)]' : 'text-text-primary';

  const positionClasses = tooltipPosition === 'top' 
    ? "bottom-full mb-3" 
    : "top-full mt-3";

  return (
    <span 
      ref={spanRef}
      className={`relative inline-block cursor-help transition-colors ${highlightClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {word}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: tooltipPosition === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === 'top' ? 5 : -5, scale: 0.98 }}
            className={`absolute left-1/2 -translate-x-1/2 w-[280px] p-4 rounded-[16px] glass-panel z-50 pointer-events-none text-left ${positionClasses}`}
          >
            {/* Unified Header replacing the split condition */}
            <div className="flex items-center justify-between mb-3 border-b border-black/[0.04] pb-2">
              <span className="font-bold text-[18px] text-text-primary text-transform: capitalize">{matchedUserWord ? matchedUserWord.word : word}</span>
              {matchedUserWord ? (
                <span className="text-[10px] bg-[#E1F0FF]/80 text-apple-blue font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wider shrink-0">目标词</span>
              ) : (
                <span className="text-[10px] bg-black/5 text-text-secondary font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wider shrink-0">词典释义</span>
              )}
            </div>

            {matchedUserWord ? (
               <div>
                  <div className="text-[14px] text-text-secondary mt-2 whitespace-pre-wrap leading-[1.6]">
                    {matchedUserWord.originalDef}
                  </div>
                  
                  {usedWordMeta?.isExtended && (
                    <div className="mt-3 pt-3 border-t border-black/[0.04]">
                      <div className="text-[11px] text-apple-blue/80 font-bold uppercase tracking-[0.05em] mb-1">延伸语境</div>
                      <div className="text-[13px] text-text-secondary leading-[1.6]">结合当前文章巧妙推导出的潜台词或深层含义。</div>
                    </div>
                  )}
               </div>
            ) : (
               <div>
                  {isLoadingDict ? (
                    <div className="space-y-2 mt-2">
                      <div className="h-2 w-3/4 bg-black/5 rounded animate-pulse" />
                      <div className="h-2 w-1/2 bg-black/5 rounded animate-pulse" />
                      <div className="h-2 w-5/6 bg-black/5 rounded animate-pulse" />
                    </div>
                  ) : dictDef && dictDef.meanings ? (
                    <div className="flex flex-col gap-2.5 mt-1">
                      {dictDef.meanings.slice(0, 3).map((meaning: any, index: number) => {
                        const shortPos = posMap[meaning.partOfSpeech] || meaning.partOfSpeech + '.';
                        const def = meaning.definitions?.[0]?.definition || "暂无释义";
                        return (
                          <div key={index} className="flex items-start text-[14px] leading-[1.5]">
                            <span className="w-10 shrink-0 text-text-secondary/80 font-mono text-[13px] mt-[1px]">{shortPos}</span>
                            <span className="flex-1 text-text-secondary line-clamp-2">{def}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[13px] text-text-secondary mt-2">检索未命中或暂无网络连接</p>
                  )}
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
