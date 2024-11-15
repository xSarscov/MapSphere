import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { initCamera, updateCamera } from './camera';
import { handleMovement, stopMovement, updateCharacterPosition } from './movement';
import { generateCoins } from './coinGeneration';
import { detectCoinCollisions, initializeScore } from './coinCollection';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const { VITE_GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_MAP_ID, VITE_GEMINI_API_KEY } = getEnvVariables();

const apiKey = VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};



const apiOptions = {
    apiKey: VITE_GOOGLE_MAPS_API_KEY,
    version: "beta"
};
const mapOptions = {
    "tilt": 67.5,
    "heading": 0,
    "zoom": 21,
    "center": { lat: 40.712573, lng: -74.006186 },
    "mapId": VITE_GOOGLE_MAPS_MAP_ID,
    disableDefaultUI: true,
    keyboardShortcuts: false,
};

async function getGuideResponse(userMessage) {
    try {
        
        const chatSession = model.startChat({
            generationConfig,
            history: [
            ],
        });
        
        const result = await chatSession.sendMessage(userMessage);

        console.log(result.response.text())
    } catch (error) {
        console.error("Error obteniendo respuesta del guía:", error);
        return "Lo siento, hubo un problema obteniendo la respuesta.";
    }
}

async function initMap() {
    const mapDiv = document.getElementById("app");
    const apiLoader = new Loader(apiOptions);
    await apiLoader.load();
    return new google.maps.Map(mapDiv, mapOptions);
}

function initWebGLOverlayView(map) {
    let scene, camera, loader, character, coins=[], renderer, lastMouseX = 0, lastMouseY = 0, robot;
    const webGLOverlayView = new google.maps.WebGLOverlayView();
    const speed = 0.8; 
    let moveForward = false,
        moveBackward = false,
        moveLeft = false,
        moveRight = false;
    let lastTime = 0;
    let mixer; 
    let lockCamera = false;
    let currentScore = initializeScore();
    let isInputFocused = false;
    const chatInput = document.getElementById('userInput');
    
    

    webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = initCamera(scene);
        loader = new GLTFLoader();
        const characterPath = "/models/character/character.gltf";
        const robotPath = "/models/robot/robot.gltf";

        loader.load(characterPath, gltf => {
            character = gltf.scene;
            character.scale.set(9, 9, 9);
            character.rotation.x = Math.PI / 2;
            character.position.set(0, 0, -15);
            scene.add(character);
            
            mixer = new THREE.AnimationMixer(character);

            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });


        });

        loader.load(robotPath, gltf => {
            robot = gltf.scene;
            robot.scale.set(.2,.2,.2);
            robot.rotation.x = Math.PI / 2;
            robot.rotation.y = - Math.PI / 2;
            robot.position.set(0, 0, 3);
            scene.add(robot);
        });
        
        coins = generateCoins(scene);
        
        
        // loader.load(coinPath, gltf => {
        //     coin = gltf.scene;
        //     coin.scale.set(3, 3, 3);
        //     coin.rotation.x = Math.PI / 3;
        //     coin.position.set(0, 0, 10);
        //     scene.add(coin);

            
        // });

        document.addEventListener('keydown', (event) => {
            if (event.key === '/') {
                event.preventDefault(); 
                chatInput.focus();
            }
        });
    
        chatInput.addEventListener('focus', () => {
            isInputFocused = true;
        });
    
        chatInput.addEventListener('blur', () => {
            isInputFocused = false;
        });
    
        document.addEventListener('keydown', (event) => {
            if (!isInputFocused) {
                const moves = handleMovement(event, moveForward, moveBackward, moveLeft, moveRight);
                moveForward = moves.moveForward;
                moveBackward = moves.moveBackward;
                moveLeft = moves.moveLeft;
                moveRight = moves.moveRight;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            if (!isInputFocused) {
                const moves = stopMovement(event, moveForward, moveBackward, moveLeft, moveRight);
                moveForward = moves.moveForward;
                moveBackward = moves.moveBackward;
                moveLeft = moves.moveLeft;
                moveRight = moves.moveRight;
            }
        });

        document.addEventListener('keydown', async(event) => {
            if (event.altKey) {
                lockCamera = !lockCamera;
                if (lockCamera) {
                    document.addEventListener('mousemove', onMouseMove);
                } else {
                    document.removeEventListener('mousemove', onMouseMove);
                }
            }

            if (event.key === "Enter") {
                const userMessage = event.target.value;
                if (userMessage) {
                    const response = await getGuideResponse(userMessage);
                    console.log(response)
                    event.target.value = "";
                }
            }
        })

        
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
        console.log(gl)
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: gl.canvas,
            context: gl,
            ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        loader.manager.onLoad = () => {
            renderer.setAnimationLoop((time) => {
                const delta = (time - lastTime) / 1000;
                lastTime = time;

                if (mixer) mixer.update(delta);
                updateCharacterPosition(character, robot, map, moveForward, moveBackward, moveLeft, moveRight, speed, mapOptions, lockCamera);
                coins.forEach(coin => {
                    coin.rotation.z += 0.05; 
                });
                currentScore = detectCoinCollisions(character, coins, currentScore, scene);
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
