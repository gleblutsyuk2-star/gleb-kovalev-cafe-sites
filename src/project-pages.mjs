import {projects} from './projects.mjs';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<span aria-hidden="true">↗</span>';
const externalLink=(url,label,className='')=>`<a${className?` class="${className}"`:''} href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ${arrow}</a>`;

/** Render a complete case page using the site's shared chrome and metadata. */
export function renderProjectPage(project,{header,footer,pageHead,origin,json}){
  const e=escapeHtml,study=project.caseStudy;
  if(!study)throw new Error(`Project ${project.id} has no case study`);
  const current=projects.findIndex(item=>item.id===project.id),next=projects[(current+1)%projects.length];
  const route=project.caseUrl||`/projects/${project.id}/`;
  const pageTitle=`${project.name} — ${study.format.toLowerCase()}`;
  const metadata=pageHead(pageTitle,project.description,route).replace(/(<meta property="og:image" content=")[^"]*(">)/,(_,start,end)=>start+e(origin+project.image)+end);
  const structured=json({'@context':'https://schema.org','@graph':[
    {'@type':'CreativeWork',name:project.name,description:project.description,url:origin+route,image:origin+project.image,inLanguage:'ru-RU',author:{'@type':'Person','@id':origin+'/#person',name:'Глеб Ковалёв',url:origin+'/'},about:project.category,sameAs:project.url},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Главная',item:origin+'/'},{'@type':'ListItem',position:2,name:'Проекты',item:origin+'/projects/'},{'@type':'ListItem',position:3,name:project.name,item:origin+route}]}
  ]});
  const mobile=study.mobile?`<section class="case-mobile wrap" aria-labelledby="case-mobile-title"><div class="case-mobile-copy"><p class="case-label">На телефоне</p><h2 id="case-mobile-title">${e(study.mobile.title)}</h2><p>${e(study.mobile.text)}</p><ul>${study.mobile.points.map(item=>`<li>${e(item)}</li>`).join('')}</ul></div><figure class="case-mobile-figure"><div class="case-mobile-screen"><img src="${e(study.mobile.image)}" alt="Сайт ${e(project.name)} на экране телефона" width="${study.mobile.width}" height="${study.mobile.height}" loading="lazy" decoding="async"></div><figcaption>${e(study.mobile.caption)}</figcaption></figure></section>`:'';
  return `<!doctype html>
<html lang="ru">
<head>${metadata}<link rel="stylesheet" href="/project-details.css">${structured}</head>
<body id="top" class="project-detail-page">
<a class="skip-link" href="#main">Перейти к проекту</a>
${header(false,'projects')}
<main id="main">
  <article>
    <div class="case-intro wrap">
      <nav class="case-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><a href="/projects/">Проекты</a><span aria-hidden="true">/</span><span aria-current="page">${e(project.name)}</span></nav>
      <header class="case-hero">
        <div class="case-title"><p class="case-label">${e(project.category)}<span aria-hidden="true">·</span>${e(study.format)}</p><h1>${e(project.name)}</h1></div>
        <div class="case-lead"><p>${e(study.lead)}</p><div class="case-actions">${externalLink(project.url,'Открыть сайт','button button-primary')}<a class="case-back" href="/projects/">Все проекты <span aria-hidden="true">→</span></a></div></div>
      </header>
      <dl class="case-facts"><div><dt>Моя роль</dt><dd>${e(study.role)}</dd></div><div><dt>В составе</dt><dd>${e(study.scope)}</dd></div><div><dt>Фокус</dt><dd>${e(study.focus)}</dd></div></dl>
    </div>
    <figure class="case-desktop wrap"><div class="case-screen"><div class="case-screen-bar" aria-hidden="true"><span class="case-screen-dots"><i></i><i></i><i></i></span><span>${e(new URL(project.url).hostname)}</span><span class="case-screen-device">Desktop</span></div><img src="${e(project.image)}" alt="Главный экран сайта ${e(project.name)} на компьютере" width="1262" height="626" fetchpriority="high" decoding="async"></div><figcaption>${e(study.desktopCaption)}</figcaption></figure>
    <section class="case-brief wrap" aria-labelledby="case-brief-title"><p class="case-label">Задача</p><div><h2 id="case-brief-title">${e(study.briefTitle)}</h2><p>${e(study.brief)}</p></div></section>
    <section class="case-decisions wrap" aria-labelledby="case-decisions-title"><div class="case-section-heading"><p class="case-label">Дизайн и сценарии</p><h2 id="case-decisions-title">${e(study.decisionsTitle)}</h2></div><div class="case-decision-list">${study.decisions.map(item=>`<section class="case-decision"><h3>${e(item.title)}</h3><p>${e(item.text)}</p></section>`).join('')}</div></section>
    ${mobile}
    <section class="case-explore wrap" aria-labelledby="case-explore-title"><div><p class="case-label">Живая версия</p><h2 id="case-explore-title">${e(study.viewingTitle)}</h2><p>${e(study.viewingText)}</p></div><div class="case-explore-links">${externalLink(project.url,'Открыть сайт','button button-primary')}${study.detailLink?externalLink(study.detailLink.url,study.detailLink.label,'case-inline-link'):''}</div></section>
  </article>
  <nav class="case-next wrap" aria-label="Следующий проект"><a href="${e(next.caseUrl)}"><div><span class="case-label">Следующий проект</span><h2>${e(next.name)} <span aria-hidden="true">↗</span></h2><p>${e(next.description)}</p></div><img src="${e(next.image)}" alt="" width="1262" height="626" loading="lazy" decoding="async"></a></nav>
  <section class="case-contact" aria-labelledby="case-contact-title"><div class="wrap"><div><p class="case-label">Обсудим ваш сайт</p><h2 id="case-contact-title">Есть похожая задача?</h2><p>Расскажите о бизнесе и о том, что должен делать сайт. Обсудим структуру, формат и следующий шаг.</p></div>${externalLink('https://t.me/kovalev_gl','Написать в Telegram','button button-light')}</div></section>
</main>
${footer()}
</body>
</html>`;
}
