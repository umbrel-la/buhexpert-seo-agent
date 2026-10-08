export function ContentFeed() {
  return <>
    <section className="card quick"><div className="section-head"><h2>Новое за 5 минут</h2><a href="#feed">Смотреть всё →</a></div><div className="quick-grid">
      <article className="quick-item"><small>1С:Бухгалтерия · 5 мин</small><h3>Как сверить ЕНС перед отправкой уведомления</h3></article>
      <article className="quick-item"><small>Законодательство · 4 мин</small><h3>Новые сроки представления документов в ФНС</h3></article>
      <article className="quick-item"><small>1С:ЗУП · 5 мин</small><h3>Проверяем начисление отпускных в программе</h3></article>
    </div></section>
    <section className="card news-card"><div className="section-head"><h2>Новое на сайте</h2><a href="#feed">Все публикации →</a></div><div className="news">
      <article><small>Сегодня, 12:40 · 1С:ЗУП</small><h3>Перевод больничных и пособий на новый формат обмена</h3></article>
      <article><small>Сегодня, 10:15 · Отчётность</small><h3>Контрольные соотношения декларации по НДС</h3></article>
      <article><small>Вчера, 17:20 · 1С:Бухгалтерия</small><h3>Закрытие месяца: разбираем типовые ошибки</h3></article>
      <article><small>Вчера, 15:05 · Налоги</small><h3>Расходы на электронный документооборот: учёт и проверка</h3></article>
    </div></section>
    <section className="card feed" id="feed"><div className="section-head"><h2>Лента БухЭксперт</h2><a href="#feed">Перейти в ленту →</a></div>
      <article className="feed-item"><small>1С:Бухгалтерия · 18 сентября</small><b>Электронные перевозочные документы: оформление и исправления</b><p>Разбираем частые вопросы бухгалтеров и показываем практику работы в программе.</p></article>
      <article className="feed-item"><small>1С:ЗУП · 18 сентября</small><b>Обзор законодательства по зарплате за неделю</b><p>Коротко о разъяснениях ведомств, отчётности и изменениях в кадровом учёте.</p></article>
      <article className="feed-item"><small>Эксперт отвечает · 17 сентября</small><b>Как проверить расчёты с контрагентом перед закрытием периода</b><p>Чек-лист и ссылки на подробные инструкции для пользователей 1С.</p></article>
    </section>
  </>;
}

export function RightEventsColumn() {
  const events = [
    ["21 сентября · 11:00", "Электронные перевозочные документы: практика и ошибки", "Юлия Белкина · ФНС России"],
    ["23 сентября · 12:00", "Изменения в учёте НДС и работа в 1С", "Елена Грянина · эксперт 1С"],
    ["25 сентября · 10:00", "Зарплатная отчётность: готовимся без ошибок", "Наталья Слободчикова"],
  ];
  return <aside className="right"><section className="card"><h2>Ближайшие эфиры</h2>{events.map(([date, title, person]) =>
    <article className="event" key={title}><div className="date">{date}</div><h3>{title}</h3><p>{person}</p><span className="live">● ПРЯМОЙ ЭФИР</span></article>)}
  </section></aside>;
}
