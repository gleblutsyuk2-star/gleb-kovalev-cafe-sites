import {Scene,PerspectiveCamera,PlaneGeometry,Mesh,MeshBasicMaterial,TextureLoader,SRGBColorSpace,DoubleSide,GridHelper,Raycaster,Vector2} from 'three';
import {projects} from './projects.mjs';
import {projectIndex,wheelIntent,curvedVertex,clamp} from './motion-math.mjs';
import {viewport} from './viewport.mjs';
export function mount(host){
  const stage=host.querySelector('.gallery-stage'),container=host.querySelector('.gallery-canvas'),toolbar=host.querySelector('.gallery-toolbar');
  const full=host.hasAttribute('data-full-gallery'),scene=new Scene(),camera=new PerspectiveCamera(42,1,.1,100);
  camera.position.set(0,.3,6.8);camera.lookAt(0,-.12,0);
  let loaded=0;
  const state={position:0,target:0},cards=[],loader=new TextureLoader(),textures=projects.map(p=>loader.load(p.image,()=>{
    loaded++;
    if(loaded===projects.length&&!disposed){host.classList.add('is-webgl');toolbar.hidden=false;view?.invalidate();}
  },undefined,()=>cleanup()));
  textures.forEach(t=>{t.colorSpace=SRGBColorSpace;t.anisotropy=2;});
  let lastIndex=-1,drag=null,coastTimer=0,disposed=false;
  const grid=new GridHelper(50,40,0xa6b8d8,0xcbd6e6);grid.position.set(0,-2.2,-2);grid.material.transparent=true;grid.material.opacity=.38;scene.add(grid);
  for(let i=-3;i<=3;i++){
    const geometry=new PlaneGeometry(8.2,8.2*626/1262,64,8);
    const material=new MeshBasicMaterial({map:textures[projectIndex(i,3)],side:DoubleSide,toneMapped:false});
    material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n vec2 corner = max(abs(vMapUv - 0.5) - vec2(0.486, 0.472), 0.0); if (length(corner) > 0.014) discard;');};
    const mesh=new Mesh(geometry,material);mesh.userData.base=i;scene.add(mesh);
    cards.push({mesh,base:geometry.attributes.position.array.slice(),project:-1,virtual:i});
  }
  const name=host.querySelector('[data-project-name]'),type=host.querySelector('[data-project-type]'),open=host.querySelector('[data-project-open]');
  function updateCaption(){
    const index=projectIndex(state.position,projects.length);
    if(index===lastIndex)return;lastIndex=index;const p=projects[index];
    name.textContent=p.name;type.textContent=p.category;
    open.href=p.url;open.setAttribute('aria-label','Открыть сайт: '+p.name);host.dataset.project=p.id;
  }
  function draw(renderer){
    const delta=state.target-state.position;
    state.position+=delta*(drag?.active?.24:.085);
    if(Math.abs(delta)<.0003)state.position=state.target;
    const speed=clamp(delta*.28,-1,1),center=Math.round(state.position);
    for(let i=0;i<cards.length;i++){
      const card=cards[i],virtual=center+i-3,offset=virtual-state.position,index=projectIndex(virtual,3);
      card.virtual=virtual;
      if(index!==card.project){card.project=index;card.mesh.material.map=textures[index];}
      const pos=card.mesh.geometry.attributes.position;
      for(let v=0;v<pos.count;v++){const [x,y,z]=curvedVertex(card.base[v*3],card.base[v*3+1],speed,offset*8.42);pos.setXYZ(v,x,y,z);}
      pos.needsUpdate=true;card.mesh.geometry.computeBoundingSphere();
    }
    updateCaption();renderer.render(scene,camera);
    host.dataset.settled=String(Math.abs(state.target-state.position)<=.0003);
    return Math.abs(state.target-state.position)>.0003;
  }
  const view=viewport(host,container,{draw,resize:(w,h)=>{camera.aspect=w/h;camera.position.z=w<620?11.2:6.8;camera.updateProjectionMatrix();},fallback:()=>cleanup()});
  if(!view){disposed=true;cards.forEach(c=>{c.mesh.geometry.dispose();c.mesh.material.dispose();});textures.forEach(t=>t.dispose());grid.geometry.dispose();grid.material.dispose();return null;}
  function go(target){state.target=target;clearTimeout(coastTimer);view.invalidate();}
  const prev=()=>go(Math.round(state.target)-1),next=()=>go(Math.round(state.target)+1);
  const prevButton=host.querySelector('[data-gallery-prev]'),nextButton=host.querySelector('[data-gallery-next]');
  prevButton.addEventListener('click',prev);nextButton.addEventListener('click',next);
  function key(event){
    if(event.target!==stage)return;
    if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      event.preventDefault();
      if(event.key==='ArrowLeft')prev();if(event.key==='ArrowRight')next();if(event.key==='Home')go(0);if(event.key==='End')go(2);
    }
  }
  stage.addEventListener('keydown',key);
  function wheel(event){
    if(event.ctrlKey)return;const intent=wheelIntent(event.deltaX,event.deltaY,full);if(intent===null||intent===0)return;
    event.preventDefault();state.target+=clamp(intent,-220,220)*.0045*(event.deltaMode===1?12:1);view.invalidate();
    clearTimeout(coastTimer);coastTimer=setTimeout(()=>go(Math.round(state.target)),160);
  }
  stage.addEventListener('wheel',wheel,{passive:false});
  const raycaster=new Raycaster();
  const start=event=>{if(event.button!==0)return;clearTimeout(coastTimer);drag={x:event.clientX,y:event.clientY,lastX:event.clientX,time:event.timeStamp,speed:0,active:false,cancelled:false,pointer:event.pointerId};};
  const move=event=>{
    if(!drag||event.pointerId!==drag.pointer||drag.cancelled)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.active){
      if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
      if(Math.abs(dy)>Math.abs(dx)){drag.cancelled=true;return;}
      drag.active=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');
    }
    const width=stage.clientWidth,step=-(event.clientX-drag.lastX)/Math.max(200,width*.57);
    drag.speed=step;state.target+=step;drag.lastX=event.clientX;drag.time=event.timeStamp;view.invalidate();
  };
  const end=event=>{
    if(!drag||event.pointerId!==drag.pointer)return;
    if(drag.active){
      const inertia=event.timeStamp-drag.time<100?drag.speed*7:0;go(Math.round(state.target+inertia));
    }else if(!drag.cancelled&&event.type==='pointerup'){
      const b=stage.getBoundingClientRect();raycaster.setFromCamera(new Vector2((event.clientX-b.left)/b.width*2-1,-(event.clientY-b.top)/b.height*2+1),camera);
      const hit=raycaster.intersectObjects(cards.map(c=>c.mesh))[0];
      if(hit){const card=cards.find(c=>c.mesh===hit.object);go(card.virtual);}
    }
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);drag=null;stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerdown',start);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  view.invalidate();
  function cleanup(){
    if(disposed)return;disposed=true;clearTimeout(coastTimer);prevButton.removeEventListener('click',prev);nextButton.removeEventListener('click',next);
    stage.removeEventListener('keydown',key);stage.removeEventListener('wheel',wheel);stage.removeEventListener('pointerdown',start);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',end);stage.removeEventListener('pointercancel',end);
    cards.forEach(c=>{c.mesh.geometry.dispose();c.mesh.material.dispose();});textures.forEach(t=>t.dispose());grid.geometry.dispose();grid.material.dispose();view.destroy();toolbar.hidden=true;
  }
  return cleanup;
}
