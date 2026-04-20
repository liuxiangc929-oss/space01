import React, { useState, useRef } from 'react';
import { WordObject, GeneratedArticle, ViewMode, HighlightMode, GeneratedSentence } from '../types';
import { HoverWord } from './HoverWord';
import { Layers, SplitSquareHorizontal, FileText, Eye, EyeOff, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const tokenize = (text: string) => {
  return Array.from(text.matchAll(/([a-zA-Z]+(?:'[a-zA-Z]+)?)|([^a-zA-Z]+)/g)).map((m, i) => {
    return {
        id: i,
        isWord: !!m[1],
        text: m[0],
    }
  });
};

function renderSentenceText(sentence: GeneratedSentence, userWords: WordObject[], highlightMode: HighlightMode) {
  const tokens = tokenize(sentence.english);
  
  // Create a quick lookup for used words in this sentence
  // Note: Simple heuristic to match base forms roughly 
  const wordLookup = (tokenText: string) => {
    const lowercaseToken = tokenText.toLowerCase();
    return sentence.usedWords.find(uw => 
      lowercaseToken.startsWith(uw.word.toLowerCase().replace(/e$/, '')) || 
      lowercaseToken === uw.word.toLowerCase()
    );
  };

  return (
    <>
      {tokens.map(token => {
        const usedWordMeta = token.isWord ? wordLookup(token.text) : undefined;
        return (
          <HoverWord 
             key={token.id}
             word={token.text}
             isPunctuation={!token.isWord}
             userWords={userWords}
             usedWordMeta={usedWordMeta}
             highlightMode={highlightMode}
          />
        );
      })}
    </>
  );
}

export function ArticlePhase({ 
  article, 
  words,
  viewMode,
  highlightMode,
  setViewMode,
  setHighlightMode
}: { 
  article: GeneratedArticle,
  words: WordObject[],
  viewMode: ViewMode,
  highlightMode: HighlightMode,
  setViewMode: (m: ViewMode) => void,
  setHighlightMode: (h: HighlightMode) => void
}) {
  const [showSidebarDefs, setShowSidebarDefs] = useState(true);
  const [revealedWordIds, setRevealedWordIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const toggleGlobalDefs = () => {
    setShowSidebarDefs(!showSidebarDefs);
    // Reset individual reveals when toggling the global state
    setRevealedWordIds(new Set());
  };

  const toggleRevealIndividual = (id: string) => {
    if (showSidebarDefs) return; // Only does something if global defs are hidden
    setRevealedWordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 100)); // small delay for UI to paint loader

    try {
      // 1. Construct a completely pure data-driven DOM node for PDF.
      // This eliminates ANY chance of framer-motion, z-index clipping, or advanced CSS filters causing white screens.
      
      const pdfRoot = document.createElement('div');
      Object.assign(pdfRoot.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '800px',
        padding: '50px 60px',
        backgroundColor: '#ffffff',
        color: '#1d1d1f',
        fontFamily: "'Inter', sans-serif",
        zIndex: '-9999', // Hide during render
      });

      // Title
      const title = document.createElement('h1');
      title.innerText = 'LexiFlow 英文精读材料';
      Object.assign(title.style, {
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '40px',
        color: '#111111'
      });
      pdfRoot.appendChild(title);

      // Render sentences based on ViewMode
      if (viewMode === 'BILINGUAL') {
        article.sentences.forEach(s => {
          const chunk = document.createElement('div');
          chunk.style.marginBottom = '32px';
          chunk.style.pageBreakInside = 'avoid'; // Crucial logic, avoids guillotine slicing

          const en = document.createElement('p');
          Object.assign(en.style, {
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '12px',
            color: '#1d1d1f'
          });

          // Text tokenization & highlight injection
          const tokens = tokenize(s.english);
          tokens.forEach(tok => {
            const span = document.createElement('span');
            span.innerText = tok.text;
            if (tok.isWord) {
              const isUserWord = words.find(w => w.isUserWord && w.word.toLowerCase() === tok.text.toLowerCase());
              if (isUserWord && highlightMode === 'VISIBLE') {
                span.style.color = '#0071e3';
                span.style.fontWeight = '600';
                span.style.borderBottom = '2px solid rgba(0, 113, 227, 0.2)';
              } else if (isUserWord && highlightMode === 'HIDDEN') {
                span.style.color = 'rgba(0,0,0,0.1)';
                span.style.backgroundColor = 'rgba(0,0,0,0.05)';
              }
            }
            en.appendChild(span);
          });
          chunk.appendChild(en);

          const zh = document.createElement('p');
          zh.innerText = s.chinese;
          Object.assign(zh.style, {
            fontSize: '15px',
            lineHeight: '1.7',
            color: '#86868b'
          });
          chunk.appendChild(zh);

          pdfRoot.appendChild(chunk);
        });
      } else if (viewMode === 'SPLIT') {
        const chunk = document.createElement('div');
        
        // English Section
        const enSection = document.createElement('div');
        enSection.style.marginBottom = '30px';
        article.sentences.forEach(s => {
          const tokens = tokenize(s.english);
          tokens.forEach(tok => {
            const span = document.createElement('span');
            span.innerText = tok.text;
            if (tok.isWord) {
              const isUserWord = words.find(w => w.isUserWord && w.word.toLowerCase() === tok.text.toLowerCase());
              if (isUserWord && highlightMode === 'VISIBLE') {
                span.style.color = '#0071e3';
                span.style.fontWeight = '600';
                span.style.borderBottom = '2px solid rgba(0, 113, 227, 0.2)';
              }
            }
            enSection.appendChild(span);
          });
          const space = document.createElement('span');
          space.innerText = ' ';
          enSection.appendChild(space);
        });
        Object.assign(enSection.style, {
          fontSize: '18px', lineHeight: '1.7', color: '#1d1d1f'
        });
        chunk.appendChild(enSection);

        // Divider
        const hr = document.createElement('hr');
        Object.assign(hr.style, {
          border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', marginBottom: '30px'
        });
        chunk.appendChild(hr);

        // Chinese Section
        const zhSection = document.createElement('div');
        zhSection.innerText = article.sentences.map(s => s.chinese).join(' ');
        Object.assign(zhSection.style, {
          fontSize: '15px', lineHeight: '1.8', color: '#86868b'
        });
        chunk.appendChild(zhSection);
        
        pdfRoot.appendChild(chunk);
      } else {
        const enSection = document.createElement('div');
        article.sentences.forEach(s => {
          const tokens = tokenize(s.english);
          tokens.forEach(tok => {
            const span = document.createElement('span');
            span.innerText = tok.text;
            if (tok.isWord) {
              const isUserWord = words.find(w => w.isUserWord && w.word.toLowerCase() === tok.text.toLowerCase());
              if (isUserWord && highlightMode === 'VISIBLE') {
                span.style.color = '#0071e3';
                span.style.fontWeight = '600';
                span.style.borderBottom = '2px solid rgba(0, 113, 227, 0.2)';
              }
            }
            enSection.appendChild(span);
          });
          const space = document.createElement('span');
          space.innerText = ' ';
          enSection.appendChild(space);
        });
        Object.assign(enSection.style, {
          fontSize: '18px', lineHeight: '1.7', color: '#1d1d1f'
        });
        pdfRoot.appendChild(enSection);
      }

      // Allow long renders by unlocking overflow temporarily
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'visible';
      document.documentElement.style.overflow = 'visible';

      document.body.appendChild(pdfRoot);

      const opt = {
        margin:       0,
        filename:     'LexiFlow-精读材料.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 800, backgroundColor: '#ffffff', logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        await html2pdf().set(opt).from(pdfRoot).save();
      } finally {
        document.body.removeChild(pdfRoot);
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        setIsExporting(false);
      }

    } catch (err) {
      console.error("PDF export setup failed", err);
      alert("抱歉，导出 PDF 失败，请稍后重试。");
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full max-w-7xl mx-auto flex-1 min-h-0 relative items-stretch">
      
      {/* Sidebar for Vocabulary List */}
      <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col glass-panel rounded-[32px] overflow-hidden min-h-0 relative z-10">
        <div className="flex-shrink-0 flex items-center justify-between p-6 pb-4 bg-white/20 border-b border-white/30 z-10 relative">
          <h3 className="text-[13px] font-semibold text-text-primary uppercase tracking-wider">自测词汇</h3>
          <button 
            onClick={toggleGlobalDefs} 
            className="text-[12px] bg-black/[0.04] text-text-secondary px-3.5 py-1.5 rounded-full font-medium hover:bg-black/[0.08] hover:text-text-primary transition-all border-none cursor-pointer tracking-tight"
          >
            {showSidebarDefs ? "隐藏释义" : "显示释义"}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar relative z-0">
          {words.filter(w => w.isUserWord).map(w => (
            <div key={w.id} className="flex items-start border-b border-black/[0.04] py-4.5 last:border-0 last:pb-0">
              <div className="w-[110px] flex-shrink-0 mr-4 pr-3 mt-0.5">
                <span className="font-semibold text-[15px] text-text-primary block break-words tracking-tight">{w.word}</span>
              </div>
              <div 
                className={`flex-1 transition-all ${!showSidebarDefs ? 'cursor-pointer group' : ''}`}
                onClick={() => toggleRevealIndividual(w.id)}
                title={!showSidebarDefs && !revealedWordIds.has(w.id) ? "点击显示释义" : ""}
              >
                {showSidebarDefs || revealedWordIds.has(w.id) ? (
                  <div className="text-[14px] text-text-secondary whitespace-pre-wrap leading-[1.6]">
                    {w.originalDef}
                  </div>
                ) : (
                  <div className="text-[18px] text-border-main/70 tracking-[6px] leading-[1.6] group-hover:text-text-secondary blur-[2px] transition-all duration-300 select-none mt-1">
                    ••••••
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Article Container */}
      <div className="flex-1 flex flex-col glass-acrylic rounded-[32px] overflow-hidden min-h-0 relative z-10">
        
        {/* Core Scrolling Region exactly inside the white container */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full relative pb-[100px]">
          
          <div ref={articleRef} className="p-4 -m-4">
            <AnimatePresence mode="wait">
              {viewMode === 'BILINGUAL' && (
                <motion.div 
                  key="bilingual"
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="space-y-10"
                >
                  {article.sentences.map((s, i) => (
                    <div key={i} className="mb-10">
                      <p className="text-[20px] font-sans text-text-primary leading-[1.6] mb-3 font-normal tracking-[-0.01em]">
                        {renderSentenceText(s, words, highlightMode)}
                      </p>
                      <p className="text-[16px] text-text-secondary font-sans leading-[1.7] tracking-wide">
                        {s.chinese}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {viewMode === 'SPLIT' && (
                <motion.div 
                  key="split"
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex flex-col gap-10"
                >
                  <div className="space-y-5">
                    {article.sentences.map((s, i) => (
                      <span key={i} className="text-[20px] font-sans text-text-primary leading-[1.6] mr-3 tracking-[-0.01em]">
                        {renderSentenceText(s, words, highlightMode)}
                      </span>
                    ))}
                  </div>
                  {/* Replace /50 with explicit hex to protect html2canvas parser */}
                  <div className="h-px w-full bg-[rgba(210,210,215,0.5)] my-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]" />
                  <div className="space-y-4 text-text-secondary">
                     {article.sentences.map((s, i) => (
                      <span key={i} className="text-[16px] font-sans leading-[1.7] mr-3 tracking-wide">
                        {s.chinese}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {viewMode === 'ENGLISH_ONLY' && (
                <motion.div 
                  key="english"
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="space-y-5"
                >
                  {article.sentences.map((s, i) => (
                    <span key={i} className="text-[20px] font-sans text-text-primary leading-[1.6] mr-3 tracking-[-0.01em]">
                      {renderSentenceText(s, words, highlightMode)}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          </div>
        </div>

        {/* Floating Capsule Toolbar stays anchored to the bottom of the white container */}
        <div className="absolute bottom-6 sm:bottom-8 w-full flex justify-center pointer-events-none z-40">
          <div className="pointer-events-auto flex items-center justify-center gap-1.5 p-1.5 glass-panel rounded-full text-text-primary">
            <button 
              onClick={() => setViewMode('BILINGUAL')}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all border-none ${viewMode === 'BILINGUAL' ? 'bg-text-primary text-white shadow-md' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary bg-transparent'}`}
            >
              <Layers className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">中英对照</span>
              <span className="sm:hidden">对照</span>
            </button>
            <button 
              onClick={() => setViewMode('SPLIT')}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all border-none ${viewMode === 'SPLIT' ? 'bg-text-primary text-white shadow-md' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary bg-transparent'}`}
            >
              <SplitSquareHorizontal className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">分屏视图</span>
              <span className="sm:hidden">分屏</span>
            </button>
            <button 
              onClick={() => setViewMode('ENGLISH_ONLY')}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all border-none ${viewMode === 'ENGLISH_ONLY' ? 'bg-text-primary text-white shadow-md' : 'text-text-secondary hover:bg-black/5 hover:text-text-primary bg-transparent'}`}
            >
              <FileText className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">纯英文</span>
              <span className="sm:hidden">纯英</span>
            </button>

            <div className="w-[1px] h-6 bg-border-main/50 mx-1 sm:mx-2" />

            <button
              onClick={() => setHighlightMode(highlightMode === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all text-text-secondary hover:bg-black/5 hover:text-text-primary bg-transparent border-none`}
            >
              {highlightMode === 'VISIBLE' ? <EyeOff className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" /> : <Eye className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
              <span className="hidden sm:inline">{highlightMode === 'VISIBLE' ? '隐藏词汇' : '显示词汇'}</span>
            </button>

            <div className="w-[1px] h-6 bg-border-main/50 mx-1 sm:mx-2" />

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all text-text-secondary hover:bg-black/5 hover:text-text-primary bg-transparent border-none disabled:opacity-50`}
            >
              {isExporting ? <Loader2 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] animate-spin" /> : <Download className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
              <span className="hidden sm:inline">{isExporting ? '生成中...' : '导出 PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
