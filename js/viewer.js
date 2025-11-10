import { createViewer } from './main.js';

const options = {
    // rendering
    antialias: true,
    powerPreference: 'high-performance',
    pixelRatioCap: 1.0, //render resolution

    // Scene settings
    background: 0x2d2d2d,
    fog: { color: 0x2d2d2d, near: 0, far: 10 },
    grid: true,
    
    // Light settings
    directionalLight: { color: 0xffffff, intensity: 0.0, position: [5, 10, 7] },
    ambientLight: { color: 0xffffff, intensity: 3},

    // Model settings
    rotationX: 0,
    rotationY: 180,
    rotationZ: 0,

    // Camera settings
    fov: 45,
    near: 0.1,
    far: 1000,
    cameraPosition: [1, 0.8, 1.0], //x, y, z

    // loaders
    dracoPath: '../lib/draco/',
    dracoWorkers: 1,

    //model to load
    modelUrl: '../models/capital.glb',
};

export const viewer = createViewer(options);
