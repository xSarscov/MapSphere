import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getEnvVariables } from './helpers/getEnvVariables';
import { GoogleGenerativeAI } from '@google/generative-ai';

const { VITE_GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_MAP_ID, VITE_GEMINI_API_KEY } = getEnvVariables();

let map, minimap, renderer, scene, camera, character, arrow, characterMixer;
let minimapDirectionsService, minimapDirectionsRenderer;
let characterMarker;
let lastTime = 0;
let movementSpeed = 0.00001;
let keysPressed = {};
let lastMouseX = 0, lastMouseY = 0;
let destinationCoordinates = null;
let arrowVisible = false; 
let infoWindow;
let marker;
let characterActions = {}; 
let bubble;
let lockCamera = false;

const genAI = new GoogleGenerativeAI(VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const prompt = `
    You are an expert tour guide on Google Maps 3D, designed to help users explore and understand places around the world. Your main goal is to provide accurate, engaging, and useful information about nearby places or any specified location. ...
`;

const apiOptions = {
    apiKey: VITE_GOOGLE_MAPS_API_KEY,
    version: 'beta',
    libraries: ['places', 'geometry', 'marker']
};

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const mapOptions = {
    tilt: 67.5,
    heading: 0,
    zoom: 19,
    center: { lat:  12.1328200, lng: -86.2504000 },
    mapId: "15431d2b469f209e",
    draggable: false,
    disableDefaultUI: true,
    scrollwheel: false,
    fullscreenControl: true

};

function initMinimap() {
    minimap = new google.maps.Map(document.getElementById('minimap'), {
        mapId: "15431d2b469f209e",
        center: mapOptions.center,
        zoom: 15,
        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
        keyboardShortcuts: false
    });
    const pinBackground = new google.maps.marker.PinElement({
        background: "#FF0000", 
    });

    characterMarker = new google.maps.marker.AdvancedMarkerElement({
        position: mapOptions.center,
        map: minimap,
        content: pinBackground.element, 
    });

    minimapDirectionsService = new google.maps.DirectionsService();
    minimapDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: minimap,
    });

    const destinationInput = document.getElementById('destination-input');
    const calculateRouteButton = document.getElementById('calculate-route');
    const clearRouteButton = document.getElementById('clear-route');
    

    calculateRouteButton.addEventListener('click', () => {
        if (destinationInput.value.length === 0) return;
        const destination = destinationInput.value;
        calculateMinimapRoute(destination);
        document.getElementById('destination-input').value = "";
    });

    clearRouteButton.addEventListener('click', () => {
        document.getElementById('destination-input').value = "";
        clearRoute();
    });
}

async function initMap() {
    const mapDiv = document.getElementById('map');
    const minimapDiv = document.getElementById('minimap');
    const apiLoader = new Loader(apiOptions);
    await apiLoader.load();

    map = new google.maps.Map(mapDiv, mapOptions);

    minimap = new google.maps.Map(minimapDiv, {
        center: mapOptions.center,
        zoom: 21,
        disableDefaultUI: true,
    });

    minimapDirectionsService = new google.maps.DirectionsService();
    minimapDirectionsRenderer = new google.maps.DirectionsRenderer({ map: minimap });

    const pinBackground = new google.maps.marker.PinElement({
        background: "#FF0000", 
    });
    
    characterMarker = new google.maps.marker.AdvancedMarkerElement({
        position: mapOptions.center,
        map: minimap,
        content: pinBackground.element, 
    });

    infoWindow = new google.maps.InfoWindow({});
}

function updateMinimapCharacterPosition(lat, lng) {
    const newPosition = { lat, lng };
    characterMarker.position = new google.maps.LatLng(newPosition);
    minimap.setCenter(newPosition);
}

function loadArrowModel() {
    if (arrow) return; 
    const loader = new GLTFLoader();
    const arrowPath = '/models/arrow/arrow.gltf';

    loader.load(arrowPath, (gltf) => {
        arrow = gltf.scene;
        arrow.scale.set(5, 5, 5);
        arrow.position.set(0, 0, 15); 
        arrow.rotation.x = Math.PI / 2; 
        scene.add(arrow);
        arrowVisible = false; 
    });
}

