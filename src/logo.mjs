import {Scene,PerspectiveCamera,Group,Mesh,MeshPhysicalMaterial,HemisphereLight,DirectionalLight,PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {gsap} from 'gsap';
import {createLogoPieces} from './logo-geometry.mjs';
import {logoPose,logoCameraDistance,logoYawDelta,clamp} from './motion-math.mjs';
import {viewport} from './viewport.mjs';
export function mount(host){
  const container=host.querySelector('.logo-canvas'),controls=host.querySelector('.scene-controls');
  const scene=new Scene(),camera=new PerspectiveCamera(38,1,.1,100),group=new Group();
  camera.position.set(0,0,11.7);group.position.y=.48;group.scale.setScalar(.91);scene.add(group);
  scene.add(new HemisphereLight(0xffffff,0x738ab4,1.6));
  const key=new DirectionalLight(0xffffff,2.8);key.position.set(-3,5,8);scene.add(key);
  const rim=new DirectionalLight(0x8cbeff,3);rim.position.set(6,-2,2);scene.add(rim);
  const material=new MeshPhysicalMaterial({color:0x0a203a,metalness:.55,roughness:.3,envMapIntensity:.45,clearcoat:.35,clearcoatRoughness:.2});
  const edgeMaterial=new MeshPhysicalMaterial({color:0x3e7cdb,metalness:.8,roughness:.22,envMapIntensity:.8,clearcoat:.45});
  const pieces=createLogoPieces().map(({geometry,direction,offset})=>{
    const mesh=new Mesh(geometry,[material,edgeMaterial]);group.add(mesh);return {mesh,direction,offset};
  });
  const state={x:0,y:0,yaw:0,burst:0,spin:0};
  let pointerX=null,hasHovered=false,yawTarget=0;
  let materialIndex=0,posePinned=false,spin=null,labelIndex=1,labelTween=null,environment=null,pmrem=null,room=null,disposed=false;
  const labels=[['Дизайн','Характер, структура и детали'],['Разработка','Из дизайна — в работающий сайт'],['Запуск','Проверка, домен и передача доступов']];
  const label=host.querySelector('[data-logo-label]'),detail=host.querySelector('[data-logo-detail]');
  function changeLabel(next){
    if(next===labelIndex)return;labelIndex=next;
    labelTween?.kill();
    labelTween=gsap.timeline({onUpdate:()=>view?.invalidate()})
      .to([label,detail],{autoAlpha:0,y:8,duration:.12,stagger:.025})
      .call(()=>{label.textContent=labels[next][0];detail.textContent=labels[next][1];})
      .fromTo([label,detail],{y:-8,autoAlpha:0},{y:0,autoAlpha:1,duration:.25,stagger:.04});
  }
  function draw(renderer){
    const pose=logoPose(state.x,state.y,state.yaw),spread=Math.max(pose.spread,state.burst);
    group.rotation.set(pose.rotationX-.09,pose.rotationY+state.spin-.2,-.035+state.x*.06);
    for(const {mesh,direction,offset} of pieces){
      const amount=spread*(direction<0?.42:.56);
      mesh.position.set(direction*amount,spread*(offset%3-1)*.34,(offset%2?1:-1)*spread*.33);
      mesh.rotation.set(spread*(offset%2?1:-1)*.11,spread*direction*.13,spread*(offset-2.5)*.026);
      mesh.morphTargetInfluences[0]=spread*.8;
    }
    host.dataset.spread=spread.toFixed(3);
    host.dataset.yaw=state.yaw.toFixed(4);
    renderer.render(scene,camera);return false;
  }
  const view=viewport(host,container,{draw,resize:(w,h)=>{camera.aspect=w/h;camera.position.z=logoCameraDistance(w/h);camera.updateProjectionMatrix();},pause:value=>{if(value){spin?.pause();labelTween?.pause();}else{spin?.resume();labelTween?.resume();}},fallback:()=>cleanup()});
  if(!view){pieces.forEach(p=>p.mesh.geometry.dispose());material.dispose();edgeMaterial.dispose();return null;}
  pmrem=new PMREMGenerator(view.renderer);room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;room.dispose();pmrem.dispose();
  const xTo=gsap.quickTo(state,'x',{duration:.8,ease:'power3.out',onUpdate:view.invalidate});
  const yTo=gsap.quickTo(state,'y',{duration:.8,ease:'power3.out',onUpdate:view.invalidate});
  const yawTo=gsap.quickTo(state,'yaw',{duration:1.1,ease:'power3.out',onUpdate:view.invalidate});
  const move=event=>{
    if(event.pointerType==='touch')return;
    const bounds=host.getBoundingClientRect(),x=clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1),y=clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1);
    const previous=pointerX??(hasHovered?event.clientX:bounds.left+bounds.width/2);
    yawTarget+=logoYawDelta(event.clientX-previous,bounds.width);
    pointerX=event.clientX;hasHovered=true;yawTo(yawTarget);
    if(posePinned)return;
    xTo(x);yTo(y);changeLabel(logoPose(x,y).label);
  };
  const leave=()=>{pointerX=null;if(!posePinned){xTo(0);yTo(0);changeLabel(1);}};
  const rotate=event=>{
    if(event.target!==host||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();yawTarget+=(event.key==='ArrowRight'?1:-1)*Math.PI/6;yawTo(yawTarget);
  };
  const cycle=()=>{
    spin?.kill();gsap.killTweensOf(state,['spin','burst']);
    const start=state.spin;
    spin=gsap.timeline({onUpdate:view.invalidate,onComplete:()=>{state.spin=0;view.invalidate();}})
      .to(state,{spin:start+Math.PI*2,duration:1.45,ease:'power3.inOut'},0)
      .to(state,{burst:1,duration:.42,ease:'power2.out'},0)
      .call(()=>{materialIndex=(materialIndex+1)%3;host.dataset.material=String(materialIndex);material.color.set([0x0a203a,0x245bff,0xc4d2e9][materialIndex]);edgeMaterial.color.set([0x3e7cdb,0x78b7ff,0xe3efff][materialIndex]);material.metalness=materialIndex===2?.94:.55;material.roughness=materialIndex===2?.18:.3;},[],.55)
      .to(state,{burst:0,duration:.6,ease:'power2.inOut'},.68);
  };
  const togglePose=()=>{
    posePinned=!posePinned;host.querySelector('[data-logo-pose]').setAttribute('aria-pressed',String(posePinned));
    host.querySelector('[data-logo-pose]').setAttribute('aria-label',posePinned?'Собрать монограмму':'Разобрать монограмму');
    host.querySelector('[data-logo-pose]').innerHTML=(posePinned?'Собрать':'Разобрать')+' <span aria-hidden="true">↔</span>';
    xTo(posePinned?-.92:0);yTo(posePinned?.1:0);changeLabel(posePinned?0:1);
  };
  container.addEventListener('pointermove',move);container.addEventListener('pointerleave',leave);container.addEventListener('click',cycle);
  host.addEventListener('keydown',rotate);
  const poseButton=host.querySelector('[data-logo-pose]'),materialButton=host.querySelector('[data-logo-material]');
  poseButton.addEventListener('click',togglePose);materialButton.addEventListener('click',cycle);
  host.dataset.material='0';host.classList.add('is-webgl');controls.hidden=false;view.invalidate();
  function cleanup(){
    if(disposed)return;disposed=true;spin?.kill();labelTween?.kill();xTo.tween.kill();yTo.tween.kill();yawTo.tween.kill();
    gsap.set([label,detail],{clearProps:'transform,opacity,visibility'});
    label.textContent=labels[1][0];detail.textContent=labels[1][1];
    container.removeEventListener('pointermove',move);container.removeEventListener('pointerleave',leave);container.removeEventListener('click',cycle);
    host.removeEventListener('keydown',rotate);delete host.dataset.yaw;
    poseButton.removeEventListener('click',togglePose);materialButton.removeEventListener('click',cycle);
    pieces.forEach(p=>p.mesh.geometry.dispose());material.dispose();edgeMaterial.dispose();environment?.dispose();view.destroy();controls.hidden=true;
  }
  return cleanup;
}
