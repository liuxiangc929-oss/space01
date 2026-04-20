import { useState } from "react";
import { WordObject, Difficulty, GeneratedArticle, ViewMode, HighlightMode } from "./types";
import { UploadPhase } from "./components/UploadPhase";
import { ConfigPhase } from "./components/ConfigPhase";
import { ArticlePhase } from "./components/ArticlePhase";
import { AnimatePresence, motion } from "motion/react";

type AppState = 'UPLOAD' | 'CONFIG' | 'ARTICLE';

export default function App() {
  const [appState, setAppState] = useState<AppState>('UPLOAD');
  const [words, setWords] = useState<WordObject[]>([]);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  
  // App-wide state
  const [viewMode, setViewMode] = useState<ViewMode>('BILINGUAL');
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('VISIBLE');

  const handleWordsExtracted = (extractedWords: WordObject[]) => {
    setWords(extractedWords);
    setAppState('CONFIG');
  };

  const handleArticleGenerated = (generated: GeneratedArticle) => {
    setArticle(generated);
    setAppState('ARTICLE');
  };

  const resetApp = () => {
    setAppState('UPLOAD');
    setWords([]);
    setArticle(null);
  };

  const bgClass = appState === 'ARTICLE' ? 'bg-aurora-static' : 'bg-aurora-animated';

  return (
    <div className={`h-[100dvh] w-full max-w-[100vw] overflow-hidden relative flex flex-col items-center ${bgClass} text-text-primary selection:bg-apple-blue/20 transition-colors duration-1000`}>
      <AnimatePresence mode="wait">
        {appState === 'UPLOAD' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full h-full max-w-[100vw] flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-12 overflow-y-auto overflow-x-hidden"
          >
            <UploadPhase onComplete={handleWordsExtracted} />
          </motion.div>
        )}
        
        {appState === 'CONFIG' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full h-full flex-1 flex flex-col"
          >
            <ConfigPhase 
              initialWords={words} 
              onGenerate={handleArticleGenerated} 
              onBack={() => setAppState('UPLOAD')}
            />
          </motion.div>
        )}

        {appState === 'ARTICLE' && article && (
          <motion.div
            key="article"
            initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            className="w-full h-full flex flex-col px-4 sm:px-6 py-4 sm:py-6 lg:py-8 lg:px-8 min-h-0"
          >
            <ArticlePhase 
              article={article} 
              words={words}
              viewMode={viewMode}
              highlightMode={highlightMode}
              setViewMode={setViewMode}
              setHighlightMode={setHighlightMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
