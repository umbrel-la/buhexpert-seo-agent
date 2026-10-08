"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ChatMessage, ChatResponse, ChatTurn } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { getPersonalizedAnswer, savePersonalizedAnswer } from "@/lib/personalized-answer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AiAnswer } from "./AiAnswer";
import { AuthModal, ConsultationModal, SubscriptionModal } from "./Modals";

const slug = "os-v-1c-8-3";
const suggested = ["Как принять ОС с дополнительными расходами?", "Какие документы проверить перед принятием ОС?", "Как проверить параметры амортизации?"];
const safetyNote = "ИИ-помощник работает в тестовом режиме и может ошибаться. Перед применением проверяйте ответ по актуальным источникам; в сложных случаях уточните у эксперта.";

function newRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function ArticleAi({ compact, initialQuestion, onSubscribe, onConsult, isAuthenticated, onAuthRequired }: { compact?: boolean; initialQuestion?: string; onSubscribe: (location: string) => void; onConsult: (location: string) => void; isAuthenticated: boolean; onAuthRequired: () => void }) {
  const [question, setQuestion] = useState(compact ? "" : initialQuestion || "Например: как принять к учету основное средство с дополнительными расходами?");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState<{ question: string; requestId: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const conversationId = useRef(newRequestId());
  const inFlight = useRef<string | null>(null);
  const questionInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackEvent("article_ai_widget_view", { article_slug: slug });
  }, []);

  const sendQuestion = async (value: string, requestId = newRequestId()) => {
    const normalized = value.trim();
    if (loading || inFlight.current === requestId || normalized.length < 4) return;
    const saved = getPersonalizedAnswer();
    if (!messages.length && saved?.articleSlug === slug && saved.question.toLocaleLowerCase() === normalized.toLocaleLowerCase()) {
      setMessages([{ id: requestId, role: "user", text: normalized }, { id: `answer-${requestId}`, role: "assistant", text: saved.answer.shortAnswer, answer: saved.answer }]);
      setQuestion("");
      return;
    }
    inFlight.current = requestId;
    const history: ChatTurn[] = messages.filter((item) => item.id !== requestId).map((item) => ({ role: item.role, content: item.text }));
    setError(""); setRetry({ question: normalized, requestId }); setLoading(true); setCollapsed(false);
    setMessages((current) => current.some((item) => item.id === requestId) ? current : [...current, { id: requestId, role: "user", text: normalized }]);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: normalized, idempotencyKey: requestId, conversationId: conversationId.current, history }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Не удалось получить ответ.");
      const answer = data as ChatResponse;
      setMessages((current) => [...current.filter((item) => item.id !== `answer-${requestId}`), { id: `answer-${requestId}`, role: "assistant", text: answer.shortAnswer, answer }]);
      setQuestion(""); setFollowUpQuestion(""); setRetry(undefined);
      savePersonalizedAnswer({ question: normalized, answer, articleSlug: slug, savedAt: new Date().toISOString() });
      trackEvent("article_ai_answer_shown", { article_slug: slug, answer_confidence: answer.confidence });
      if (!isAuthenticated) trackEvent("h01_registration_offer", { article_slug: slug, query_category: "article_answer_preview" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось получить ответ.");
      trackEvent("h01_answer_error", { article_slug: slug });
    } finally { setLoading(false); inFlight.current = null; }
  };

  const ask = (value = question) => {
    const normalized = value.trim();
    if (loading || normalized.length < 4) return;
    trackEvent("article_ai_question_submit", { article_slug: slug, query_category: isAuthenticated ? "authenticated" : "guest" });
    void sendQuestion(normalized);
  };
  const askFollowUp = () => {
    const normalized = followUpQuestion.trim();
    if (loading || normalized.length < 4) return;
    trackEvent("h01_question_submit", { article_slug: slug, query_category: "article_followup" });
    void sendQuestion(normalized);
  };
  const keydown = (event: KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && ask();
  const followUpKeydown = (event: KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && askFollowUp();
  const newDialog = () => {
    conversationId.current = newRequestId(); inFlight.current = null;
    setMessages([]); setQuestion(""); setFollowUpQuestion(""); setError(""); setRetry(undefined); setCollapsed(false);
    window.setTimeout(() => questionInput.current?.focus(), 0);
  };
  const lastAnswerId = [...messages].reverse().find((message) => message.role === "assistant")?.id;
  const showChat = messages.length > 0 || loading || error;

  return <section className={`article-ai ${compact ? "article-ai-compact" : ""}`}>
    {!compact && <><span className="article-ai-label">AI-ПОМОЩНИК БУХЭКСПЕРТА</span><h2>Нужен ответ для вашей ситуации?</h2><p>Спросите AI-помощника БухЭксперта. Он подберет решение по материалам базы знаний.</p></>}
    {compact && <div><b>Остались вопросы по вашей ситуации в 1С?</b><p>Получите персональный ответ по материалам БухЭксперта.</p></div>}
    <p className="demo-note">{safetyNote}</p>
    <div className="article-ai-form"><input ref={questionInput} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={keydown} disabled={loading} placeholder="Например: как принять к учету основное средство?" aria-label="Вопрос AI по статье" />
      <button type="button" className="article-ai-button" onClick={() => ask()} disabled={loading || question.trim().length < 4}>{loading ? "Ищу…" : compact ? "Задать вопрос AI" : "Спросить AI"}</button></div>
    <div className="article-ai-chips">{(compact ? suggested.slice(0, 2) : suggested).map((item) => <button type="button" key={item} onClick={() => { setQuestion(item); ask(item); }} disabled={loading}>{item}</button>)}</div>
    <small>Тестовый режим: сначала показывается краткий ответ; после регистрации доступны полный ответ и уточнения.</small>
    {showChat && <div className={`article-ai-result ${collapsed ? "result-collapsed" : ""}`}>
      <div className="chat-controls"><button type="button" className="clear-history" onClick={() => setCollapsed((value) => !value)}>{collapsed ? "Развернуть" : "Свернуть"}</button><button type="button" className="clear-history" onClick={newDialog}>Новый диалог</button></div>
      {!collapsed && <><div className="chat-history">{messages.map((message, index) => message.role === "assistant" && message.answer ? <div key={message.id}><AiAnswer question={messages[index - 1]?.text || "Вопрос"} answer={message.answer} onSubscribe={() => { trackEvent("article_full_access_click", { article_slug: slug }); onSubscribe("article_answer"); }} onConsult={() => onConsult("article_answer")} showPaywall={false} showDisclaimer={message.id === lastAnswerId} preview={!isAuthenticated} onRegister={onAuthRequired} /></div> : null)}</div>
        {loading && <div className="loader show"><i className="spinner" />Формируем ответ…</div>}
        {error && <div className="error-state"><b>Не удалось получить ответ</b><p>{error}</p>{retry && <button type="button" className="outline modal-button" onClick={() => void sendQuestion(retry.question, retry.requestId)}>Повторить запрос</button>}</div>}
        {messages.some((item) => item.role === "assistant") && <Link className="personalized-link" href="/personalized-answers">Открыть последний ответ отдельно</Link>}
        {isAuthenticated && messages.some((item) => item.role === "assistant") && <div className="chat-followup"><input value={followUpQuestion} onChange={(event) => setFollowUpQuestion(event.target.value)} onKeyDown={followUpKeydown} disabled={loading} placeholder="Уточните вашу ситуацию" aria-label="Уточняющий вопрос" /><button type="button" className="article-ai-button" disabled={loading || followUpQuestion.trim().length < 4} onClick={askFollowUp}>Уточнить</button></div>}</>}
    </div>}
  </section>;
}

export function ArticlePage() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("question") || undefined;
  const [modal, setModal] = useState<"subscription" | "consultation" | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const subscribe = (location: string) => { trackEvent("ai_subscription_click", { button_location: location, article_slug: slug }); setModal("subscription"); };
  const consult = (location: string) => { trackEvent("ai_consultation_click", { button_location: location, article_slug: slug }); setModal("consultation"); };
  const openRegister = () => setAuthModal("register");
  const openLogin = () => setAuthModal("login");
  useEffect(() => {
    trackEvent("article_view", { article_slug: slug });
    fetch("/api/auth/session").then((response) => response.json()).then((session) => {
      if (session.mode === "real") setAuthenticated(Boolean(session.authenticated));
    }).catch(() => {});
  }, []);
  return <><Header onSubscribe={subscribe} onLogin={openLogin} onRegister={openRegister} /><div className="article-layout"><Sidebar onSubscribe={subscribe} onConsult={consult} /><main className="article-main">
    <nav className="breadcrumbs"><Link href="/">Главная</Link><span>›</span><Link href="/articles/os-v-1c-8-3">Статьи</Link><span>›</span><span>Основные средства</span></nav>
    <article className="article-body"><h1>Принятие к учету ОС в 1С 8.3: пошаговая инструкция</h1><p className="article-intro">Разбираем, какие документы и параметры полезно проверить перед тем, как принять основное средство к учету в программе.</p>
      <p>В статье показан демонстрационный ориентир для работы в 1С:Бухгалтерии 3.0. Точный порядок зависит от вашей версии программы, настроек учета и первичных документов.</p>
      <h2 id="what-you-learn">Что вы узнаете из статьи</h2><ul><li>какие исходные документы подготовить;</li><li>какие параметры объекта проверить перед проведением;</li><li>как проконтролировать результат в программе.</li></ul>
      <ArticleAi initialQuestion={initialQuestion} onSubscribe={subscribe} onConsult={consult} isAuthenticated={authenticated} onAuthRequired={openRegister} />
      <h2 id="before-start">Что проверить перед принятием ОС к учету</h2><p>Сначала сопоставьте сведения в первичных документах с карточкой объекта: организацию, дату, наименование, единицу учета и ответственное лицо. Если в стоимость входят связанные расходы, убедитесь, что есть понятное основание и комплект подтверждающих документов.</p>
      <div className="article-warning"><b>Важно.</b> Не используйте эту демонстрационную статью как замену проверки учетной политики и первичных документов. При нестандартной ситуации уточните конфигурацию 1С.</div>
      <h2 id="document">Документ принятия к учету</h2><p>Откройте подходящий раздел программы и создайте либо проверьте документ принятия к учету. Заполняйте реквизиты на основании документов по объекту, а перед проведением внимательно проверьте дату и выбранные параметры учета.</p>
      <p>Полезно заранее посмотреть <a href="#control">контроль результата</a> и сверить его с первоначальной информацией об объекте.</p>
      <h2 id="control">Контроль результата</h2><p>После проведения проверьте карточку объекта и движения документа. Если данные отличаются от ожидаемых, остановитесь и перепроверьте исходные документы, настройки учета и период операции.</p>
      <h2 id="extra-costs">Если есть дополнительные расходы</h2><p>Не объединяйте разные ситуации автоматически. Проверьте, относятся ли расходы к конкретному объекту, подтверждены ли они документами и как это предусмотрено в вашей настройке учета.</p>
      <ArticleAi compact onSubscribe={subscribe} onConsult={consult} isAuthenticated={authenticated} onAuthRequired={openRegister} />
      <section className="see-also"><h2>См. также</h2><a href="#control">Проверка принятия ОС к учету в 1С</a><a href="#extra-costs">Дополнительные расходы при принятии ОС</a><Link href="/">Вернуться к AI-помощнику БухЭксперта</Link></section>
    </article></main>
    <aside className="article-toc"><b>Содержание</b><a href="#what-you-learn">Что вы узнаете</a><a href="#before-start">Подготовка документов</a><a href="#document">Принятие к учету</a><a href="#control">Контроль результата</a><a href="#extra-costs">Дополнительные расходы</a></aside>
  </div>{modal === "subscription" && <SubscriptionModal onClose={() => setModal(null)} />}{modal === "consultation" && <ConsultationModal onClose={() => setModal(null)} />}{authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuthenticated={() => { setAuthenticated(true); setAuthModal(null); }} onSwitch={setAuthModal} />}</>;
}
