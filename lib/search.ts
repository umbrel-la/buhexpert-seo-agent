import { knowledgeBase } from "@/data/knowledge-base";
import type { Material } from "@/types";

const stopWords = new Set(["как", "что", "где", "для", "при", "это", "или", "в", "на", "по", "и", "с", "из"]);

export function normalizeText(value: string) {
  return value.toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function stems(value: string) {
  return normalizeText(value).split(" ").filter((word) => word.length > 2 && !stopWords.has(word)).map((word) => word.slice(0, Math.min(word.length, 7)));
}

export function searchMaterials(question: string, limit = 4): Material[] {
  const query = stems(question);
  if (!query.length) return [];
  return knowledgeBase
    .map((item) => {
      const title = normalizeText(item.title);
      const tags = normalizeText(item.tags.join(" "));
      const body = normalizeText(`${item.summary} ${item.content} ${item.configuration} ${item.category}`);
      const score = query.reduce((total, term) => total + (title.includes(term) ? 5 : 0) + (tags.includes(term) ? 4 : 0) + (body.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
