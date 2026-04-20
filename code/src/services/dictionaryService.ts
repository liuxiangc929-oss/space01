export async function getDictionaryDefinition(word: string): Promise<any> {
  try {
     const url = `/api/translate/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=bd&dt=t&q=${encodeURIComponent(word)}`;
     const res = await fetch(url);
     if (!res.ok) return null;
     const data = await res.json();

     const result: any = { meanings: [] };

     // Process strictly Dictionary results if matched (n., v., adj. etc)
     if (data[1] && Array.isArray(data[1])) {
       data[1].forEach((item: any) => {
         const pos = item[0]; // e.g. "noun", "verb"
         const translations = item[1]; // e.g. ["翻译", "测试"]
         if (translations && translations.length > 0) {
           result.meanings.push({
             partOfSpeech: pos,
             // Apply the rule: Only take up to 3 most common definitions per part of speech
             definitions: [{ definition: translations.slice(0, 3).join('，') }]
           });
         }
       });
     } 
     
     // Fallback to standard base translation if dictionary mode didn't trigger
     if (result.meanings.length === 0 && data[0] && data[0][0] && data[0][0][0]) {
        result.meanings.push({
          partOfSpeech: 'trans',
          definitions: [{ definition: data[0][0][0] }]
        });
     }

     return result.meanings.length > 0 ? result : null;
  } catch(e) {
     return null;
  }
}
