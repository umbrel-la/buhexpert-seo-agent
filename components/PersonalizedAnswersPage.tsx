"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { ChatResponse } from "@/types";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ConsultationModal, SubscriptionModal } from "./Modals";
import { getPersonalizedAnswer, savePersonalizedAnswer, type PersonalizedAnswer } from "@/lib/personalized-answer";
import { trackEvent } from "@/lib/analytics";

const slug = "os-v-1c-8-3";
const suggestions = [
  "Какие расходы включить в первоначальную стоимость ОС?",
  "Как проверить дату ввода в эксплуатацию?",
  "Какие параметры амортизации указать?",
];

const demoAnswer: PersonalizedAnswer = {
  articleSlug: slug,
  savedAt: "2026-09-20T00:00:00.000Z",
  question: "Какие документы проверить перед принятием основного средства к учету в 1С?",
  answer: {
    shortAnswer: "Перед принятием основного средства к учету проверьте договор, акт или УПД, первоначальную стоимость, дополнительные расходы, дату ввода в эксплуатацию и параметры амортизации.",
    explanation: ["Эти сведения помогают сверить исходные документы с карточкой объекта и параметрами учета в 1С.", "Подборка сформирована по теме принятия основных средств к учету и не заменяет проверку вашей учетной политики."],
    sources: [
      { id: "fixed-assets", title: "Принятие к учету ОС в 1С 8.3", category: "Инструкция", updatedAt: "2026-09-18", url: "/articles/os-v-1c-8-3" },
      { id: "fixed-assets-cost", title: "Проверка первоначальной стоимости основного средства", category: "Чек-лист", updatedAt: "2026-09-17", url: "/articles/os-v-1c-8-3#before-start" },
      { id: "fixed-assets-depreciation", title: "Настройка амортизации в 1С", category: "Практикум", updatedAt: "2026-09-16", url: "/articles/os-v-1c-8-3#control" },
    ],
    stepsPreview: ["Соберите договор, акт или УПД и документы по дополнительным расходам, затем сопоставьте их с карточкой объекта.", "Проверьте дату ввода в эксплуатацию, первоначальную стоимость и параметры амортизации перед проведением документа."],
    locked: true, remainingQueries: 3, confidence: "medium", demoMode: true,
  },
};

