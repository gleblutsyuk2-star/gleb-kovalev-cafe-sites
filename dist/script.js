'use strict';
const rail=document.getElementById('case-rail');
const previousCase=document.getElementById('case-prev');
const nextCase=document.getElementById('case-next');
function updateCases(){
  previousCase.disabled=rail.scrollLeft<=2;
  nextCase.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;
}
function moveCase(direction){
  const distance=rail.querySelector('.case-card').getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap);
  rail.scrollBy({left:direction*distance,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
previousCase.addEventListener('click',()=>moveCase(-1));
nextCase.addEventListener('click',()=>moveCase(1));
rail.addEventListener('scroll',updateCases,{passive:true});
rail.addEventListener('keydown',event=>{
  if(event.target!==rail)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveCase(event.key==='ArrowLeft'?-1:1);}
});
new ResizeObserver(updateCases).observe(rail);
updateCases();
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');mobileNav.hidden=true;}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileNav.hidden=!open;});
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width:621px)').addEventListener('change',closeMenu);
document.querySelectorAll('[data-package]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('project-format').value=link.dataset.package;}));
const privacy=document.getElementById('privacy-dialog');
document.querySelectorAll('.privacy-trigger').forEach(button=>button.addEventListener('click',()=>privacy.showModal()));
document.getElementById('close-privacy').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',event=>{if(event.target!==privacy)return;const bounds=privacy.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)privacy.close();});
document.getElementById('year').textContent=new Date().getFullYear();
const contactForm=document.getElementById('contact-form');
const statusText=document.getElementById('form-status');
const submitButton=contactForm.querySelector('[type=submit]');
let submitting=false;
function setStatus(message,state){statusText.textContent=message;statusText.dataset.state=state;statusText.setAttribute('role',state==='error'?'alert':'status');}
contactForm.addEventListener('input',event=>{if(event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)event.target.setCustomValidity('');});
contactForm.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting)return;
  const contact=contactForm.elements.namedItem('contact');const message=contactForm.elements.namedItem('message');
  contact.value=contact.value.trim();message.value=message.value.trim();
  contact.setCustomValidity(contact.value.length<3?'Укажите Telegram, телефон или почту.':'');
  message.setCustomValidity(message.value.length<10?'Расскажите о задаче чуть подробнее — хотя бы 10 символов.':'');
  if(!contactForm.reportValidity())return;
  if(contactForm.elements.namedItem('_honey').value){setStatus('Не удалось отправить заявку. Напишите, пожалуйста, в Telegram.','error');return;}
  submitting=true;submitButton.disabled=true;submitButton.textContent='Отправляю…';setStatus('','pending');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
  try{
    const payload=Object.fromEntries(new FormData(contactForm).entries());
    const response=await fetch('https://formsubmit.co/ajax/glebkovalev077@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    const result=await response.json();
    if(!response.ok)throw new Error('Submission not accepted');
    if(/activat|confirm.*email|check.*email/i.test(result.message||'')){setStatus('Почтовый адрес получателя ещё ожидает подтверждения. Пожалуйста, напишите Глебу в Telegram. Введённые данные сохранены.','error');}
    else if(result.success!==true&&result.success!=='true'){throw new Error('Submission not accepted');}
    else{setStatus('Спасибо! Заявка принята. Свяжусь с вами по указанному контакту.','success');contactForm.reset();}
  }catch(error){setStatus('Не удалось подтвердить отправку. Данные остались в форме — попробуйте ещё раз или напишите в Telegram.','error');}
  finally{clearTimeout(timeout);submitting=false;submitButton.disabled=false;submitButton.replaceChildren(document.createTextNode('Отправить заявку '));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';submitButton.append(arrow);}
});
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.08});document.querySelectorAll('.included,.process-list,.about-grid').forEach(element=>{element.classList.add('js-reveal');observer.observe(element);});}
