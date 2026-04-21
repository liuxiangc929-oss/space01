import { GoogleGenAI, Type } from '@google/genai';
import { WordObject, Difficulty, GeneratedArticle } from '../types';

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.error("Failed to initialize GoogleGenAI", e);
}

export async function sanitizeVocabularyList(rawWords: WordObject[]): Promise<WordObject[]> {
  if (!ai) throw new Error("GoogleGenAI not initialized.");

  const inputStr = JSON.stringify(rawWords.map(w => ({ word: w.word, pos: w.pos, def: w.originalDef })), null, 2);

  const prompt = `
你是一个专业的语言学与格式整理AI。用户提供了一组从 OCR 或文档解析出来的生词数组。
由于文档的排版、换行或 OCR 错误，里面可能包含了：
1. 单词、词性和中文释义匹配错乱（例如词性和释义跑到了另一个单词下）。
2. 无效的乱码、无意义的标点符号（如 1. 2. - • 等排版符号）。
3. 多个词性和释义被错误拆分为多个对象。

你的任务：
对这些原始数据进行二次清洗和整理，把“单词”、“词性（POS）”和“词义”精准地一一对应。对于多余的部分、乱码或无关文本，直接去除。
如果有同一个单词的多个词性/翻译，请将它们合并到同一个单词对象的释义中（格式应为多行原生的整理格式，例如：
"n. 意思1
v. 意思2")。

最后只返回完全干净且准确的单词数组。
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt + "\n\n输入数据:\n" + inputStr,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: {
              type: Type.STRING,
              description: "提取的纯英文单词"
            },
            pos: {
              type: Type.STRING,
              description: "保留为空字符串即可，词性请全部放到 originalDef 中以便排版"
            },
            originalDef: {
              type: Type.STRING,
              description: "对应的中文释义，要求在每种意思前带上词性标记，并通过换行（\\n）区分多词性，还原用户的手写/打印格式清单"
            }
          },
          required: ["word", "pos", "originalDef"]
        }
      }
    }
  });

  const text = response.text || "[]";
  const parsed = JSON.parse(text) as any[];

  // Assign UUIDs and isUserWord flag back to the cleaned array
  return parsed.map(w => ({
    id: crypto.randomUUID(),
    word: w.word.toLowerCase(),
    pos: w.pos || "",
    originalDef: w.originalDef,
    isUserWord: true
  }));
}

export async function generateArticle(
  words: WordObject[],
  difficulty: Difficulty
): Promise<GeneratedArticle> {
  if (!ai) throw new Error("GoogleGenAI not initialized. Check your GEMINI_API_KEY.");

  const wordsList = words.map((w) => `- ${w.word} (${w.pos} ${w.originalDef})`).join("\n");

  const prompt = `
Write an engaging and logically coherent English article at the "${difficulty}" difficulty level.
You MUST include all of the following vocabulary words in the article, with their specified meanings in mind:
${wordsList}

Provide the article sentence by sentence. For each sentence, provide the English text and its Chinese translation.
Identify which of the provided vocabulary words were used in that sentence.
If you had to use a word in a slightly extended or different context from the exact provided meaning to make the sentence natural, mark "isExtended" as true.

Respond strictly in JSON format. Do not use markdown blocks unless they wrap the JSON only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                chinese: { type: Type.STRING },
                usedWords: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      isExtended: { type: Type.BOOLEAN }
                    },
                    required: ["word", "isExtended"]
                  }
                }
              },
              required: ["english", "chinese", "usedWords"]
            }
          }
        },
        required: ["sentences"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as GeneratedArticle;
}