const demoFollowUps: Record<string, PersonalizedAnswer> = {
  "Какие расходы включить в первоначальную стоимость ОС?": {
    articleSlug: slug, savedAt: "2026-09-20T00:00:00.000Z",
    question: "Какие расходы включить в первоначальную стоимость ОС?",
    answer: {
      shortAnswer: "В первоначальную стоимость обычно включают расходы, которые относятся к приобретению объекта и подготовке его к использованию: стоимость по договору, доставку, монтаж и другие подтвержденные затраты.",
      explanation: ["Сверьте каждый расход с первичными документами и проверьте, относится ли он именно к этому объекту.", "Не объединяйте разные ситуации автоматически: состав затрат зависит от настройки учета и комплекта документов."],
      sources: [
        { id: "fixed-assets-costs", title: "Дополнительные расходы при принятии ОС к учету", category: "Ответ эксперта", updatedAt: "2026-09-17", url: "/articles/os-v-1c-8-3#extra-costs" },
        { id: "fixed-assets-cost", title: "Проверка первоначальной стоимости основного средства", category: "Чек-лист", updatedAt: "2026-09-17", url: "/articles/os-v-1c-8-3#before-start" },
        { id: "fixed-assets", title: "Принятие к учету ОС в 1С 8.3", category: "Инструкция", updatedAt: "2026-09-18", url: "/articles/os-v-1c-8-3" },
      ],
      stepsPreview: ["Соберите договор, акт или УПД и документы по связанным расходам: доставка, монтаж, услуги.", "В карточке объекта проверьте, какие суммы включены в первоначальную стоимость, и сопоставьте их с первичными документами."],
      locked: true, remainingQueries: 3, confidence: "medium", demoMode: true,
    },
  },
  "Как проверить дату ввода в эксплуатацию?": {
    articleSlug: slug, savedAt: "2026-09-20T00:00:00.000Z",
    question: "Как проверить дату ввода в эксплуатацию?",
    answer: {
      shortAnswer: "Сверьте дату ввода в эксплуатацию с первичными документами и реквизитами документа принятия к учету. Дата должна соответствовать моменту, когда объект готов к использованию.",
      explanation: ["Проверьте организацию, период и карточку объекта: расхождение дат часто связано с неверно выбранным документом или периодом.", "Перед проведением документа убедитесь, что дата не противоречит акту, УПД и настройкам учета."],
      sources: [
        { id: "fixed-assets-check", title: "Проверка принятия ОС к учету в 1С", category: "Чек-лист", updatedAt: "2026-09-14", url: "/articles/os-v-1c-8-3#control" },
        { id: "fixed-assets", title: "Принятие к учету ОС в 1С 8.3", category: "Инструкция", updatedAt: "2026-09-18", url: "/articles/os-v-1c-8-3" },
        { id: "fixed-assets-cost", title: "Проверка первоначальной стоимости основного средства", category: "Чек-лист", updatedAt: "2026-09-17", url: "/articles/os-v-1c-8-3#before-start" },
      ],
      stepsPreview: ["Откройте документ принятия к учету и сверьте дату с актом или УПД.", "Проверьте карточку объекта после проведения: дата ввода в эксплуатацию должна совпадать с выбранной в документе."],
      locked: true, remainingQueries: 3, confidence: "medium", demoMode: true,
    },
  },
  "Какие параметры амортизации указать?": {
    articleSlug: slug, savedAt: "2026-09-20T00:00:00.000Z",
    question: "Какие параметры амортизации указать?",
    answer: {
      shortAnswer: "Перед принятием к учету проверьте срок полезного использования, способ начисления и счет учета затрат. Параметры должны соответствовать карточке объекта и настройкам учета в вашей базе.",
      explanation: ["Не заполняйте амортизацию «по аналогии»: сначала сверьте первичные документы и учетную политику.", "После проведения документа проверьте, что выбранные параметры отразились в карточке основного средства."],
      sources: [
        { id: "fixed-assets-depreciation", title: "Настройка амортизации в 1С", category: "Практикум", updatedAt: "2026-09-16", url: "/articles/os-v-1c-8-3#control" },
        { id: "fixed-assets", title: "Принятие к учету ОС в 1С 8.3", category: "Инструкция", updatedAt: "2026-09-18", url: "/articles/os-v-1c-8-3" },
        { id: "fixed-assets-check", title: "Проверка принятия ОС к учету в 1С", category: "Чек-лист", updatedAt: "2026-09-14", url: "/articles/os-v-1c-8-3#control" },
      ],
      stepsPreview: ["В документе принятия к учету откройте параметры амортизации и сверьте срок полезного использования.", "Проверьте способ начисления и счет затрат, затем сверьте результат в карточке объекта."],
      locked: true, remainingQueries: 3, confidence: "medium", demoMode: true,
    },
  },
};

function applyAnswer(question: string, answer: ChatResponse): PersonalizedAnswer {
  return { question, answer, articleSlug: slug, savedAt: new Date().toISOString() };
}

