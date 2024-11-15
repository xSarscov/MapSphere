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

function leerTextoEnVoz(texto) {
    
        const speech = new SpeechSynthesisUtterance(texto);
        speech.lang = "es-ES"
        speechSynthesis.speak(speech);
        
  }

const prompt = `
  Eres un guía turístico experto en Google Maps 3D, diseñado para ayudar a los usuarios a explorar y comprender lugares alrededor del mundo. Tu objetivo principal es ofrecer información precisa, atractiva y útil sobre los lugares cercanos o cualquier ubicación especificada. Siempre debes:
  
  1. Analizar las coordenadas proporcionadas para identificar la ubicación actual del usuario.
  2. Ofrecer descripciones interesantes sobre los lugares, atracciones, cultura, historia, y cualquier detalle relevante cerca de esas coordenadas.
  3. Responder de forma profesional, clara y entretenida, adaptándote al contexto del usuario.
  4. Si el usuario hace preguntas específicas, enfócate en dar detalles relevantes para esa ubicación.
  5. Si no hay suficiente información para las coordenadas, sugiere lugares populares cercanos o posibles actividades que el usuario pueda disfrutar.
  6. Evita responder de forma genérica. Siempre personaliza tus respuestas en función de la ubicación actual o la pregunta del usuario.
  
  Ejemplo de interacción:
  Usuario: ¿Qué hay de interesante cerca?
  Coordenadas: {lat: 40.7128, lng: -74.0060} (Nueva York, Estados Unidos)
  Respuesta: "Te encuentras en el corazón de Nueva York, conocido como la Gran Manzana. Cerca de tu ubicación tienes el icónico Times Square, el Empire State Building y Central Park. Además, puedes explorar museos como el MET o disfrutar de un paseo por el puente de Brooklyn."
  
  Usuario: Dame detalles sobre la cultura en este lugar.
  Coordenadas: {lat: 48.8566, lng: 2.3522} (París, Francia)
  Respuesta: "París, la ciudad del amor, es un epicentro cultural. Aquí encontrarás una mezcla de arquitectura histórica, como la Catedral de Notre Dame, y arte de clase mundial en el Museo del Louvre. Es famosa por su gastronomía, con cafés icónicos y boulangeries donde puedes probar croissants auténticos."
  
  Usa este formato para todas tus respuestas. ¿Qué puedo ayudarte a explorar?
`;


async function getGuideResponse(userMessage, map) {
    try {

        const chatSession = model.startChat({
            generationConfig,
            history: [
                
            ],
        });

        // Envía el mensaje al modelo
        const result = await chatSession.sendMessage(`${userMessage}\nCoordenadas: ${JSON.stringify(map.center)}`);


        console.log(result.response.text());
        return result.response.text();
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
    let characterMixer, robotMixer; 
    let lockCamera = false;
    let currentScore = initializeScore();
    let isInputFocused = false;
    const chatInput = document.getElementById('input-search');
    

    webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = initCamera(scene);
        loader = new GLTFLoader();
        const characterPath = "/models/character/character.gltf";
        const robotPath = "/models/robot3/robot3.gltf";

        loader.load(characterPath, gltf => {
            character = gltf.scene;
            character.scale.set(9, 9, 9);
            character.rotation.x = Math.PI / 2;
            character.position.set(0, 0, -15);
            scene.add(character);
            
            characterMixer = new THREE.AnimationMixer(character);

            gltf.animations.forEach((clip) => {
                characterMixer.clipAction(clip).play();
            });


        });

        loader.load(robotPath, gltf => {
            robot = gltf.scene;
            robot.scale.set(1,1,1);
            robot.rotation.x = Math.PI / 2;
            robot.rotation.y = -Math.PI / 180;
            robot.position.set(-6, -1, -5);
            scene.add(robot);

            

            robotMixer = new THREE.AnimationMixer(robot);

            gltf.animations.forEach((clip) => {
                robotMixer.clipAction(clip).play();
                
            });

            if (annyang) {
                annyang.addCommands({
                  'hey cheese *texto': async(texto) => {
                    const response = await getGuideResponse(texto, map);
                    console.log('Texto:', texto);
                    console.log("Gemini: ", response);
                    leerTextoEnVoz(response);

                  },
            
                });
            
                annyang.setLanguage('es-ES');
               
                SpeechKITT.annyang();
               
                SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
               
                SpeechKITT.vroom();

            }
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
                    const response = await getGuideResponse(userMessage, map);
                    leerTextoEnVoz(response);
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

        loader.manager.onLoad = () => {
            renderer.setAnimationLoop((time) => {
                const delta = (time - lastTime) / 1000;
                lastTime = time;

                if (characterMixer) characterMixer.update(delta);
                if (robotMixer) robotMixer.update(delta);

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
