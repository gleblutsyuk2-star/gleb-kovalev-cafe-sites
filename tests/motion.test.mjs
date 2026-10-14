import test from 'node:test';
import assert from 'node:assert/strict';

// Catch broken wrapping, reversed navigation and page-scroll capture.
test('gallery loops through three real projects in either direction', async () => {
  const { projectIndex } = await import('../src/motion-math.mjs');
  assert.equal(projectIndex(0, 3), 0);
  assert.equal(projectIndex(3, 3), 0);
  assert.equal(projectIndex(-1, 3), 2);
  assert.equal(projectIndex(7, 3), 1);
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
