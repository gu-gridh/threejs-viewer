import { viewer } from './viewer.js';

const $ = (id) => document.getElementById(id);
let auto = false;

const THREE = viewer.three;
const ROT_STEP = THREE.MathUtils.degToRad(0.8);
const ROT_NUDGE = ROT_STEP * 10;
const Z_CLICK = 1.01;
const Z_HOLD = 1.01;

//holding down a button...
function hold(el, step) {
  let intervalId = null;

  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      step();
      viewer.requestRender();
    }, 16);
  };

  const stop = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  el?.addEventListener('mousedown', start);
  el?.addEventListener('mouseup', stop);
  el?.addEventListener('mouseleave', stop);
  el?.addEventListener('touchstart', (e) => { e.preventDefault(); start(); }, { passive: false });
  el?.addEventListener('touchend', stop);
}

//rotate
$('rotL')?.addEventListener('click', () => viewer.rotateLeft(ROT_NUDGE));
$('rotR')?.addEventListener('click', () => viewer.rotateRight(ROT_NUDGE));
hold($('rotL'), () => viewer.rotateLeft(ROT_STEP));
hold($('rotR'), () => viewer.rotateRight(ROT_STEP));

//zoom
$('ZoomIn')?.addEventListener('click', () => viewer.zoomIn(Z_CLICK));
$('ZoomOut')?.addEventListener('click', () => viewer.zoomOut(Z_CLICK));
hold($('ZoomIn'), () => viewer.zoomIn(Z_HOLD));
hold($('ZoomOut'), () => viewer.zoomOut(Z_HOLD));

//fit, reset, auto
$('fit')?.addEventListener('click', () => viewer.frameObject());
$('reset')?.addEventListener('click', () => viewer.reset());
$('auto')?.addEventListener('click', () => { auto = !auto; viewer.toggleAuto(); });
