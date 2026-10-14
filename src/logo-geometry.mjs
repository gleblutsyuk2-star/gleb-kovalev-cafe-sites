import {Shape, Vector2, CubicBezierCurve, ExtrudeGeometry, Float32BufferAttribute} from 'three';

// Same centerlines as the original GK, converted into closed rounded contours.
function curve(a,b,c,d, steps=24) {
  return new CubicBezierCurve(...[a,b,c,d].map(p=>new Vector2(...p))).getPoints(steps);
}
function strokeShape(points, radius=3.3) {
  const tangents = points.map((p,i)=> {
    const before=points[Math.max(0,i-1)], after=points[Math.min(points.length-1,i+1)];
    return after.clone().sub(before).normalize();
  });
  const left=points.map((p,i)=>p.clone().add(new Vector2(-tangents[i].y,tangents[i].x).multiplyScalar(radius)));
  const right=points.map((p,i)=>p.clone().add(new Vector2(tangents[i].y,-tangents[i].x).multiplyScalar(radius)));
  const outline=[...left];
  const end=points.at(-1), angle=Math.atan2(tangents.at(-1).y,tangents.at(-1).x);
  for(let i=1;i<=12;i++) outline.push(new Vector2(end.x+radius*Math.cos(angle+Math.PI/2-i*Math.PI/12),end.y+radius*Math.sin(angle+Math.PI/2-i*Math.PI/12)));
  outline.push(...right.reverse());
  const start=points[0], first=Math.atan2(tangents[0].y,tangents[0].x);
  for(let i=1;i<=12;i++) outline.push(new Vector2(start.x+radius*Math.cos(first-Math.PI/2-i*Math.PI/12),start.y+radius*Math.sin(first-Math.PI/2-i*Math.PI/12)));
  return new Shape(outline.map(p=>new Vector2((p.x-51)*.073,(40-p.y)*.073)));
}
export function createLogoPieces() {
  const a=curve([47,19],[42.6,13.8],[36.7,11],[29.7,11]);
  const b=curve([29.7,11],[16.4,11],[7,22.1],[7,40]);
  const c=curve([7,40],[7,57.9],[16.4,69],[30.8,69]);
  const d=curve([30.8,69],[38.6,69],[44.5,66.3],[49,61.5]);
  const lines=[
    [...a,...b.slice(1)], [...c,...d.slice(1)],
    [new Vector2(49,61.5),new Vector2(49,43),new Vector2(35,43)],
    [new Vector2(62,12),new Vector2(62,68)],
    [new Vector2(63,42),new Vector2(92,12)],
    [new Vector2(63,42),new Vector2(95,68)]
  ];
  return lines.map((line,i)=>{
    const geometry=new ExtrudeGeometry(strokeShape(line), {depth:.62,bevelEnabled:true,bevelThickness:.09,bevelSize:.035,bevelSegments:4,curveSegments:20,steps:1});
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
    return {geometry, direction: i<3?-1:1, offset:i};
  });
}
