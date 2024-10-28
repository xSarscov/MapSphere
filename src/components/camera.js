import * as THREE from 'three';

export function initCamera(scene) {
    const camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
    return camera;
}

export function updateCamera(matrix, camera) {
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
}
