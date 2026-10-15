import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const server=spawn(process.execPath,['server.mjs'],{stdio:['ignore','pipe','pipe']});
const base=await new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(match)resolve(match[0]);});server.on('error',reject);});
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
await mkdir('artifacts/redesign',{recursive:true});
let failures=0, passed=0;
async function check(name,fn){if(process.env.TEST_FILTER&&!name.includes(process.env.TEST_FILTER))return;try{await page.emulateMedia({reducedMotion:'no-preference'});await fn();passed++;console.log('PASS '+name);}catch(e){failures++;console.error('FAIL '+name+' — '+e.stack);}}
const context=await browser.newContext();
await context.route(/mc\.yandex|mc\.yandex\.ru/,route=>route.abort());
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(base);
  await check('header and hero keep separate assets for the selected GK identity',async()=>{
    const heroSource=await page.locator('.hero-fallback').getAttribute('src');
    const headerSource=await page.locator('.brand-mark').getAttribute('src');
    assert.notEqual(headerSource,heroSource,'header still shares the hero logo asset');
    assert.equal(heroSource,'/assets/logo-gk.svg','hero fallback changed');
    const response=await page.request.get(base+headerSource);
    assert.equal(response.status(),200);
    assert.match(response.headers()['content-type'],/image\/svg/);
    for(const route of ['/','/projects/','/uslugi/lending/','/uslugi/sayt-kompanii/','/uslugi/internet-magazin/','/materialy/','/materialy/chto-dolzhno-byt-na-sayte-kafe/','/materialy/kak-vybrat-format-sayta-dlya-kafe/','/materialy/kak-oformit-menyu-kafe-na-sayte/','/sozdanie-saytov-dlya-kafe-v-moskve/','/uslugi/lending-dlya-kafe/','/uslugi/mnogostranichnyy-sayt-dlya-kafe/','/uslugi/internet-magazin-dlya-kafe/']){
      await page.goto(base+route);
      assert.equal(await page.locator('.brand-mark').getAttribute('src'),headerSource);
      await page.waitForFunction(()=>{const image=document.querySelector('.brand-mark');return image.complete&&image.naturalWidth>0;});
      assert.equal(await page.locator('.brand').getAttribute('href'),'/');
    }
    for(const width of [390,768,1440]){
      await page.setViewportSize({width,height:900});await page.goto(base);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'header overflow');
      await page.screenshot({path:'artifacts/redesign/header-monogram-'+width+'.png'});
    }
    await page.goto(base);
  });
  await check('selected navy header mark has transparent background and visible blue bevels',async()=>{
    await page.goto(base);
    const pixels=await page.evaluate(async()=>{
      const image=new Image();image.src=document.querySelector('.brand-mark').src;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,320,180);
      const data=ctx.getImageData(0,0,320,180).data;
      let filled=0,navy=0,blue=0;
      for(let i=0;i<data.length;i+=4){
        if(data[i+3]<240)continue;filled++;
        if(data[i]<45&&data[i+1]<85&&data[i+2]<150)navy++;
        if(data[i+2]>140&&data[i+2]>data[i+1]*1.25)blue++;
      }
      return {filled,navy,blue,corners:[data[3],data[319*4+3],data[179*320*4+3],data[data.length-1]]};
    });
    assert.ok(pixels.filled>320*180*.1,'header logo is empty or too small');
    assert.ok(pixels.navy>pixels.filled*.45,'selected dark navy face is missing');
    assert.ok(pixels.blue>pixels.filled*.04,'blue bevels are missing');
    assert.deepEqual(pixels.corners,[0,0,0,0],'logo includes a white background instead of transparency');
  });
  await check('new GK fallback matches the selected header mark',async()=>{
    const hero=await page.request.get(base+'/assets/logo-gk.svg');
    const header=await page.request.get(base+'/assets/logo-gk-header.svg');
    assert.equal(hero.status(),200);assert.equal(header.status(),200);
    const normalize=text=>text.replaceAll('\r\n','\n').trim();
    assert.equal(normalize(await hero.text()),normalize(await header.text()),'static fallback still shows the old rounded GK');
  });
  await check('new GK pointer has lower gain and a smooth weighted settling',async()=>{
    await page.setViewportSize({width:1440,height:900});await page.goto(base);
    await page.waitForSelector('.hero-scene[data-rendered="true"]');
    const motion=await page.locator('.logo-canvas').evaluate(async container=>{
      const host=container.closest('.hero-scene'),b=host.getBoundingClientRect();
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const pointer=x=>container.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:b.left+b.width*x,clientY:b.top+b.height*.5,bubbles:true}));
      const start=Number(host.dataset.yaw);pointer(.5);pointer(.9);
      await wait(200);const early=Number(host.dataset.yaw)-start;
      await wait(1300);const settled=Number(host.dataset.yaw)-start;
      container.dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));
      return {early,settled};
    });
    assert.ok(Math.abs(motion.settled-Math.PI*.36)<.04,'a 40% sweep rotates too far');
    assert.ok(motion.early>.02,'movement should respond immediately');
    assert.ok(motion.early<motion.settled*.9,'rotation snaps instead of easing into its final angle');
  });
  await check('new GK keeps assembly, three materials and mobile controls',async()=>{
    await page.setViewportSize({width:390,height:900});await page.goto(base);
    await page.waitForSelector('.hero-scene[data-rendered="true"]');
    await page.locator('[data-logo-pose]').click();
    await page.waitForFunction(()=>Number(document.querySelector('.hero-scene').dataset.spread)>.8);
    assert.equal(await page.locator('[data-logo-pose]').getAttribute('aria-pressed'),'true');
    await page.screenshot({path:'artifacts/redesign/new-gk-separated.png'});
    await page.locator('[data-logo-pose]').click();
    await page.waitForFunction(()=>Number(document.querySelector('.hero-scene').dataset.spread)<.02);
    for(const index of ['1','2','0']){
      await page.locator('[data-logo-material]').click();
      await page.waitForFunction(expected=>document.querySelector('.hero-scene').dataset.material===expected,index);
      await page.screenshot({path:'artifacts/redesign/new-gk-material-'+index+'.png'});
    }
  });
  await check('clean presentation without decorative numbers or concept badges',async()=>{
    for(const route of ['/','/projects/']){
      await page.goto(base+route);
      const text=await page.locator('body').innerText();
      assert.doesNotMatch(text,/Учебн|Независимый|\b0[1-7]\b/i);
      assert.equal(await page.locator('.eyebrow,.service-index,.project-number,.scene-meta,.article-label').count(),0);
    }
    await page.goto(base);
  });
  await check('logo hover turns repeatedly without dragging and keeps orientation on leave',async()=>{
    await page.setViewportSize({width:1440,height:900});await page.goto(base);await page.waitForSelector('.hero-scene.is-webgl');
    const host=page.locator('.hero-scene'),b=await host.boundingBox(),y=b.y+b.height*.45;
    const yaw=()=>host.getAttribute('data-yaw').then(Number);
    // Measure keyboard rotation before the pointer's independent easing starts.
    await host.focus();await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>Number(document.querySelector('.hero-scene').dataset.yaw)>.3,{},{timeout:5000});
    for(let i=0;i<4;i++){
      await page.mouse.move(b.x-10,y);
      await page.mouse.move(b.x+b.width*.08,y);
      await page.mouse.move(b.x+b.width*.92,y,{steps:15});
    }
    await page.waitForFunction(()=>Number(document.querySelector('.hero-scene').dataset.yaw)>Math.PI*2,{},{timeout:5000});
    const before=await yaw();await page.mouse.move(20,20);await page.waitForTimeout(900);
    assert.ok(await yaw()>=before-.01,'leaving scene resets full turns');
    const retained=await yaw();
    for(let i=0;i<4;i++){
      await page.mouse.move(b.x+b.width+10,y);
      await page.mouse.move(b.x+b.width*.92,y);
      await page.mouse.move(b.x+b.width*.08,y,{steps:15});
    }
    await page.waitForFunction(value=>Number(document.querySelector('.hero-scene').dataset.yaw)<value-Math.PI*2,retained,{timeout:5000});
  });
  await page.goto(base);
  await check('shared site: projects navigation, footer and contact journey',async()=>{
    await page.setViewportSize({width:1440,height:900});
    await page.locator('.desktop-nav').getByRole('link',{name:'Проекты',exact:true}).click();
    assert.equal(new URL(page.url()).pathname,'/projects/');
    assert.equal(await page.locator('.desktop-nav a[aria-current="page"]').innerText(),'Проекты');
    assert.equal(await page.locator('.site-footer .footer-brand').isVisible(),true);
    await page.locator('.site-footer .privacy-trigger').click();
    assert.equal(await page.locator('#privacy-dialog').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.locator('.projects-contact').getByRole('link',{name:/Обсудить проект/}).click();
    await page.locator('#contact-form').waitFor({state:'visible'});
    assert.equal(new URL(page.url()).pathname,'/');
    assert.equal(new URL(page.url()).hash,'#contact');
    assert.equal(await page.locator('#contact-form').isVisible(),true);
  });
  await check('shared site: logo is unframed and phone controls remain usable',async()=>{
    for(const width of [390,768,1440]){
      await page.setViewportSize({width,height:900});await page.goto(base);
      await page.waitForSelector('.hero-scene[data-rendered="true"]');
      const surface=await page.locator('.hero-scene').evaluate(e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderWidth,after:getComputedStyle(e,'::after').content}));
      assert.equal(surface.background,'rgba(0, 0, 0, 0)','logo still has a backplate');
      assert.equal(surface.border,'0px');
      assert.equal(surface.after,'none','logo still has a framing overlay');
      for(const button of await page.locator('.scene-controls button').all())assert.ok((await button.boundingBox()).height>=44,'small logo touch target');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
    }
  });
  await check('business offer and service routes',async()=>{
    assert.match(await page.locator('h1').innerText(),/ваш бизнес/);
    assert.equal(await page.locator('.service-card a[href^="/uslugi/"]').count(),3);
    for(const url of ['/uslugi/lending/','/uslugi/sayt-kompanii/','/uslugi/internet-magazin/'])assert.equal((await page.request.get(base+url)).status(),200);
  });
  for(const width of [390,768,1440])await check('layout '+width,async()=>{
    await page.setViewportSize({width,height:900});await page.goto(base);
    await page.waitForSelector('.hero-scene[data-rendered="true"]');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
    assert.equal(await page.locator('.gallery-fallback .project-card').count(),5);
    await page.screenshot({path:'artifacts/redesign/hero-'+width+'.png'});
    await page.locator('#cases').scrollIntoViewIfNeeded();
    await page.waitForSelector('.project-gallery.is-webgl[data-rendered="true"]');
    await page.screenshot({path:'artifacts/redesign/gallery-'+width+'.png'});
    await page.screenshot({path:'artifacts/redesign/home-'+width+'.png',fullPage:true});
  });
  await page.setViewportSize({width:1440,height:900});await page.goto(base);
  await check('WebGL logo pointer and material controls',async()=>{
    await page.waitForSelector('.hero-scene.is-webgl',{timeout:12000});
    const scene=page.locator('.hero-scene'),bounds=await scene.boundingBox();
    await page.mouse.move(bounds.x+bounds.width*.95,bounds.y+bounds.height*.45);
    await page.waitForFunction(()=>Number(document.querySelector('.hero-scene').dataset.spread)>.5);
    await page.locator('[data-logo-material]').click();
    await page.waitForFunction(()=>document.querySelector('.hero-scene').dataset.material==='1');
    await page.screenshot({path:'artifacts/redesign/logo-interaction.png'});
  });
  await check('main gallery navigation leaves page wheel scroll intact',async()=>{
    await page.locator('#cases').scrollIntoViewIfNeeded();
    await page.waitForSelector('.project-gallery.is-webgl');
    const next=page.locator('[data-gallery-next]');await next.click();
    await page.waitForFunction(()=>document.querySelector('[data-project-name]').textContent==='Четверг');
    assert.match(await page.locator('[data-project-open]').getAttribute('href'),/cafe-chetverg/);
    const before=await page.evaluate(()=>scrollY);await page.mouse.move(650,400);await page.mouse.wheel(0,350);
    await page.waitForFunction(value=>scrollY>value+50,before);
  });
  await check('full gallery uses same projects, wheel and keyboard',async()=>{
    await page.goto(base+'/projects/');await page.locator('.project-gallery').scrollIntoViewIfNeeded();await page.waitForSelector('.project-gallery.is-webgl');
    await page.mouse.move(700,450);await page.mouse.wheel(0,250);
    await page.waitForFunction(()=>document.querySelector('[data-project-name]').textContent!=='Переговорка');
    await page.locator('.gallery-stage').focus();await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('[data-project-name]').textContent==='Переговорка');
    await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('[data-project-name]').textContent==='DrivePro');
    await page.waitForFunction(()=>document.querySelector('[data-gallery]').dataset.settled==='true');
    await page.locator('.projects-intro h1').click();
    await page.screenshot({path:'artifacts/redesign/projects-1440.png'});
  });
  await check('form success, failure and trimmed payload without real emails',async()=>{
    await page.goto(base);let received;
    await page.route('https://formsubmit.co/ajax/**',async route=>{received=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:'true',message:'Form submitted successfully'})});});
    const fill=async()=>{await page.locator('[name="company"]').fill('Тестовая компания');await page.locator('[name="contact"]').fill('  @example  ');await page.locator('[name="message"]').fill('  Нужен сайт для бизнеса и каталог услуг.  ');await page.locator('[name="consent"]').check();};
    await fill();await page.locator('[type="submit"]').click();await page.waitForSelector('[data-state="success"]');
    assert.equal(received.contact,'@example');assert.equal(received.company,'Тестовая компания');assert.equal(await page.locator('[name="contact"]').inputValue(),'');
    await page.unroute('https://formsubmit.co/ajax/**');await page.route('https://formsubmit.co/ajax/**',route=>route.fulfill({status:500,contentType:'application/json',body:'{"success":false}'}));
    await fill();await page.locator('[type="submit"]').click();await page.waitForSelector('[data-state="error"]');
    assert.equal(await page.locator('[name="contact"]').inputValue(),'@example');assert.equal(await page.locator('[type="submit"]').isDisabled(),false);
  });
  await check('changing to reduced motion cancels scenes and restores static labels',async()=>{
    await page.goto(base);await page.waitForSelector('.hero-scene.is-webgl');
    const b=await page.locator('.hero-scene').boundingBox();
    await page.mouse.move(b.x+5,b.y+b.height*.4);
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-logo-label]')).opacity==='0');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForSelector('.hero-scene:not(.is-webgl)');
    assert.equal(await page.locator('.hero-fallback').isVisible(),true);
    assert.equal(await page.locator('[data-logo-label]').isVisible(),true);
    assert.equal(await page.locator('.logo-canvas canvas').count(),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForSelector('.hero-scene.is-webgl');
  });
  await check('back-forward page lifecycle restores a single working scene',async()=>{
    await page.goto(base);await page.waitForSelector('.hero-scene.is-webgl');
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
    assert.equal(await page.locator('.logo-canvas canvas').count(),0);
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await page.waitForSelector('.hero-scene.is-webgl',{timeout:5000});
    assert.equal(await page.locator('.logo-canvas canvas').count(),1);
  });
  await check('slow imports survive rapid reduced-motion changes without duplicate mounts',async()=>{
    const c=await browser.newContext();await c.route(/mc\.yandex/,route=>route.abort());
    let release,requested;const gate=new Promise(resolve=>release=resolve),requestSeen=new Promise(resolve=>requested=resolve);
    await c.route(/\/motion-chunks\/logo-/,async route=>{requested();await gate;await route.continue();});
    const p=await c.newPage();await p.goto(base,{waitUntil:'domcontentloaded'});
    await requestSeen;
    await p.evaluate(()=>{window.qaMotionChanges=0;matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>window.qaMotionChanges++);});
    await p.emulateMedia({reducedMotion:'reduce'});
    await p.waitForFunction(()=>window.qaMotionChanges===1);
    await p.emulateMedia({reducedMotion:'no-preference'});
    await p.waitForFunction(()=>window.qaMotionChanges===2);
    release();await p.waitForSelector('.hero-scene.is-webgl');
    assert.equal(await p.locator('.logo-canvas canvas').count(),1);
    await p.emulateMedia({reducedMotion:'reduce'});
    await p.waitForSelector('.hero-scene:not(.is-webgl)');
    assert.equal(await p.locator('.logo-canvas canvas').count(),0);
    await c.close();
  });
  await check('phone touch swipe changes projects and vertical gesture scrolls page',async()=>{
    const c=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});await c.route(/mc\.yandex/,route=>route.abort());
    const p=await c.newPage();await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#cases').scrollIntoViewIfNeeded();await p.waitForSelector('.project-gallery.is-webgl');await p.locator('.gallery-stage').scrollIntoViewIfNeeded();
    const client=await c.newCDPSession(p),b=await p.locator('.gallery-stage').boundingBox(),y=b.y+b.height/2;
    const touch=(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1,radiusX:2,radiusY:2}]});
    await touch('touchStart',310,y);
    for(const x of [280,230,180,130,80])await touch('touchMove',x,y);
    await touch('touchEnd',80,y);
    await p.waitForFunction(()=>document.querySelector('[data-project-name]').textContent!=='Переговорка');
    const before=await p.evaluate(()=>scrollY);
    await touch('touchStart',195,y);
    for(const dy of [30,70,110,160])await touch('touchMove',195,y-dy);
    await touch('touchEnd',195,y-160);
    await p.waitForFunction(value=>scrollY>value+30,before);
    await c.close();
  });
  await check('full page touch gallery leaves vertical scrolling to the page',async()=>{
    const c=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});await c.route(/mc\.yandex/,route=>route.abort());
    const p=await c.newPage();
    try{
      await p.goto(base+'/projects/',{waitUntil:'domcontentloaded'});await p.waitForSelector('.project-gallery.is-webgl');await p.locator('.gallery-stage').scrollIntoViewIfNeeded();
      const client=await c.newCDPSession(p),b=await p.locator('.gallery-stage').boundingBox(),y=b.y+b.height/2;
      const touch=(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1,radiusX:2,radiusY:2}]});
      const before=await p.evaluate(()=>scrollY);
      await touch('touchStart',195,y);
      for(const dy of [30,70,110,160])await touch('touchMove',195,y-dy);
      await touch('touchEnd',195,y-160);
      await p.waitForFunction(value=>scrollY>value+30,before,{timeout:5000});
      assert.equal(await p.locator('[data-project-name]').innerText(),'Переговорка');
      // Native touch scrolling can still coast; do not reuse moving stage bounds.
      await p.waitForFunction(async()=>{
        const before=scrollY;await new Promise(resolve=>setTimeout(resolve,150));
        return Math.abs(scrollY-before)<1;
      });
      await p.locator('.gallery-stage').scrollIntoViewIfNeeded();
      const bounds=await p.locator('.gallery-stage').boundingBox(),sy=bounds.y+bounds.height/2;
      await touch('touchStart',310,sy);
      for(const x of [280,230,180,130,80])await touch('touchMove',x,sy);
      await touch('touchEnd',80,sy);
      await p.waitForFunction(()=>document.querySelector('[data-project-name]').textContent!=='Переговорка');
    }finally{await c.close();}
  });
  await check('context loss preserves static links and controls do not return',async()=>{
    await page.goto(base+'/projects/');await page.locator('.project-gallery').scrollIntoViewIfNeeded();await page.waitForSelector('.project-gallery.is-webgl');
    await page.evaluate(()=>document.querySelector('.gallery-canvas canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>!document.querySelector('.project-gallery').classList.contains('is-webgl'));
    assert.equal(await page.locator('.gallery-fallback').isVisible(),true);
    assert.equal(await page.locator('.gallery-toolbar').isVisible(),false);
  });
  for(const config of [{javaScriptEnabled:false},{reducedMotion:'reduce'}])await check('static fallback '+JSON.stringify(config),async()=>{
    const c=await browser.newContext(config);const p=await c.newPage();await p.goto(base);
    assert.equal(await p.locator('.gallery-fallback .project-card').count(),5);
    assert.equal(await p.locator('.gallery-fallback').isVisible(),true);
    assert.equal(await p.locator('.hero-fallback').isVisible(),true);
    assert.equal(await p.locator('.project-card a').first().getAttribute('href'),'/projects/peregovorka/');
    await c.close();
  });
  await check('WebGL unavailable falls back',async()=>{
    const c=await browser.newContext();await c.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
    await c.route(/mc\.yandex/,route=>route.abort());
    const p=await c.newPage();await p.goto(base+'/projects/',{waitUntil:'domcontentloaded'});await p.waitForLoadState('networkidle');
    assert.equal(await p.locator('.gallery-canvas canvas').count(),0);
    assert.equal(await p.locator('.gallery-toolbar').isVisible(),false);
    assert.equal(await p.locator('.gallery-fallback').isVisible(),true);
    await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForLoadState('networkidle');
    assert.equal(await p.locator('.hero-fallback').isVisible(),true);await c.close();
  });
  await check('no runtime exceptions',()=>assert.deepEqual(errors,[]));
} finally {await browser.close();server.kill();}
console.log('Results: '+passed+' passed, '+failures+' failed');
process.exitCode=failures?1:0;
