import { THREE, controls, frameObject, getRoot, requestRender, doAndRender } from './main.js';

let auto = false;

const $ = (id) => document.getElementById(id);
const ROT_STEP  = THREE.MathUtils.degToRad(0.8);
const ROT_NUDGE = ROT_STEP * 10;
const Z_CLICK   = 1.01;
const Z_HOLD    = 1.01;

const act = (fn) => () => doAndRender(fn);

//holding down a button...
function hold(el, fnPerFrame) {
  let raf = null;
  const start = () => { if (raf) return; const tick = () => { fnPerFrame(); requestRender(); raf = requestAnimationFrame(tick); }; tick(); };
  const stop  = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
  el?.addEventListener('mousedown', start);
  el?.addEventListener('mouseup', stop);
  el?.addEventListener('mouseleave', stop);
  el?.addEventListener('touchstart', (e) => { e.preventDefault(); start(); }, { passive:false });
  el?.addEventListener('touchend', stop);
}

//rotate
$('rotL')?.addEventListener('click', act(() => controls.rotateLeft( ROT_NUDGE )));
$('rotR')?.addEventListener('click', act(() => controls.rotateLeft(-ROT_NUDGE )));
hold($('rotL'), () => controls.rotateLeft( ROT_STEP ));
hold($('rotR'), () => controls.rotateLeft(-ROT_STEP ));

//zoom
$('zoomIn') ?.addEventListener('click', act(() => controls.dollyIn( Z_CLICK )));
$('zoomOut')?.addEventListener('click', act(() => controls.dollyOut( Z_CLICK )));
hold($('zoomIn'),  () => controls.dollyIn( Z_HOLD ));
hold($('zoomOut'), () => controls.dollyOut( Z_HOLD ));

//fit, reset, auto
$('fit')  ?.addEventListener('click', () => { const r = getRoot(); if (r) { frameObject(r); requestRender(); }});
$('reset')?.addEventListener('click', act(() => controls.reset()));
$('auto') ?.addEventListener('click', () => { auto = !auto; controls.autoRotate = auto; requestRender(); });
