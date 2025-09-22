import * as THREE from '../lib/three.module.js';
import { GLTFLoader } from '../lib/GLTFLoader.js';
import { DRACOLoader } from '../lib/DRACOLoader.js';
import { OrbitControls } from '../lib/OrbitControls.js';

//rendering
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

//scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d2d2d);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(2, 1.5, 3);

//lighting
const dir = new THREE.DirectionalLight(0xffffff, 0.05);
dir.position.set(5, 10, 7);
scene.add(dir);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//rendering on-demand
let needsRender = false;
function render() {
  needsRender = false;
  controls.update();
  renderer.render(scene, camera);
}
function requestRender() {
  if (!needsRender) {
    needsRender = true;
    requestAnimationFrame(render);
  }
}

function doAndRender(fn) { fn(); controls.update(); requestRender(); }

controls.addEventListener('change', requestRender); //only render when something moves not every frame
window.addEventListener('resize', () => {
  doAndRender(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); //refresh the camera
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });

//load model
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('../lib/draco/');
draco.setWorkerLimit(1);
loader.setDRACOLoader(draco);

let root = null;
loader.load(
  '../model/shelter.glb',
  (gltf) => {
    root = gltf.scene;
    scene.add(root);
    frameObject(root);
    requestRender();
  },
  undefined,
  (err) => console.error('GLB load error:', err)
);

//fit object to view
function frameObject(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  const fitH = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  const fitW = fitH / camera.aspect;
  const dist = 1.2 * Math.max(fitH, fitW);

  const dirVec = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  camera.position.copy(center).addScaledVector(dirVec, dist);

  controls.target.copy(center); //orbit controls spin around model
  camera.near = dist / 100;
  camera.far  = dist * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

//initial paint
requestRender();

//exports for ui.js
export { THREE, controls, frameObject, requestRender, doAndRender };
export function getRoot() { return root; }
