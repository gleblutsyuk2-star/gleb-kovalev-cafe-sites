import {Shape,Vector2,ExtrudeGeometry,Float32BufferAttribute} from 'three';

// Six solid parts in the same 884×508 design space as logo-gk-header.svg.
const contours=[
  [[12,247],[12,119],[120,12],[211,12],[211,125],[154,125],[125,155],[125,247]],
  [[211,12],[344,12],[434,102],[434,221],[344,221],[344,125],[211,125]],
  [[12,247],[125,247],[125,333],[154,362],[344,362],[344,305],[434,305],[434,387],[344,482],[119,482],[12,400]],
  [[211,221],[434,221],[434,217],[476,217],[639,230],[489,302],[434,302],[434,305],[211,305]],
  [[476,217],[674,12],[858,12],[639,230]],
  [[639,230],[870,482],[677,482],[489,302]]
];
export function createLogoPieces(){
  return contours.map((points,i)=>{
    const shape=new Shape(points.map(([x,y])=>new Vector2((x-441)*.0082,(247-y)*.0082)));
    const geometry=new ExtrudeGeometry(shape,{depth:.62,bevelEnabled:true,bevelThickness:.09,bevelSize:.035,bevelSegments:1,curveSegments:1,steps:1});
    geometry.translate(0,0,-.31);
    const base=geometry.attributes.position;
    const morph=new Float32Array(base.array.length);
    for(let j=0;j<base.count;j++){
      morph[j*3]=base.getX(j);
      morph[j*3+1]=base.getY(j)*(1+(i%2?-.06:.06));
      morph[j*3+2]=base.getZ(j)+Math.sin(base.getY(j)*1.2+i)*.28;
    }
    geometry.morphAttributes.position=[new Float32BufferAttribute(morph,3)];
    geometry.computeVertexNormals();
    return {geometry,direction:i<4?-1:1,offset:i};
  });
}
