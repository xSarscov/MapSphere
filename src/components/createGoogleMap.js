import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { VRButton } from 'three/addons/webxr/VRButton.js';


const { VITE_GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_MAP_ID } = getEnvVariables();

const apiOptions = {
  apiKey: VITE_GOOGLE_MAPS_API_KEY,
  version: "beta"
};

let renderer, xrSession = null;

async function startXR() {
  if (navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
    
    if (isSupported) {
      xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor', 'bounded-floor']
      });

      renderer.xr.setSession(xrSession);
    } else {
      console.warn("XR no soportado en este dispositivo");
    }
  } else {
    console.warn("XR no está disponible en este navegador");
  }
}

async function setupVRButton() {
  const vrButton = VRButton.createButton(renderer);
  vrButton.onclick =  () => startXR()
  document.body.appendChild(vrButton);

  
}

const mapOptions = {
  "tilt": 0,
  "heading": 0,
  "zoom": 18,
  "center": { lat: 40.712573, lng: -74.006186 },
  "mapId": VITE_GOOGLE_MAPS_MAP_ID,
};

async function initMap() {
  const mapDiv = document.getElementById("app");

  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();
  return new google.maps.Map(mapDiv, mapOptions);
}

function initWebGLOverlayView(map) {
  let scene, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();

  webGLOverlayView.onAdd = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    loader = new GLTFLoader();
    const source = "pin.gltf";
    loader.load(source, gltf => {
      gltf.scene.scale.set(25, 25, 25);
      gltf.scene.rotation.x = Math.PI;
      scene.add(gltf.scene);
    });
  };

  webGLOverlayView.onContextRestored = ({ gl }) => {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.xr.enabled = true;
    renderer.autoClear = false;

    setupVRButton();

    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          "tilt": mapOptions.tilt,
          "heading": mapOptions.heading,
          "zoom": mapOptions.zoom,
        });

        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5;
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  webGLOverlayView.onDraw = ({ gl, transformer }) => {
    const latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 120
    };

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

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
