"use client";

const groups = [
  ["Рубрикаторы", "1С Бухгалтерия", "1С ЗУП", "Законодательство"],
  ["Обучение", "Курсы 1С Бухгалтерия", "Курсы 1С ЗУП", "Проверка знаний"],
  ["Экспертная помощь", "Ближайшие семинары", "Записи семинаров", "Индивидуальные консультации", "Журнал «1С: Бухгалтерия»", "Календарь бухгалтера"],
];

export function Sidebar({ onSubscribe, onConsult }: { onSubscribe: (location: string) => void; onConsult: (location: string) => void }) {
  return <aside className="sidebar">
    {groups.map(([title, ...items]) => <div className="side-group" key={title}><div className="side-title">{title}</div>{items.map((item) =>
      <a className="side-link" href="#" key={item} onClick={(e) => { e.preventDefault(); if (item === "Индивидуальные консультации") onConsult("sidebar"); }}>{item}</a>
    )}</div>)}
    <div className="side-group"><div className="side-title">База знаний</div><a className="side-link" href="/articles/os-v-1c-8-3">Статьи</a><a className="side-link" href="/personalized-answers">Персональные ответы <small>Новое</small></a></div>
    <div className="side-spacer" />
    <button className="side-buy primary" onClick={() => onSubscribe("sidebar")}>Купить подписку</button>
    <button className="side-buy demo" onClick={() => onSubscribe("sidebar_demo")}>Получить демо</button>
  </aside>;
}
