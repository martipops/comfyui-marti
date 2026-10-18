/** Splits "folder/sub/name.ext" into a display name (no model extension) and folder. */
export function describePath(path: string): { name: string; folder: string } {
  const normalized = path.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const file = normalized.slice(slash + 1);
  return {
    name: file.replace(/\.(safetensors|ckpt|pt|pth|bin)$/i, ""),
    folder: slash >= 0 ? normalized.slice(0, slash) : "",
  };
}

/**
 * Case-insensitive fuzzy match. Returns a score (higher is better) or -1 for no match.
 * Contiguous substring matches beat scattered subsequence matches, and
 * matches on the file name beat matches in the folder path.
 */
export function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const nameStart = t.lastIndexOf("/") + 1;
  const sub = t.indexOf(q, nameStart);
  if (sub >= 0) return 1000 - (sub - nameStart) - t.length * 0.01;
  const anySub = t.indexOf(q);
  if (anySub >= 0) return 500 - anySub - t.length * 0.01;

  let score = 0;
  let ti = 0;
  let streak = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    streak = found === ti ? streak + 1 : 0;
    score += 1 + streak * 2 + (found >= nameStart ? 1 : 0);
    ti = found + 1;
  }
  return score;
}
