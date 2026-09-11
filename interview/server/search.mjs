export function normalizeTitle(value = "") {
  return value.normalize("NFKC").toLowerCase().replace(/[\s`#*_，。！？、,.!?：:；;（）()【】\[\]"'“”‘’]/g, "");
}

export function cjkBigrams(value = "") {
  const compact = normalizeTitle(value);
  if (compact.length < 2) return compact;
  return Array.from({ length: compact.length - 1 }, (_, index) => compact.slice(index, index + 2)).join(" ");
}

export function cosineSimilarity(left = [], right = []) {
  if (!left.length || left.length !== right.length) return 0;
  let dot = 0;
  let a = 0;
  let b = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    a += left[index] ** 2;
    b += right[index] ** 2;
  }
  return a && b ? dot / Math.sqrt(a * b) : 0;
}

export function reciprocalRankFusion(rankings, k = 60) {
  const scores = new Map();
  for (const ranking of rankings) {
    ranking.forEach((item, index) => {
      const id = typeof item === "string" ? item : item.id;
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + index + 1));
    });
  }
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
