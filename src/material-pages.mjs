const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const materialPath = slug => `/materialy/${slug}/`;

// Paragraphs and list items are authored here; their inline links are trusted HTML.
export const articles = [
  {
    slug: 'kak-vybrat-format-sayta',
    title: 'Как выбрать формат сайта для бизнеса',
    description: 'Лендинг, сайт компании или интернет-магазин: как выбрать формат по задаче посетителя и составу вашего предложения.',
    sections: [
      {
        title: 'Начните с действия посетителя',
        paragraphs: [
          'Закончите фразу: «После посещения сайта человек должен…». Например, записаться на консультацию, сравнить услуги или выбрать товар и оформить заказ. Это помогает определить структуру раньше, чем вы начнёте выбирать цвета и примеры дизайна.',
          'Затем запишите, откуда придёт посетитель и что он уже знает о вас. Человеку из рекламы одной услуги и тому, кто ищет подробную информацию о компании, могут понадобиться разные страницы.'
        ]
      },
      {
        title: 'Лендинг: одно предложение',
        paragraphs: [
          'Лендинг подходит, когда можно последовательно рассказать об одном предложении: что вы делаете, кому это подходит, как проходит работа и как с вами связаться. Это может быть услуга, мероприятие или первая версия сайта небольшого бизнеса.',
          'Несколько услуг тоже можно показать на одной странице, если посетителю не нужны отдельные подробные описания каждой. Если информации становится слишком много, стоит рассмотреть сайт компании.',
          '<a href="/uslugi/lending/">Посмотреть состав работы над лендингом →</a>'
        ]
      },
      {
        title: 'Сайт компании: несколько самостоятельных тем',
        paragraphs: [
          'Этот формат удобен, когда услуги, проекты, сведения о компании и другие темы требуют собственных страниц. Посетитель может сразу открыть нужный раздел, а вы — отправить клиенту ссылку на конкретную услугу или проект.',
          'Перед выбором составьте список разделов и по одному предложению опишите пользу каждого. Если две страницы отвечают на один и тот же вопрос, их, возможно, стоит объединить.',
          '<a href="/uslugi/sayt-kompanii/">Посмотреть состав сайта компании →</a>'
        ]
      },
      {
        title: 'Интернет-магазин: выбор и оформление заказа',
        paragraphs: [
          'Магазин нужен, когда человек должен выбрать товары, собрать корзину и оформить заказ на сайте. До начала работы важно понять, как вы будете обновлять цены и остатки, принимать оплату и передавать заказ в работу.',
          'Сам по себе каталог ещё не требует магазина. Если покупка начинается с разговора с менеджером, иногда достаточно карточек товаров и формы запроса. Сценарий заказа и нужные подключения определяем отдельно.',
          '<a href="/uslugi/internet-magazin/">Посмотреть состав интернет-магазина →</a>'
        ]
      },
      {
        title: 'Проверьте формат тремя вопросами',
        items: [
          'Можно ли принять решение на одной странице или посетителю нужно изучить несколько тем?',
          'Нужно ли оформлять заказ на сайте или достаточно заявки и разговора с вами?',
          'Какие материалы вы будете менять самостоятельно? Админпанель согласуем и оплачиваем отдельно.'
        ],
        paragraphs: [
          'Для первой версии выберите то, что нужно бизнесу сейчас. Будущие страницы и функции лучше записать отдельно: так будет понятен объём запуска и то, что можно добавить позже.'
        ]
      }
    ]
  },
  {
    slug: 'kak-podgotovitsya-k-razrabotke',
    title: 'Как подготовиться к разработке сайта',
    description: 'Что описать в брифе, какие материалы собрать и как организовать согласования перед разработкой сайта для бизнеса.',
    sections: [
      {
        title: 'Опишите задачу простыми словами',
        paragraphs: [
          'Для начала достаточно рассказать, чем вы занимаетесь, кто ваши клиенты и какое действие вы ждёте от посетителя сайта. Если сайт уже есть, добавьте ссылку и объясните, что в нём мешает работе.',
          'Укажите желаемую дату запуска и причину, если она привязана к событию. Например, к открытию, выставке или началу рекламы. Это поможет определить состав первой версии.'
        ]
      },
      {
        title: 'Соберите то, что уже есть',
        paragraphs: [
          'Не нужно ждать идеального комплекта. Сложите материалы в одну папку и отметьте, что готово, что ещё изменится, а чего пока нет.'
        ],
        items: [
          'Описание услуг или товаров: что вы предлагаете, кому и на каких условиях.',
          'Фотографии, проекты, отзывы и другие материалы, которые можно использовать на сайте.',
          'Актуальные контакты, адреса, часы работы и ссылки на ваши страницы.',
          'Логотип и фирменные материалы, если они есть. Если логотипа нет, базовый логотип входит в работу.'
        ]
      },
      {
        title: 'Подберите несколько примеров с пояснениями',
        paragraphs: [
          'Достаточно двух-трёх сайтов. Рядом с каждой ссылкой напишите, что именно вам подходит: спокойная подача, крупные фотографии, понятное меню или способ показать услуги. Так примеры помогут обсудить ваши предпочтения.',
          'Полезны и примеры того, что вам не подходит, если вы можете объяснить почему. Не обязательно искать сайт из своей отрасли: важнее конкретное решение и его связь с вашей задачей.'
        ]
      },
      {
        title: 'Определите, кто согласовывает работу',
        paragraphs: [
          'Выберите одного человека, который собирает обратную связь и передаёт итоговое решение. Если в проекте участвуют несколько сотрудников, обсуждайте замечания внутри команды и присылайте их одним списком.',
          'Сначала согласуем задачу и структуру, затем дизайн и содержание. В замечании полезно описывать проблему: «клиент не поймёт, какая услуга ему нужна» точнее, чем «сделайте этот блок поинтереснее».'
        ]
      },
      {
        title: 'Зафиксируйте состав первой версии',
        items: [
          'Какие страницы, разделы и функции нужны к запуску.',
          'Кто готовит тексты и фотографии и когда передаёт их в работу.',
          'Нужны ли админпанель, оплата, доставка или подключения к другим сервисам. Админпанель оплачивается отдельно.',
          'Какие материалы вы будете обновлять после запуска и кто получит доступы.'
        ],
        paragraphs: [
          'Базовую SEO-подготовку включаем в разработку. Дальнейшее продвижение — отдельная задача. Состав, стоимость и сроки фиксируем до старта, чтобы у обеих сторон было одно понимание результата.',
          'Если часть ответов пока неизвестна, так и напишите в брифе. На первом обсуждении можно определить, что нужно решить сразу, а что не мешает начать работу.'
        ]
      }
    ]
  }
];

