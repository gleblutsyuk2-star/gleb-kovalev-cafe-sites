'use strict';
(() => {
  const menuButton=document.querySelector('.menu-toggle'),mobileNav=document.getElementById('mobile-nav');
  if(menuButton&&mobileNav){
    const closeMenu=()=>{menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');mobileNav.hidden=true;};
    menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileNav.hidden=!open;});
    mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
    matchMedia('(min-width:851px)').addEventListener('change',closeMenu);
  }
  const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
  const privacy=document.getElementById('privacy-dialog');
  if(privacy){
    document.querySelectorAll('.privacy-trigger').forEach(button=>button.addEventListener('click',()=>privacy.showModal()));
    document.getElementById('close-privacy').addEventListener('click',()=>privacy.close());
    privacy.addEventListener('click',event=>{if(event.target!==privacy)return;const bounds=privacy.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)privacy.close();});
  }
  const contactForm=document.getElementById('contact-form');
  if(!contactForm)return;
  const statusText=document.getElementById('form-status'),submitButton=contactForm.querySelector('[type=submit]');
  let submitting=false;
  function setStatus(message,state){statusText.textContent=message;statusText.dataset.state=state;statusText.setAttribute('role',state==='error'?'alert':'status');}
  contactForm.addEventListener('input',event=>{if(event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)event.target.setCustomValidity('');});
  contactForm.addEventListener('submit',async event=>{
    event.preventDefault();if(submitting)return;
    const contact=contactForm.elements.namedItem('contact'),message=contactForm.elements.namedItem('message');
    contact.value=contact.value.trim();message.value=message.value.trim();
    contact.setCustomValidity(contact.value.length<3?'Укажите Telegram, телефон или почту.':'');
    message.setCustomValidity(message.value.length<10?'Расскажите о задаче чуть подробнее — хотя бы 10 символов.':'');
    if(!contactForm.reportValidity())return;
    if(contactForm.elements.namedItem('_honey').value){setStatus('Не удалось отправить заявку. Напишите, пожалуйста, в Telegram.','error');return;}
    submitting=true;submitButton.disabled=true;submitButton.textContent='Отправляю…';setStatus('','pending');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
    try{
      const payload=Object.fromEntries(new FormData(contactForm).entries());
      const response=await fetch('https://formsubmit.co/ajax/glebkovalev077@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json();
      if(!response.ok)throw new Error('Submission not accepted');
      if(/activat|confirm.*email|check.*email/i.test(result.message||'')){setStatus('Почтовый адрес получателя ещё ожидает подтверждения. Пожалуйста, напишите Глебу в Telegram. Введённые данные сохранены.','error');}
      else if(result.success!==true&&result.success!=='true')throw new Error('Submission not accepted');
      else{setStatus('Спасибо! Заявка принята. Свяжусь с вами по указанному контакту.','success');contactForm.reset();}
    }catch{setStatus('Не удалось подтвердить отправку. Данные остались в форме — попробуйте ещё раз или напишите в Telegram.','error');}
    finally{clearTimeout(timeout);submitting=false;submitButton.disabled=false;submitButton.replaceChildren(document.createTextNode('Отправить заявку '));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';submitButton.append(arrow);}
  });
})();
