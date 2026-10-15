export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const projectIndex = (index, count) => ((Math.round(index) % count) + count) % count;
export const logoCameraDistance = aspect => Math.max(11.7, 7.6 / (2 * Math.tan(38 * Math.PI / 360) * Math.max(.1, aspect)));
export function logoYawDelta(deltaX,width){
  if(!Number.isFinite(deltaX)||!Number.isFinite(width)||width<=0)return 0;
  return clamp(deltaX/width,-1,1)*Math.PI*.9;
}
export function wheelIntent(x, y, full) {
  if (full) return Math.abs(x) > Math.abs(y) ? x : y;
  return Math.abs(x) > Math.abs(y) ? x : null;
}
export function logoPose(x, y, yaw = x * 1.18) {
  x = clamp(x, -1, 1); y = clamp(y, -1, 1);
  return {spread: Math.pow(Math.abs(x), 1.6), rotationY: yaw,
    rotationX: y * .24, label: x < -.3 ? 0 : x > .3 ? 2 : 1};
}
export function curvedVertex(x, y, speed = 0, centerX = 0) {
  // All cards pass through one fixed field, not a curve in their local space.
  const worldX = x + centerX;
  const wave = Math.exp(-Math.pow((worldX + 1) / 3, 2)) - Math.exp(-1 / 9);
  return [worldX, y * (1 + wave * .11),
    wave * (1.7 + clamp(Math.abs(speed), 0, 1) * .4)];
}
