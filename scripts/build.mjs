import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {projects} from '../src/projects.mjs';
import {services,faqs} from '../src/content.mjs';
import {renderServicePage,renderBriefPage} from '../src/service-pages.mjs';
import {renderProjectPage} from '../src/project-pages.mjs';
import {articles,renderMaterialsIndex,renderMaterialPage} from '../src/material-pages.mjs';
import {header,footer,serviceIllustration,gallery,pageHead,origin,escapeHtml as e} from '../src/templates.mjs';
const json=value=>'<script type="application/ld+json">'+JSON.stringify(value).replaceAll('<','\\u003c')+'</script>';
const person={'@type':'Person','@id':origin+'/#person',name:'Глеб Ковалёв',url:origin+'/',image:origin+'/assets/gleb-portrait-v5.webp',jobTitle:'Дизайнер и разработчик сайтов',email:'glebkovalev077@gmail.com',sameAs:['https://t.me/kovalev_gl']};
// Keep the no-WebGL/reduced-motion hero consistent with the selected brand mark.
await writeFile('dist/assets/logo-gk.svg',await readFile('dist/assets/logo-gk-header.svg','utf8'));
let home=await readFile('src/home.html','utf8');
const shared={header,footer,pageHead,origin,person,json};
async function writeRoute(route,html){await mkdir('dist'+route,{recursive:true});await writeFile('dist'+route+'index.html',html);}
const serviceCards='<div class="services-grid">'+services.map(s=>`<article class="service-card"><h3>${s.name}</h3>${serviceIllustration(s.slug)}<p class="service-scope">${e(s.scope)} · ${e(s.time)}</p><p>${s.description}</p><ul>${s.items.map(item=>'<li>'+item+'</li>').join('')}</ul><div class="service-price">от ${new Intl.NumberFormat('ru-RU').format(s.price)} ₽<span>за согласованный объём</span></div><a class="service-cta" href="/uslugi/${s.slug}/">Подробнее о формате <span aria-hidden="true">↗</span></a></article>`).join('')+'</div>';
home=home.replace('<!-- HEADER -->',header(true)).replace('<!-- FOOTER -->',footer()).replace('<!-- GALLERY -->',gallery()).replace('<!-- SERVICES -->',serviceCards).replace('<!-- FAQ -->',faqs.map(([q,a])=>`<details><summary>${e(q)}<span aria-hidden="true">+</span></summary><p>${e(a)}</p></details>`).join(''));
home=home.replace('<!-- SCHEMA -->',json({'@context':'https://schema.org','@graph':[person,{'@type':'WebSite',url:origin+'/',name:'Глеб Ковалёв — сайты для бизнеса',inLanguage:'ru-RU',publisher:{'@id':person['@id']}},{'@type':'Service',name:'Дизайн и разработка сайтов для бизнеса',serviceType:['Лендинги','Сайты компаний','Интернет-магазины'],provider:{'@id':person['@id']}},{'@type':'FAQPage',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}]}));
await writeFile('dist/index.html',home);
const directory=projects.map(p=>`<article class="project-card"><a href="${p.caseUrl}"><img src="${p.image}" alt="Главный экран сайта ${e(p.name)}" width="1262" height="626" loading="lazy" decoding="async"><h2>${e(p.name)}<span aria-hidden="true">↗</span></h2></a><p>${e(p.description)}</p><small>${e(p.category)}</small></article>`).join('');
await writeRoute('/projects/',`<!doctype html><html lang="ru"><head>${pageHead('Проекты — дизайн и разработка сайтов','Пять проектов: FORGE, DrivePro и сайты кафе. Разбор задач, дизайна и структуры.','/projects/')}<script type="module" src="/assets/motion.js"></script>${json({'@context':'https://schema.org','@type':'CollectionPage',name:'Проекты Глеба Ковалёва',url:origin+'/projects/',mainEntity:{'@type':'ItemList',itemListElement:projects.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:origin+p.caseUrl}))}})}</head><body id="top" class="projects-page"><a class="skip-link" href="#main">Перейти к проектам</a>${header(false,'projects')}<main id="main"><div class="projects-intro wrap"><div><nav class="article-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / Проекты</nav><h1>Разные задачи.<br>Свой характер.</h1></div><p>Строительство, автосервис, кафе и кофейни. Посмотрите сайты и решения, из которых складывается каждый проект.</p></div><section class="project-directory wrap" aria-label="Все проекты">${directory}</section><div class="projects-3d-heading wrap"><h2>Посмотреть в движении</h2><p>Та же коллекция — в объёмной галерее.</p></div>${gallery(true)}<section class="projects-contact wrap"><div><h2>Теперь о вашем<br>проекте.</h2><p>Расскажите о задаче. Предложу формат и состав работы. Отвечу в течение одного дня.</p></div><a class="button button-primary" href="https://t.me/kovalev_gl" target="_blank" rel="noopener noreferrer">Написать в Telegram <span aria-hidden="true">↗</span></a></section></main>${footer()}</body></html>`);
for(const project of projects)await writeRoute(project.caseUrl,renderProjectPage(project,shared));
for(const service of services)await writeRoute('/uslugi/'+service.slug+'/',renderServicePage(service,shared));
await writeRoute('/brief/',renderBriefPage(shared));
await writeRoute('/materialy/',renderMaterialsIndex(shared));
for(const article of articles)await writeRoute('/materialy/'+article.slug+'/',renderMaterialPage(article,shared));
// Mechanical refresh of tracked niche pages only; their café-specific content stays intact.
const legacy=['uslugi/lending-dlya-kafe','uslugi/mnogostranichnyy-sayt-dlya-kafe','uslugi/internet-magazin-dlya-kafe','sozdanie-saytov-dlya-kafe-v-moskve','materialy/chto-dolzhno-byt-na-sayte-kafe','materialy/kak-vybrat-format-sayta-dlya-kafe','materialy/kak-oformit-menyu-kafe-na-sayte'];
for(const route of legacy){
const file='dist/'+route+'/index.html';let html=await readFile(file,'utf8');
html=html.replace(/#(?:efede5|F5F7FA)/g,'#FFFFFF').replace(/\/assets\/logo-(?:gk-bean|cafe-grid)\.svg/g,'/assets/logo-gk.svg').replace(/family=Golos\+Text:[^"]*/g,'family=Golos+Text:wght@400;450;500;550;600;650;700&display=swap');
html=html.replace(/<header class="site-header wrap">[\s\S]*?<\/header>(?:<nav id="mobile-nav"[\s\S]*?<\/nav>)?/,header());
if(!html.includes('src="/script.js"'))html=html.replace('</head>','<script src="/script.js" defer></script></head>');
html=html.replace('>Создание сайтов для кафе</a></footer>','>Сайты для бизнеса</a></footer>');
html=html.replace(/<p class="article-label">[\s\S]*?<\/p>/g,'');
html=html.replace(/<body([^>]*)>/,(_,attrs)=>'<body'+(attrs.includes('id="top"')?attrs:attrs+' id="top"')+'>');
html=html.replace(/<footer class="(?:article-footer|site-footer) wrap">[\s\S]*?<\/footer>(?:\s*<dialog id="privacy-dialog"[\s\S]*?<\/dialog>)?/,footer());
await writeFile(file,html);
}
const routes=['/','/projects/','/brief/','/materialy/',...projects.map(p=>p.caseUrl),...articles.map(a=>'/materialy/'+a.slug+'/'),...services.map(s=>'/uslugi/'+s.slug+'/'),...legacy.map(s=>'/'+s+'/')];
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>'<url><loc>'+origin+route+'</loc></url>').join('')+'</urlset>\n');
await build({entryPoints:{motion:'src/motion.mjs'},outdir:'dist/assets',bundle:true,minify:true,format:'esm',splitting:true,target:['es2020'],chunkNames:'motion-chunks/[name]-[hash]',legalComments:'linked'});
console.log('Built home, 5 cases, 3 services, brief, business materials, niche pages and motion bundles.');