function calculateMinimapRoute(destination) {
    if (arrow) {
        scene.remove(arrow);
        arrow = null;
    }

    minimapDirectionsRenderer.setDirections({ routes: [] });

    const currentPosition = characterMarker.position.toJSON();
    const request = {
        origin: currentPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    minimapDirectionsService
        .route(request)
        .then((response) => {
            minimapDirectionsRenderer.setDirections(response);
            const route = response.routes[0].legs[0];
            destinationCoordinates = route.end_location; 

            loadArrowModel(); 
            arrowVisible = true; 
        })
        .catch((e) => console.error('Minimap directions request failed:', e));
}

function updateArrowDirection() {
    if (!arrow || !destinationCoordinates) return;

    const characterPosition = characterMarker.position.toJSON();
    const dx = destinationCoordinates.lng() - characterPosition.lng;
    const dy = destinationCoordinates.lat() - characterPosition.lat;
    const distance = Math.sqrt(dx * dx + dy * dy); 

    if (distance < 0.01) { 

        scene.remove(arrow);
        arrow = null;
        arrowVisible = false;

        minimapDirectionsRenderer.setDirections({ routes: [] });
        minimap.setZoom(15); 
        minimap.setCenter(destinationCoordinates); 

        return; 
    }

    const angle = Math.atan2(dy, dx);
    arrow.rotation.y = angle * 100; 
}

function clearRoute() {
    if (arrow) {
        scene.remove(arrow);
        arrow = null;
    }

    if (minimapDirectionsRenderer) {
        minimapDirectionsRenderer.setDirections({ routes: [] });
    }

    destinationCoordinates = null;
    arrowVisible = false;

}

function loadCharacterModel() {
    const loader = new GLTFLoader();
    const characterPath = '/models/astronaut/astronaut.gltf';

    loader.load(characterPath, (gltf) => {
        character = gltf.scene;
        character.scale.set(9, 9, 9);
        character.rotation.x = Math.PI / 2;
        character.position.set(0, 0, -15);
        scene.add(character);

        characterMixer = new THREE.AnimationMixer(character);

        gltf.animations.forEach((clip) => {
            const action = characterMixer.clipAction(clip);
            characterActions[clip.name] = action;
        });

        characterActions["idle"].play();

        
    });
}

function playCharacterAction(actionName) {
    if (!characterActions || !characterActions[actionName]) return;

    Object.keys(characterActions).forEach((key) => {
        const action = characterActions[key];
        if (key === actionName) {
            action.reset().fadeIn(0.5).play();
        } else {
            action.fadeOut(0.5);
        }
    });
}

function updateCharacterAnimation(deltaLat, deltaLng) {
    if (!characterActions) return;

    if (Math.abs(deltaLat) > 0 || Math.abs(deltaLng) > 0) {
        playCharacterAction("idle");
    } else {
        playCharacterAction("running");
    }
}

function updateInfoWindow(content, center) {
    infoWindow.setContent(content);
    infoWindow.setPosition(center);
    infoWindow.open({
      map,
      anchor: marker,
      shouldFocus: false,
    });
}

function updateCameraPosition() {
    const center = map.getCenter().toJSON();
    let { lat, lng } = center;

    const headingRadians = (map.getHeading() * Math.PI) / 180;

    const forwardVector = new THREE.Vector3(Math.sin(headingRadians), Math.cos(headingRadians), 0);
    const sideVector = new THREE.Vector3(Math.cos(headingRadians), -Math.sin(headingRadians), 0);

    let deltaLat = 0;
    let deltaLng = 0;
    if (keysPressed['w'] || keysPressed['ArrowUp']) {
        deltaLng += forwardVector.y * movementSpeed;
        deltaLat += forwardVector.x * movementSpeed;
    }
    if (keysPressed['s'] || keysPressed['ArrowDown']) {
        deltaLng -= forwardVector.y * movementSpeed;
        deltaLat -= forwardVector.x * movementSpeed;
    }
    if (keysPressed['a'] || keysPressed['ArrowLeft']) {
        deltaLng -= sideVector.y * movementSpeed;
        deltaLat -= sideVector.x * movementSpeed;
    }
    if (keysPressed['d'] || keysPressed['ArrowRight']) {
        deltaLng += sideVector.y * movementSpeed;
        deltaLat += sideVector.x * movementSpeed;
    }

    lat += deltaLng;
    lng += deltaLat;

    map.moveCamera({
        center: { lat, lng },
    });

    if (deltaLat !== 0 || deltaLng !== 0) {
        const angle = Math.atan2(deltaLng, deltaLat);
        if (character) {
            character.rotation.y = angle + Math.PI / 2;
        }
    }

    updateMinimapCharacterPosition(lat, lng);
    updateArrowDirection();
    updateCharacterAnimation(deltaLat, deltaLng); 
}

function onMouseMove(event) {
    if (!lockCamera) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const deltaX = mouseX - lastMouseX;
    const deltaY = -mouseY + lastMouseY;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    const sensitivity = 0.5;
    const newHeading = map.getHeading() + (deltaX * sensitivity);
    const newTilt = Math.max(0, Math.min(67.5, map.getTilt() + (deltaY * 0.7)));

    map.moveCamera({
        heading: newHeading,
        tilt: newTilt,
    });
}

async function getGuideResponse(userMessage, map) {
    try {
        const mapCenter = map.getCenter().toJSON(); 
        const contextMessage = `${prompt}\nCoordenadas actuales del usuario: ${JSON.stringify(mapCenter)}`;
        const chatSession = model.startChat({
            generationConfig,
            history: [
                { role: "user", parts: [{ text: contextMessage}], },
            ],
        });

        const result = await chatSession.sendMessage(userMessage);

        return result.response.text();
    } catch (error) {
        console.error("Error obteniendo respuesta del guía:", error);
        return "Lo siento, hubo un problema obteniendo la respuesta.";
    }
} 

const chatBubble = (text) => {
    bubble = document.getElementById('speech-bubble')
    const span = document.getElementById('message-text')
    span.innerText = `Gemini says: ${text}`;

    bubble.style.display = "block";
};

function initWebGLOverlayView(map) {
    const webGLOverlayView = new google.maps.WebGLOverlayView();

    webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        loadCharacterModel();

        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        placeAutocomplete.id = "place-autocomplete-input";

        const card = document.getElementById("place-autocomplete-card");
        card.appendChild(placeAutocomplete);

        placeAutocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
            await place.fetchFields({
                fields: ["displayName", "formattedAddress", "location"],
            });

            if (place.viewport) {
                map.fitBounds(place.viewport);
            } else if (place.location) {
                map.setCenter(place.location);
                map.setZoom(19);
                minimap.setZoom(15);


            }
            
            const infoContent =`
                <div>
                    <h3>${place.displayName}</h3>
                    <p>${place.formattedAddress}</p>
                </div>`
            ;
            updateInfoWindow(infoContent, place.location); 
            clearRoute();
    
        });

        const geminiButton = document.getElementById('gemini-button');
        const geminiInput = document.getElementById('gemini-input');
        
        const userMessage = geminiInput.value;

        geminiButton.addEventListener('click', async(e) => {
            if (geminiInput.value.length === 0) return
            document.getElementById('gemini-input').value = ""
            const response = await getGuideResponse(userMessage, map);
            chatBubble(response);
        });
    };

    webGLOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
            canvas: gl.canvas,
            context: gl,
            ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
    };

    webGLOverlayView.onDraw = ({ transformer }) => {
        const characterPosition = map.getCenter().toJSON();
        const matrix = transformer.fromLatLngAltitude({
            lat: characterPosition.lat,
            lng: characterPosition.lng,
            altitude: 10,
        });

        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

        renderer.setAnimationLoop((time) => {
            const delta = (time - lastTime) / 1000;
            lastTime = time;

            if (characterMixer) characterMixer.update(delta);
            updateCameraPosition();
        });

        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
    };

    webGLOverlayView.setMap(map);
}

export const initProject = async () => {
    await initMap();
    initMinimap();
    initWebGLOverlayView(map);

    document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key] = false);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', (event) => {
        if (event.key === "Control") {
            lockCamera = !lockCamera;
        }
    })
};
