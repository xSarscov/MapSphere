import * as THREE from 'three';

const coinSound = new Audio('/sounds/coin-sound.mp3');

export function initializeScore() {
    const savedScore = parseInt(localStorage.getItem('score')) || 0;
    updateScoreDisplay(savedScore);
    return savedScore;
}

export function updateScoreDisplay(score) {
    const scoreElement = document.getElementById('score');
    // if (scoreElement) scoreElement.textContent = `Puntaje: ${score}`;
    if (scoreElement) console.log(score)
}

export function increaseScore(currentScore) {
    const newScore = currentScore + 1;
    localStorage.setItem('score', newScore);
    updateScoreDisplay(newScore);
    return newScore;
}

export function detectCoinCollisions(character, coins, currentScore, scene) {
    const characterPosition = new THREE.Vector3().setFromMatrixPosition(character.matrixWorld);
    let newScore = currentScore;
    coins.forEach((coin, index) => {
        const coinPosition = new THREE.Vector3().setFromMatrixPosition(coin.matrixWorld);
        const distance = characterPosition.distanceTo(coinPosition);
        
        if (distance < 10) { 
            scene.remove(coin); 
            coins.splice(index, 1); 
            newScore = increaseScore(newScore); 
            
            coinSound.currentTime = 0;
            coinSound.play().catch(error => {
                console.error("Error al reproducir el sonido de la moneda:", error);
            });
        }
    });

    return newScore;
}
