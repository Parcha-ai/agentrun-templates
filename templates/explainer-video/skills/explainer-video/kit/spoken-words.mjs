// spoken-words.mjs: the one count of a script's spoken words, shared by check-script.mjs (the cap before a voiceover is
// sent) and build-captions.mjs (its W), so the word cap and the captions never count a script two ways.

/** A token's letters and digits, lower case, accents dropped: "" for a token with neither. */
export function norm(s) {
  return s.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** The words as spoken: audio tags out, split on whitespace, punctuation kept for display. A token with no letter or
 *  digit (a lone dash) is not a word: it rides on the word before it. A hyphenated word is one. Each word is
 *  {text, key}; W is the words whose key is not empty. */
export function spokenWords(script) {
  const tokens = script.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const words = [];
  for (const t of tokens) {
    const key = norm(t);
    if (key.length || !words.length) words.push({ text: t, key });
    else words[words.length - 1].text += ` ${t}`;
  }
  return { words, W: words.filter((w) => w.key.length).length };
}
