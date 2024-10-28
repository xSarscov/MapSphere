import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { initCamera, updateCamera } from './camera';
import { handleMovement, stopMovement, updateModelPosition } from './movement';

const { VITE_GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_MAP_ID } = getEnvVariables();
const apiOptions = {
    apiKey: VITE_GOOGLE_MAPS_API_KEY,
    version: "beta"
};
const mapOptions = {
    "tilt": 67.5,
    "heading": 0,
    "zoom": 21,
    "center": { lat: 39.9012, lng: -0.3431 },
    "mapId": VITE_GOOGLE_MAPS_MAP_ID,
    disableDefaultUI: true,
    keyboardShortcuts: false,
};

async function initMap() {
    const mapDiv = document.getElementById("app");
    const apiLoader = new Loader(apiOptions);
    await apiLoader.load();
    return new google.maps.Map(mapDiv, mapOptions);
}

function initWebGLOverlayView(map) {
    let scene, camera, loader, model, renderer, lastMouseX = 0, lastMouseY = 0;
    const webGLOverlayView = new google.maps.WebGLOverlayView();
    const speed = 0.8; 
    let moveForward = false,
        moveBackward = false,
        moveLeft = false,
        moveRight = false;
    let lastTime = 0;
    let mixer; 

    webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = initCamera(scene);
        loader = new GLTFLoader();
        const source = "/src/models/character/character.gltf";

        loader.load(source, gltf => {
            model = gltf.scene;
            model.scale.set(9, 9, 9);
            model.rotation.x = Math.PI / 2;
            model.position.set(0, 0, -9);
            scene.add(model);
            mixer = new THREE.AnimationMixer(model);

            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        });

        document.addEventListener('keydown', (event) => {
            const moves = handleMovement(event, moveForward, moveBackward, moveLeft, moveRight);
            moveForward = moves.moveForward;
            moveBackward = moves.moveBackward;
            moveLeft = moves.moveLeft;
            moveRight = moves.moveRight;
        });

        document.addEventListener('keyup', (event) => {
            const moves = stopMovement(event, moveForward, moveBackward, moveLeft, moveRight);
            moveForward = moves.moveForward;
            moveBackward = moves.moveBackward;
            moveLeft = moves.moveLeft;
            moveRight = moves.moveRight;
        });

        document.addEventListener('mousemove', onMouseMove);
    };

    function onMouseMove(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY; 
        const deltaX = mouseX - lastMouseX;
        const deltaY = -mouseY + lastMouseY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        const sensitivity = 0.5;
        const newHeading = map.heading + (deltaX * sensitivity);
        const newTilt = map.tilt + (deltaY * 0.7);

        map.moveCamera({
            heading: newHeading,
            tilt: newTilt
        });
    }

    webGLOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: gl.canvas,
            context: gl,
            ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;

        loader.manager.onLoad = () => {
            renderer.setAnimationLoop((time) => {
                const delta = (time - lastTime) / 1000;
                lastTime = time;

                if (mixer) mixer.update(delta);
                updateModelPosition(model, map, moveForward, moveBackward, moveLeft, moveRight, speed, mapOptions);
            });
        };
    };

    webGLOverlayView.onDraw = ({ gl, transformer }) => {
        const latLngAltitudeLiteral = {
            lat: mapOptions.center.lat,
            lng: mapOptions.center.lng,
            altitude: 10
        };
        
        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        updateCamera(matrix, camera);

        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
    };

    webGLOverlayView.setMap(map);
}

export const createGoogleMap = async () => {
    const map = await initMap();
    initWebGLOverlayView(map);
};
