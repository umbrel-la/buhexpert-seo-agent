import type { ChatResponse } from "@/types";

export const PERSONALIZED_ANSWER_KEY = "buhexpert_personalized_answer_v1";
export type PersonalizedAnswer = { question: string; answer: ChatResponse; articleSlug: string; savedAt: string };

export function savePersonalizedAnswer(value: PersonalizedAnswer) {
  try { localStorage.setItem(PERSONALIZED_ANSWER_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

export function getPersonalizedAnswer(): PersonalizedAnswer | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PERSONALIZED_ANSWER_KEY) || "null");
    if (!value || typeof value !== "object" || !("question" in value) || !("answer" in value)) return null;
    const item = value as PersonalizedAnswer;
    return typeof item.question === "string" && item.answer && typeof item.answer.shortAnswer === "string" ? item : null;
  } catch { return null; }
}
