const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=new Map();
let generation=0;
function clearScenes(){generation++;scenes.forEach(destroy=>destroy());scenes.clear();}
function setup(){
  clearScenes();
  const version=generation;
  if(motionQuery.matches)return;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      observer.unobserve(entry.target);
      const el=entry.target;
      const loader=el.hasAttribute('data-logo-scene')?import('./logo.mjs'):import('./gallery.mjs');
      loader.then(module=>{
        if(motionQuery.matches||version!==generation||!el.isConnected||scenes.has(el))return;
        const cleanup=module.mount(el);
        if(cleanup)scenes.set(el,cleanup);
      }).catch(()=>{ /* Static HTML remains usable if motion cannot load. */ });
    }
  },{rootMargin:'250px',threshold:0});
  document.querySelectorAll('[data-logo-scene],[data-gallery]').forEach(el=>observer.observe(el));
  scenes.set(observer,()=>observer.disconnect());
}
motionQuery.addEventListener('change',setup);
window.addEventListener('pagehide',clearScenes);
window.addEventListener('pageshow',event=>{if(event.persisted)setup();});
setup();
