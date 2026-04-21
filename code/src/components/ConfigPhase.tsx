import { useState } from "react";
import { WordObject, Difficulty } from "../types";
import { Loader2, ArrowLeft, SlidersHorizontal, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const DIFFICULTIES: Difficulty[] = ['高考', 'CET-4', 'CET-6', '考研', 'IELTS', 'TOEFL'];

export function ConfigPhase({
  initialWords,
  onGenerate,
  onBack
}: {
  initialWords: WordObject[],
  onGenerate: (article: any) => void,
  onBack: () => void
}) {
  const [words, setWords] = useState<WordObject[]>(initialWords);
  const [difficulty, setDifficulty] = useState<Difficulty>('CET-4');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockArticle = {
        sentences: [
          {
            english: "If you act with consistent effort, you will never need to abandon your dreams, even when the path beneath your feet feels uncertain.",
            chinese: "如果你坚持不懈地努力，即使脚下的路感到迷茫，你也永远不需要放弃你的梦想。",
            usedWords: [
              { word: "consistent", isExtended: false },
              { word: "abandon", isExtended: false },
              { word: "beneath", isExtended: false }
            ]
          },
          {
            english: "The inevitable challenges we face often require a diligent approach to carefully overcome them day by day.",
            chinese: "我们面临的不可避免的挑战，通常需要勤勉的态度来日复一日地小心克服。",
            usedWords: [
              { word: "inevitable", isExtended: false },
              { word: "diligent", isExtended: false }
            ]
          },
          {
            english: "Through empirical observation, we begin to realize that a profound understanding of ourselves is a sustainable source of lifelong strength.",
            chinese: "通过经验观察，我们开始意识到，对自身深刻的理解是终生可持续的力量源泉。",
            usedWords: [
              { word: "empirical", isExtended: false },
              { word: "profound", isExtended: false },
              { word: "sustainable", isExtended: false }
            ]
          },
          {
            english: "While our future might occasionally remain ambiguous and unclear, our ability to foster hope and mitigate fear remains intrinsic to human nature.",
            chinese: "尽管我们的未来偶尔可能依然模棱两可、并不清晰，但我们培养希望和减轻恐惧的能力依然是人类固有的天性。",
            usedWords: [
              { word: "ambiguous", isExtended: false },
              { word: "foster", isExtended: false },
              { word: "mitigate", isExtended: false },
              { word: "intrinsic", isExtended: false }
            ]
          },
          {
            english: "Therefore, we must scrutinize the pervasive negativity in the world and quickly innovate our mindset to embrace an unprecedented level of intellectual freedom.",
            chinese: "因此，我们必须仔细审查世界上无处不在的消极情绪，并迅速创新我们的思维方式，以拥抱前所未有的思想自由。",
            usedWords: [
              { word: "scrutinize", isExtended: false },
              { word: "pervasive", isExtended: false },
              { word: "innovate", isExtended: false },
              { word: "unprecedented", isExtended: false }
            ]
          },
          {
            english: "In this entirely new paradigm, we finally learn to allocate our limited energy wisely, remaining deeply resilient directly as our external circumstances wildly fluctuate.",
            chinese: "在这个全新的范式中，我们终将学会明智地分配有限的精力，并在外部环境剧烈波动时保持极强的适应力。",
            usedWords: [
              { word: "paradigm", isExtended: false },
              { word: "allocate", isExtended: false },
              { word: "resilient", isExtended: false },
              { word: "fluctuate", isExtended: false }
            ]
          },
          {
            english: "Ultimately, deploying a comprehensive strategy leaves us less vulnerable and far more open to lucrative opportunities lying ahead.",
            chinese: "最终，采用包罗万象的综合战略会让我们减少脆弱感，并对眼前的丰厚机会敞开得更多。",
            usedWords: [
              { word: "comprehensive", isExtended: false },
              { word: "vulnerable", isExtended: false },
              { word: "lucrative", isExtended: false }
            ]
          }
        ]
      };
      onGenerate(mockArticle);
      setIsGenerating(false);
    }, 1500);
  };

  const toggleWord = (id: string) => {
    setWords(words.map(w => w.id === id ? { ...w, isUserWord: !w.isUserWord } : w));
  };

  const activeCount = words.filter(w => w.isUserWord).length;

  return (
    <div className="relative flex flex-col h-full overflow-hidden mx-auto max-w-5xl w-full py-5 sm:py-7 px-4 sm:px-6">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-apple-blue/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Premium Header - Adds top overhead */}
      <div className="flex-shrink-0 flex items-center justify-between mb-5 sm:mb-6 pb-4 border-b border-border-main/50 relative z-10">
        <button
          onClick={onBack}
          className="group flex items-center justify-center gap-2 px-3 sm:px-4 h-10 rounded-full hover:bg-white/60 transition-all text-text-secondary hover:text-text-primary z-10"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[14px] font-medium tracking-tight">返回重新上传</span>
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-text-primary flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-apple-blue" />
            词汇与难度配置
          </h2>
        </div>
        <div className="w-[100px]"></div> {/* Spacer */}
      </div>

      {/* Main Content Area - Locked into remaining height */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 sm:gap-8 relative z-10 items-stretch">

        {/* Left Side: Large Word List Area */}
        <div className="order-2 lg:order-1 flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full glass-panel rounded-[32px] p-6 sm:p-8 flex flex-col overflow-hidden min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between mb-6 pb-4 border-b border-border-main/50">
              <div>
                <h3 className="text-[18px] font-semibold text-text-primary tracking-tight">提取结果</h3>
                <p className="text-[13px] text-text-secondary mt-1">取消勾选可排除不想包含的词汇</p>
              </div>
              <span className="text-[13px] font-medium bg-text-primary text-white px-3.5 py-1.5 rounded-full shadow-sm">
                {activeCount} 词起效
              </span>
            </div>

            {/* Scrolling List - only this part scrolls */}
            <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
              {words.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-secondary text-[15px]">
                  未解析到任何生词，请尝试其他文件。
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {words.map(word => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: word.isUserWord ? 1 : 0.6, scale: word.isUserWord ? 1 : 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        key={word.id}
                        onClick={() => toggleWord(word.id)}
                        className={`flex items-start sm:items-center p-4 sm:p-5 rounded-[20px] cursor-pointer transition-all duration-300 border ${word.isUserWord ? 'glass-acrylic border-apple-blue/30 shadow-[0_4px_16px_rgba(0,122,255,0.06)]' : 'bg-transparent border-transparent grayscale-[0.5]'}`}
                      >
                        <div className="flex-shrink-0 mr-4 mt-0.5 sm:mt-0">
                          {word.isUserWord ? (
                            <CheckCircle2 className="w-6 h-6 text-apple-blue" />
                          ) : (
                            <Circle className="w-6 h-6 text-border-main" />
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-6">
                          <div className="w-[124px] flex-shrink-0">
                            <span className={`font-semibold text-[17px] tracking-tight block ${word.isUserWord ? 'text-text-primary' : 'text-text-secondary line-through decoration-text-secondary/40'}`}>{word.word}</span>
                          </div>
                          <div className={`flex-1 text-[13px] sm:text-[14px] leading-[1.6] whitespace-pre-wrap ${word.isUserWord ? 'text-text-secondary' : 'text-border-main'}`}>
                            {word.originalDef}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Symmetrical Bottom Gap corresponding to the top Header height */}
          <div className="flex-shrink-0 h-[40px] sm:h-[48px]" />
        </div>

        {/* Right Side: Options & Action */}
        <div className="order-1 lg:order-2 w-full lg:w-[340px] flex-shrink-0 flex flex-col min-h-0 h-full">

          {/* Top Setting Block: Pinned to the top */}
          <div className="flex-shrink-0 glass-panel rounded-[32px] p-6 flex flex-col">
            <h3 className="flex-shrink-0 text-[13px] font-semibold tracking-widest text-text-secondary mb-4 flex items-center gap-2 uppercase">
              引擎目标设定
            </h3>

            <div className="flex-shrink-0 bg-black/[0.03] p-1.5 rounded-[20px] grid grid-cols-2 gap-1.5 mb-6 border border-white/40">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`relative py-3 rounded-[16px] text-[14px] transition-all tracking-tight font-medium ${difficulty === d
                      ? 'text-text-primary glass-button'
                      : 'text-text-secondary hover:bg-black/5'
                    }`}
                >
                  <span className="relative z-10">{d}</span>
                </button>
              ))}
            </div>

            <div className="bg-apple-blue/5 rounded-[20px] p-5 border border-apple-blue/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-apple-blue" />
                <span className="text-[14px] font-semibold text-apple-blue tracking-tight">LexiFlow AI</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                系统将围绕选定的 <strong className="text-text-primary">{activeCount}</strong> 个单词，以 <strong className="text-text-primary">{difficulty}</strong> 阅读难度为您撰写一篇原汁原味的专属语境短文。
              </p>
            </div>
          </div>

          {/* Bottom Action Area: The Button floats exactly in the middle of the remaining vertical void */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || activeCount === 0}
              className="flex-shrink-0 relative group w-full h-[64px] rounded-[24px] font-semibold text-[17px] tracking-tight flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:pointer-events-none overflow-hidden bg-text-primary text-white shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {/* Gradient glow effect inside button */}
              <div className="absolute inset-0 bg-gradient-to-r from-apple-blue via-purple-500 to-apple-blue opacity-0 group-hover:opacity-20 animate-bg-pan transition-opacity duration-500" />

              <span className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> 正在编织故事...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> 编织专属阅读</>
                )}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
