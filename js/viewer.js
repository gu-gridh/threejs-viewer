import { createViewer } from './main.js';

const options = {
    //rendering
    antialias: true,
    powerPreference: 'high-performance',
    pixelRatioCap: 1.0, //render resolution

    //scene
    background: 0x2d2d2d,

    //camera
    fov: 50,
    near: 0.1,
    far: 2000,
    cameraPos: [2, 1.5, 3],

    //light
    light: { color: 0xffffff, intensity: 0.05, position: [5, 10, 7] }, 

    //loaders
    dracoPath: '../lib/draco/',
    dracoWorkers: 1,

    //model to load
    modelUrl: '../model/shelter.glb',
};

export const viewer = createViewer(options);
