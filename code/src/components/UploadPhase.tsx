import React, { useState } from "react";
import { motion } from "motion/react";
import { WordObject } from "../types";
import { Sparkles, ScanText, BrainCircuit, BookOpen, ArrowRight } from "lucide-react";

export function UploadPhase({ onComplete }: { onComplete: (words: WordObject[]) => void }) {
  const [isHovering, setIsHovering] = useState(false);

  // Generate some mock data when clicked instead of processing files
  const createMockData = () => {
    // 注入丰富的演示数据（23个单词），模拟真实场景下一页文章解析出的词汇量
    const mockWords: WordObject[] = [
      { id: "1", word: "abandon", pos: "v.", originalDef: "v. 放弃，抛弃\nn. 狂热，放任", isUserWord: true },
      { id: "2", word: "beneath", pos: "prep.", originalDef: "prep. 在...之下\nadv. 在下方", isUserWord: true },
      { id: "3", word: "consistent", pos: "adj.", originalDef: "adj. 始终如一的，一致的", isUserWord: true },
      { id: '4', word: 'diligent', pos: 'adj.', originalDef: 'adj. 勤勉的，刻苦的', isUserWord: true },
      { id: '5', word: 'inevitable', pos: 'adj.', originalDef: 'adj. 不可避免的，必然的', isUserWord: true },
      { id: '6', word: 'profound', pos: 'adj.', originalDef: 'adj. 深厚的；意义深远的；渊博的', isUserWord: true },
      { id: '7', word: 'sustainable', pos: 'adj.', originalDef: 'adj. 可持续的，能长期维持的', isUserWord: true },
      { id: '8', word: 'lucrative', pos: 'adj.', originalDef: 'adj. 获利多的，赚钱的', isUserWord: true },
      { id: '9', word: 'ambiguous', pos: 'adj.', originalDef: 'adj. 模棱两可的，含糊不清的', isUserWord: true },
      { id: '10', word: 'fluctuate', pos: 'v.', originalDef: 'v. 波动，涨落，起伏', isUserWord: true },
      { id: '11', word: 'paradigm', pos: 'n.', originalDef: 'n. 范例，样式，模范；词形变化表', isUserWord: true },
      { id: '12', word: 'comprehensive', pos: 'adj.', originalDef: 'adj. 综合的，广泛的，包罗万象的', isUserWord: true },
      { id: '13', word: 'empirical', pos: 'adj.', originalDef: 'adj. 经验主义的，完全根据经验的', isUserWord: true },
      { id: '14', word: 'foster', pos: 'v.', originalDef: 'v. 培养，促进，收养\nadj. 收养的', isUserWord: true },
      { id: '15', word: 'mitigate', pos: 'v.', originalDef: 'v. 减轻，缓和，平息', isUserWord: true },
      { id: '16', word: 'vulnerable', pos: 'adj.', originalDef: 'adj. 易受攻击的，脆弱的', isUserWord: true },
      { id: '17', word: 'scrutinize', pos: 'v.', originalDef: 'v. 仔细检查，细致审查', isUserWord: true },
      { id: '18', word: 'unprecedented', pos: 'adj.', originalDef: 'adj. 空前的，史无前例的', isUserWord: true },
      { id: '19', word: 'resilient', pos: 'adj.', originalDef: 'adj. 有弹性的；能恢复活力的，适应力强的', isUserWord: true },
      { id: '20', word: 'allocate', pos: 'v.', originalDef: 'v. 分配，分派，把...拨给', isUserWord: true },
      { id: '21', word: 'intrinsic', pos: 'adj.', originalDef: 'adj. 固有的，内在的，本质的', isUserWord: true },
      { id: '22', word: 'pervasive', pos: 'adj.', originalDef: 'adj. 无处不在的，遍布的，弥漫的', isUserWord: true },
      { id: '23', word: 'innovate', pos: 'v.', originalDef: 'v. 创新，改革，引入新事物', isUserWord: true }
    ];
    onComplete(mockWords);
  };

  return (
    <div className="relative flex flex-col items-center justify-between h-full max-w-5xl mx-auto w-full pt-1 pb-4 sm:pt-2 sm:pb-6">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] bg-apple-blue/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Top Section: Header & Hero (Pushed aggressively up) */}
      <div className="flex flex-col items-center text-center relative z-10 w-full max-w-4xl -mt-6 sm:-mt-2">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4"
        >
          <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[16px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-[2px] shadow-[0_8px_16px_rgba(0,122,255,0.2)]">
            <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-[12px] sm:rounded-[14px] flex items-center justify-center backdrop-blur-md">
              <Sparkles className="text-white w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[32px] sm:text-[42px] font-bold tracking-tighter text-text-primary">LexiFlow</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-[28px] sm:text-[38px] font-bold tracking-tighter text-text-primary mb-2"
        >
          让孤立的生词，<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#5856D6]">长出自己的故事。</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-text-secondary text-[15px] sm:text-[16px] font-medium tracking-tight max-w-xl mx-auto px-4"
        >
          拖入包含生词的照片或文档，LexiFlow将为上传的词汇量身定制一篇文章。
        </motion.p>
      </div>

      {/* Middle Section: Main Dropzone Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className="w-full max-w-2xl relative z-10 flex-shrink mt-10 mb-6 sm:mt-16 sm:mb-12"
        onClick={createMockData}
      >
        <div className="w-full glass-panel rounded-[32px] sm:rounded-[40px] p-3 sm:p-4 cursor-pointer relative group overflow-hidden">
          {/* Subtle hover gradient inside the card */}
          <div className="absolute inset-0 bg-gradient-to-b from-apple-blue/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className={`relative rounded-[24px] sm:rounded-[32px] border-2 border-dashed transition-all duration-500 overflow-hidden ${isHovering ? 'border-apple-blue/40 bg-apple-blue/[0.02]' : 'border-border-main/60 bg-[#F5F5F7]/30'}`}>
            <div className="px-6 py-10 sm:py-16 flex flex-col items-center justify-center text-center relative z-10">
               
               {/* Icon Animation Composition */}
               <div className="relative mb-6 sm:mb-8">
                 <div className={`absolute inset-0 bg-apple-blue/10 rounded-full blur-xl transition-transform duration-700 ${isHovering ? 'scale-150' : 'scale-100'}`} />
                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-white shadow-md flex items-center justify-center text-apple-blue border border-black/[0.04] relative z-10">
                   <ScanText strokeWidth={1.5} className="w-8 h-8 sm:w-10 sm:h-10" />
                 </div>
               </div>

               <p className="text-[18px] sm:text-[22px] font-semibold mb-2 sm:mb-3 text-text-primary tracking-tight">点击或拖拽文件至此提取</p>
               <p className="text-[13px] sm:text-[15px] text-text-secondary mb-8 sm:mb-10 font-medium tracking-wide">支持图片 (JPG/PNG) 或文档 (PDF/DOCX)</p>
               
               {/* Fake Button */}
               <div className="bg-text-primary text-white flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-[14px] sm:text-[15px] transition-transform shadow-sm group-hover:bg-apple-blue">
                  注入演示数据并进入下一步
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section: Feature Steps (Pushed downwards aggressively) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="flex justify-center flex-row gap-6 sm:gap-16 pb-0 sm:pb-2 relative z-10 opacity-70 mt-auto translate-y-4 sm:translate-y-6"
      >
         <div className="flex flex-col items-center gap-2 sm:gap-3">
            <ScanText className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
            <span className="text-[11px] sm:text-[13px] font-medium text-text-secondary tracking-widest uppercase text-center">1. 精准提取</span>
         </div>
         <div className="w-px h-8 sm:h-10 bg-border-main/50 self-center" />
         <div className="flex flex-col items-center gap-2 sm:gap-3">
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
            <span className="text-[11px] sm:text-[13px] font-medium text-text-secondary tracking-widest uppercase text-center">2. 语境编织</span>
         </div>
         <div className="w-px h-8 sm:h-10 bg-border-main/50 self-center" />
         <div className="flex flex-col items-center gap-2 sm:gap-3">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
            <span className="text-[11px] sm:text-[13px] font-medium text-text-secondary tracking-widest uppercase text-center">3. 沉浸阅读</span>
         </div>
      </motion.div>

    </div>
  );
}
