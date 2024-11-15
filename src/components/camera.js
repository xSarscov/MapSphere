import * as THREE from 'three';

export function initCamera(scene) {
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('white', 1);
    directionalLight.position.set(0, 0, 15);
    scene.add(directionalLight);

    return camera;
}

export function updateCamera(matrix, camera) {
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
}