const cafeArticles = [
  {
    slug: 'chto-dolzhno-byt-na-sayte-kafe',
    title: 'Что должно быть на сайте кафе',
    description: 'Меню, контакты, бронирование и доставка: что важно показать гостю до визита.',
    label: 'Чек-лист'
  },
  {
    slug: 'kak-vybrat-format-sayta-dlya-kafe',
    title: 'Как выбрать формат сайта для кафе',
    description: 'Когда достаточно одной страницы, когда нужны отдельные разделы и когда — каталог с заказом.',
    label: 'Выбор формата'
  },
  {
    slug: 'kak-oformit-menyu-kafe-na-sayte',
    title: 'Как оформить меню кафе на сайте',
    description: 'Как сделать меню читаемым с телефона, актуальным и понятным для гостей.',
    label: 'Меню'
  }
];

function renderCard(article, label) {
  return `<article class="material-card"><span>${escapeHtml(label || article.label)}</span><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.description)}</p><a href="${materialPath(article.slug)}">Читать материал <span aria-hidden="true">→</span></a></article>`;
}

function renderBriefCta() {
  return `<section class="article-cta"><div><h2>Начните с короткого брифа</h2><p>Расскажите о бизнесе и задаче. Можно заполнить только то, что уже известно.</p></div><a class="button button-light" href="/brief/">Заполнить бриф <span aria-hidden="true">↗</span></a></section>`;
}

export function renderMaterialsIndex({header, footer, pageHead, origin, json}) {
  const title = 'Материалы о сайтах для бизнеса';
  const description = 'Как выбрать формат сайта, подготовить материалы и организовать работу над проектом. Практические статьи для владельцев бизнеса.';
  const allArticles = [...articles, ...cafeArticles];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: origin + '/materialy/',
    inLanguage: 'ru-RU',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: allArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: origin + materialPath(article.slug)
      }))
    }
  };
  return `<!doctype html><html lang="ru"><head>${pageHead(title, description, '/materialy/')}${json(schema)}</head><body id="top"><a class="skip-link" href="#main">Перейти к материалам</a>${header(false, 'materials')}<main id="main" class="article-shell wrap"><nav class="article-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / Материалы</nav><section class="materials-hero"><h1>Материалы о сайтах для бизнеса</h1><p>Практические статьи для тех, кто планирует сайт: как выбрать формат, собрать содержание и подготовиться к работе.</p></section><section class="materials-grid" aria-label="Подготовка сайта для бизнеса">${articles.map((article, index) => renderCard(article, index === 0 ? 'Выбор формата' : 'Подготовка к работе')).join('')}</section><section class="materials-niche" aria-labelledby="cafe-materials-title"><div class="materials-hero"><h2 id="cafe-materials-title">Для кафе и кофеен</h2><p>Отдельная подборка о меню, бронировании и информации, которая нужна гостю перед визитом.</p></div><div class="materials-grid">${cafeArticles.map(article => renderCard(article)).join('')}</div></section>${renderBriefCta()}</main>${footer()}</body></html>`;
}

export function renderMaterialPage(article, {header, footer, pageHead, origin, json}) {
  const route = materialPath(article.slug);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        inLanguage: 'ru-RU',
        mainEntityOfPage: origin + route,
        author: {'@type': 'Person', name: 'Глеб Ковалёв', url: origin + '/'}
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Главная', item: origin + '/'},
          {'@type': 'ListItem', position: 2, name: 'Материалы', item: origin + '/materialy/'},
          {'@type': 'ListItem', position: 3, name: article.title, item: origin + route}
        ]
      }
    ]
  };
  const content = article.sections.map(section => `<section><h2>${escapeHtml(section.title)}</h2>${(section.paragraphs || []).map(paragraph => `<p>${paragraph}</p>`).join('')}${section.items ? `<ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}</section>`).join('');
  return `<!doctype html><html lang="ru"><head>${pageHead(article.title, article.description, route)}${json(schema)}</head><body id="top"><a class="skip-link" href="#main">Перейти к статье</a>${header(false, 'materials')}<main id="main" class="article-shell wrap"><nav class="article-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/materialy/">Материалы</a> / ${escapeHtml(article.title)}</nav><article><header class="article-header"><h1>${escapeHtml(article.title)}</h1><p class="article-lead">${escapeHtml(article.description)}</p></header><div class="article-prose">${content}${renderBriefCta()}<p>Если удобнее начать с переписки, <a href="https://t.me/kovalev_gl" target="_blank" rel="noopener noreferrer">напишите в Telegram</a>. Отвечаю в течение дня.</p><p><a href="/materialy/">← Все материалы</a></p></div></article></main>${footer()}</body></html>`;
}
