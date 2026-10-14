import {WebGLRenderer,SRGBColorSpace,ACESFilmicToneMapping} from 'three';
export function viewport(host,container,{draw,resize,pause=()=>{},fallback=()=>{}}){
  let renderer;
  try{
    renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  }catch{return null;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<620?1.25:1.65));
  renderer.outputColorSpace=SRGBColorSpace;
  renderer.toneMapping=ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  container.append(renderer.domElement);
  let raf=0,visible=false,closed=false;
  const tick=time=>{raf=0;if(!closed&&visible&&!document.hidden){const moving=draw(renderer,time);host.dataset.rendered='true';if(moving)invalidate();}};
  const invalidate=()=>{if(!closed&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
  const measure=()=>{const box=container.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height,false);resize(box.width,box.height);invalidate();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pause(!visible||document.hidden);if(visible)invalidate();else{cancelAnimationFrame(raf);raf=0;}},{threshold:0});
  observer.observe(host);
  const resizeObserver=new ResizeObserver(measure);resizeObserver.observe(container);
  const visibility=()=>{pause(document.hidden||!visible);if(document.hidden){cancelAnimationFrame(raf);raf=0;}else invalidate();};
  document.addEventListener('visibilitychange',visibility);
  const contextLost=event=>{event.preventDefault();fallback();destroy();};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  function destroy(){
    if(closed)return;closed=true;cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();
    document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);
    renderer.dispose();renderer.domElement.remove();host.classList.remove('is-webgl');
    delete host.dataset.rendered;delete host.dataset.settled;
  }
  measure();
  return {renderer,invalidate,destroy};
}
