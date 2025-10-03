import { createViewer } from './main.js';

const options = {
    // rendering
    antialias: true,
    powerPreference: 'high-performance',
    pixelRatioCap: 1.0, //render resolution

    // scene
    background: 0x2d2d2d,
    //fog: { color: 0x2d2d2d, near: 5, far: 20 },
    grid: true,

    // camera
    fov: 50,
    near: 0.1,
    far: 1000,
    cameraPos: [3, 2, 3],

    // light
    //directionalLight: { color: 0xffffff, intensity: 3.0, position: [5, 10, 7] },
    ambientLight: { color: 0xffffff, intensity: 3},

    // loaders
    dracoPath: '../lib/draco/',
    dracoWorkers: 1,

    //model to load
    modelUrl: '../models/capital.glb',
};

export const viewer = createViewer(options);
