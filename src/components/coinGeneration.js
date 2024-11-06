import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const generateCoins = (scene, numCoins = 80) => {
    const loader = new GLTFLoader();
    const coins = [];

    for (let i = 0; i < numCoins; i++) {

        loader.load('/models/coin/coin.gltf', (gltf) => {
            const coin = gltf.scene;
            coin.scale.set(2, 2, 2); 
            coin.rotation.x = Math.PI;
            const x = (Math.random() - 0.5) * 500;
            const y = (Math.random() - 0.5) * 500;

            coin.position.set(x, y, -10); 
            scene.add(coin); 
            coins.push(coin);
        });
    }

    return coins;

    

}

