import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { GLTFLoader } from '../lib/GLTFLoader.js';
import { DRACOLoader } from '../lib/DRACOLoader.js';

export function createViewer(opts = {}) {
  const { //defaults
    antialias = true,
    powerPreference = 'high-performance',
    pixelRatioCap = 1.5,
    background = 0x2d2d2d,
    fog = null,
    grid = false,
    fov = 50, near = 0.1, far = 2000,
    cameraPos = [2, 1.5, 3],
    light = null,
    dracoPath = null,
    dracoWorkers = 1,
    modelUrl = null,
  } = opts;

  //rendering
  const renderer = new THREE.WebGLRenderer({ antialias, powerPreference });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('app').appendChild(renderer.domElement);

  //scene and camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  if (fog) {
    scene.fog = new THREE.Fog(
      fog.color ?? background,
      fog.near ?? 5,
      fog.far ?? 20
    );
  }

  if (grid === true) {
    const helper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    helper.material.transparent = true;
    helper.material.opacity = 0.6;
    scene.add(helper);
  }

  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far
  );
  camera.position.set(...cameraPos);

  //lighting
  if (light) {
    const dir = new THREE.DirectionalLight(light.color ?? 0xffffff, light.intensity ?? 0.05);
    const [lx, ly, lz] = light.position ?? [5, 10, 7];
    dir.position.set(lx, ly, lz);
    scene.add(dir);
  }

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

  const doAndRender = (fn) => { fn(); controls.update(); requestRender(); };

  controls.addEventListener('change', requestRender); //only render when something moves not every frame
  window.addEventListener('resize', () => {
    doAndRender(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();  //refresh the camera
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestRender();
  });

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
    camera.updateProjectionMatrix();
    controls.update();
  }

  //loading
  const loader = new GLTFLoader();
  let draco = null;
  if (dracoPath) {
    draco = new DRACOLoader();
    draco.setDecoderPath(dracoPath);
    draco.setWorkerLimit(dracoWorkers);
    loader.setDRACOLoader(draco);
  }

  let root = null;
  if (modelUrl) {
    loader.load(
      modelUrl,
      (gltf) => {
        root = gltf.scene;
        scene.add(root);
        frameObject(root);
        requestRender();
      },
      undefined,
      (err) => console.error(err)
    );
  } else {
    requestRender();
  }

  return {
    three: THREE,
    scene,
    camera,
    controls,
    getRoot: () => root,
    frameObject: (obj = root) => { if (obj) { frameObject(obj); requestRender(); } },
    requestRender,
    doAndRender,
    rotateLeft: (rad) => doAndRender(() => controls.rotateLeft(rad)),
    rotateRight: (rad) => doAndRender(() => controls.rotateLeft(-rad)),
    zoomIn: (factor) => doAndRender(() => controls.dollyIn(factor)),
    zoomOut: (factor) => doAndRender(() => controls.dollyOut(factor)),
    reset: () => doAndRender(() => controls.reset()),
    toggleAuto: () => doAndRender(() => { controls.autoRotate = !controls.autoRotate; }),
    dispose: () => { draco?.dispose?.(); renderer.dispose(); },
  };
}