export function PersonalizedAnswersPage() {
  const [item, setItem] = useState<PersonalizedAnswer | undefined>(undefined);
  const [modal, setModal] = useState<"subscription" | "consultation" | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(3);
  const subscribe = (location: string) => { trackEvent("personalized_full_access_click", { button_location: location }); setModal("subscription"); };
  const consult = () => { trackEvent("consultation_click"); setModal("consultation"); };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = getPersonalizedAnswer() || demoAnswer;
      setItem(value);
      trackEvent("personalized_answer_open", { article_slug: value.articleSlug });
      trackEvent("personalized_paywall_view", { article_slug: value.articleSlug });
    }, 0);
    fetch("/api/chat").then((r) => r.json()).then((d) => setRemaining(d.remainingQueries)).catch(() => {});
    return () => window.clearTimeout(timer);
  }, []);

  const showAnswer = (next: PersonalizedAnswer) => {
    setItem(next);
    setFollowUp("");
    setError("");
    savePersonalizedAnswer(next);
    trackEvent("personalized_answer_open", { article_slug: slug });
    trackEvent("personalized_paywall_view", { article_slug: slug });
  };

  const ask = async (value = followUp) => {
    const normalized = value.trim();
    if (loading || normalized.length < 4) return;
    setFollowUp(normalized);
    const canned = demoFollowUps[normalized];
    if (canned) { showAnswer(canned); return; }
    const saved = getPersonalizedAnswer();
    if (saved?.question.toLocaleLowerCase() === normalized.toLocaleLowerCase()) { showAnswer(saved); return; }
    if (!remaining) { subscribe("personalized_limit"); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: normalized }) });
      const data = await response.json();
      if (response.status === 429) { setRemaining(0); subscribe("personalized_limit"); return; }
      if (!response.ok) throw new Error(data.error || "Не удалось получить ответ.");
      setRemaining(data.remainingQueries);
      showAnswer(applyAnswer(normalized, data));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось получить ответ.");
    } finally { setLoading(false); }
  };

  const keydown = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") ask(); };

  return <>
    <Header onSubscribe={subscribe} />
    <div className="article-layout">
      <Sidebar onSubscribe={subscribe} onConsult={consult} />
      <main className="article-main personalized-main">
        {item === undefined ? <p>Загружаем персональный ответ…</p> : <article className="personalized-card">
          <span className="personalized-badge">Подобрано для вас</span>
          <h1>Вероятно, здесь ответ на ваш вопрос</h1>
          <p className="article-intro">Мы учли ваш вопрос, содержание открытой статьи и материалы базы знаний БухЭксперта.</p>
          <div className="personalized-question"><small>Ваш вопрос</small><b>{item.question}</b></div>
          <section className="personalized-ask">
            <span>УТОЧНИТЕ СВОЮ СИТУАЦИЮ</span>
            <b>Хотите спросить по своему случаю?</b>
            <div className="personalized-ask-row">
              <input value={followUp} onChange={(event) => setFollowUp(event.target.value)} onKeyDown={keydown} disabled={loading} placeholder="Например: какие расходы включить в стоимость ОС?" aria-label="Уточняющий вопрос" />
              <button type="button" onClick={() => ask()} disabled={loading || followUp.trim().length < 4}>{loading ? "Ищу…" : "Спросить AI"}</button>
            </div>
            <div className="personalized-suggestions">{suggestions.map((question) =>
              <button type="button" key={question} disabled={loading} onClick={() => ask(question)}>{question}</button>
            )}</div>
            {error && <p className="personalized-ask-error">{error}</p>}
          </section>
          <h2>Краткий ответ</h2>
          <p className="short-answer">{item.answer.shortAnswer}</p>
          {item.answer.explanation.map((text) => <p key={text}>{text}</p>)}
          <h2>Почему этот ответ подходит</h2>
          <p>Подборка связана с темой принятия основных средств в 1С и использует совпадения по вашему вопросу и содержанию статьи.</p>
          <h2>Найденные материалы БухЭксперта</h2>
          <div className="materials">{item.answer.sources.map((source) =>
            <article className="material" key={source.id}><span className="tag">{source.category}</span><h3>{source.title}</h3><a className="text-link" href={source.url}>Открыть материал →</a></article>
          )}</div>
          <h2>Первые шаги решения</h2>
          <ol className="steps">{item.answer.stepsPreview.map((step) => <li key={step}>{step}</li>)}</ol>
          <section className="personalized-lock">
            <p>Полное пошаговое решение найдено. Оформите подписку, чтобы открыть все действия, примеры и связанные материалы.</p>
            <div className="locked-preview"><span>Проверьте взаимосвязанные документы и параметры учета.</span><span>Сопоставьте результат с требованиями вашей ситуации.</span></div>
            <div className="result-actions">
              <Link className="primary-btn action-button" href="/dostup" onClick={() => trackEvent("personalized_full_access_click", { button_location: "personalized_paywall" })}>Открыть полный доступ</Link>
              <button className="secondary-link" onClick={consult}>Получить консультацию</button>
              <Link className="secondary-link" href="/articles/os-v-1c-8-3">Перейти к исходной статье</Link>
            </div>
          </section>
        </article>}
      </main>
      <aside className="article-toc"><b>Персональный ответ</b><span>Вопрос</span><span>Материалы</span><span>Первые шаги</span></aside>
    </div>
    {modal === "subscription" && <SubscriptionModal onClose={() => setModal(null)} />}
    {modal === "consultation" && <ConsultationModal onClose={() => setModal(null)} />}
  </>;
}
