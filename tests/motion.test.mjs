import test from 'node:test';
import assert from 'node:assert/strict';

// Catch broken wrapping, reversed navigation and page-scroll capture.
test('gallery wraps at both boundaries for three and five items', async () => {
  const { projectIndex } = await import('../src/motion-math.mjs');
  assert.equal(projectIndex(0, 3), 0);
  assert.equal(projectIndex(3, 3), 0);
  assert.equal(projectIndex(-1, 3), 2);
  assert.equal(projectIndex(7, 3), 1);
  assert.equal(projectIndex(4, 5), 4);
  assert.equal(projectIndex(5, 5), 0);
  assert.equal(projectIndex(-1, 5), 4);
  assert.equal(projectIndex(12, 5), 2);
});
test('main gallery ignores vertical wheel, full gallery accepts it', async () => {
  const { wheelIntent } = await import('../src/motion-math.mjs');
  assert.equal(wheelIntent(0, 100, false), null);
  assert.equal(wheelIntent(20, 100, false), null);
  assert.equal(wheelIntent(100, 10, false), 100);
  assert.equal(wheelIntent(0, -100, true), -100);
});
test('logo stays assembled in center and separates at both edges', async () => {
  const { logoPose } = await import('../src/motion-math.mjs');
  assert.equal(logoPose(0, 0).spread, 0);
  assert.equal(logoPose(-1, 0).spread, 1);
  assert.equal(logoPose(1, 0).spread, 1);
  assert.equal(logoPose(99, -99).spread, 1);
  assert.ok(Number.isFinite(logoPose(99, -99).rotationY));
});
test('logo preserves accumulated full turns without widening vertical tilt', async () => {
  const { logoPose } = await import('../src/motion-math.mjs');
  assert.equal(logoPose(.8, .5, Math.PI * 4).rotationY, Math.PI * 4);
  assert.equal(logoPose(-.8, -.5, -Math.PI * 6).rotationY, -Math.PI * 6);
  assert.equal(logoPose(.8, 99, Math.PI * 4).rotationX, .24);
  assert.equal(logoPose(-.8, -99, -Math.PI * 6).rotationX, -.24);
});
test('gallery deformation belongs to a screen zone rather than each card', async () => {
  const { curvedVertex } = await import('../src/motion-math.mjs');
  const first = curvedVertex(1, 1, 0, 2);
  const second = curvedVertex(-2, 1, 0, 5);
  assert.deepEqual(first, second, 'different cards meeting at world x=3 must share the same surface');
  assert.notEqual(curvedVertex(0, 1, 0, 0)[2], curvedVertex(0, 1, 0, 5)[2], 'moving a card must change its shape');
});
test('curved project planes have depth and speed-sensitive bending', async () => {
  const { curvedVertex } = await import('../src/motion-math.mjs');
  assert.deepEqual(curvedVertex(0, 0, 0), [0, 0, 0]);
  assert.ok(curvedVertex(3, 1, 0)[2] < -.15);
  assert.notEqual(curvedVertex(3, 1, .8)[2], curvedVertex(3, 1, 0)[2]);
});
test('GK geometry is extruded, bevelled, segmented and has morph targets', async () => {
  const { createLogoPieces } = await import('../src/logo-geometry.mjs');
  const pieces = createLogoPieces();
  assert.ok(pieces.length >= 5);
  for (const { geometry } of pieces) {
    geometry.computeBoundingBox();
    assert.ok(geometry.boundingBox.max.z - geometry.boundingBox.min.z > .5);
    assert.ok(geometry.parameters.options.bevelEnabled);
    assert.equal(geometry.morphAttributes.position.length, 1);
    assert.ok([...geometry.attributes.position.array].every(Number.isFinite));
    geometry.dispose();
  }
});
test('logo camera reserves enough horizontal room on narrow scene ratios',async()=>{
  const {logoCameraDistance}=await import('../src/motion-math.mjs');
  for(const aspect of [.62,.81,1.08]){
    const visibleWidth=2*logoCameraDistance(aspect)*Math.tan(38*Math.PI/360)*aspect;
    assert.ok(visibleWidth>=7.3,'GK is cropped at aspect '+aspect);
  }
});

test('faceted GK preserves the selected wide silhouette, counter and angular cutouts',async()=>{
  const {createLogoPieces}=await import('../src/logo-geometry.mjs');
  const {Mesh,MeshBasicMaterial,Raycaster,Vector3,Box3}=await import('three');
  const material=new MeshBasicMaterial();
  const meshes=createLogoPieces().map(({geometry})=>new Mesh(geometry,material));
  meshes.forEach(mesh=>mesh.updateMatrixWorld());
  // Measure the assembled vertices, not the bounds of every possible morph pose.
  const bounds=new Box3();meshes.forEach(mesh=>bounds.union(new Box3().setFromBufferAttribute(mesh.geometry.attributes.position)));
  const size=bounds.getSize(new Vector3());
  assert.ok(size.x/size.y>1.75,'the hero still has the old narrow rounded silhouette');
  for(const [x,y,occupied,name] of [
    [-3.1242,-.0246,true,'G left stem'],[-1.9762,1.5334,true,'G top'],
    [-1.9762,.6314,false,'G counter'],[-1.3202,-.1066,true,'G crossbar'],
    [-1.7302,-1.4186,true,'G bottom'],[-.5002,.5494,true,'G right stem'],
    [2.3698,1.4514,true,'K upper arm'],[2.6158,-1.4186,true,'K lower arm'],
    [.5658,1.0414,false,'space above joint'],[2.6158,-.0246,false,'K right notch'],
    [-3.3702,1.6974,false,'upper-left chamfer']
  ]){
    const ray=new Raycaster(new Vector3(x,y,5),new Vector3(0,0,-1));
    assert.equal(ray.intersectObjects(meshes).length>0,occupied,name);
  }
  meshes.forEach(mesh=>mesh.geometry.dispose());material.dispose();
});

test('weighted pointer gain slows each sweep without limiting accumulated full turns',async()=>{
  const {logoYawDelta}=await import('../src/motion-math.mjs');
  assert.equal(logoYawDelta(0,600),0);
  assert.ok(Math.abs(logoYawDelta(600,600)-Math.PI*.9)<1e-12);
  assert.ok(Math.abs(logoYawDelta(-300,600)+Math.PI*.45)<1e-12);
  let yaw=0;for(let i=0;i<12;i++)yaw+=logoYawDelta(300,600);
  assert.ok(yaw>Math.PI*4,'slower movement must still allow unlimited full turns');
  assert.equal(logoYawDelta(200,0),0);
  assert.equal(logoYawDelta(Infinity,600),0);
});
