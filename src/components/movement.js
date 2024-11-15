import * as THREE from 'three';

export function handleMovement(event, moveForward, moveBackward, moveLeft, moveRight) {
    switch (event.key) {
        case 'w': moveForward = true; break;
        case 'a': moveLeft = true; break;
        case 's': moveBackward = true; break;
        case 'd': moveRight = true; break;
    }
    return { moveForward, moveBackward, moveLeft, moveRight };
}

export function stopMovement(event, moveForward, moveBackward, moveLeft, moveRight) {
    switch (event.key) {
        case 'w': moveForward = false; break;
        case 'a': moveLeft = false; break;
        case 's': moveBackward = false; break;
        case 'd': moveRight = false; break;
    }
    return { moveForward, moveBackward, moveLeft, moveRight };
}

export function updateCharacterPosition(character, robot, map, moveForward, moveBackward, moveLeft, moveRight, speed, mapOptions, lockCamera) {
    const headingRadians = (map.heading * Math.PI) / 180;
    const forwardVector = new THREE.Vector3(Math.sin(headingRadians), Math.cos(headingRadians), 0);
    const sideVector = new THREE.Vector3(Math.cos(headingRadians), -Math.sin(headingRadians), 0);
  
    let deltaX = 0;
    let deltaY = 0;

    if (moveForward) {
        deltaX += forwardVector.x * speed;
        deltaY += forwardVector.y * speed;
    }
    if (moveBackward) {
        deltaX -= forwardVector.x * speed;
        deltaY -= forwardVector.y * speed;
    }
    if (moveLeft) {
        deltaX -= sideVector.x * .6;
        deltaY -= sideVector.y;
    }
    if (moveRight) {
        deltaX += sideVector.x * .6;
        deltaY += sideVector.y;
    }

    if (deltaX !== 0 || deltaY !== 0) {
        const angle = Math.atan2(deltaY, deltaX);
        character.rotation.y = angle + Math.PI / 2;
        robot.rotation.y = angle + Math.PI / 180;
    }

    character.position.x += deltaX;
    character.position.y += deltaY;
    robot.position.x += deltaX;
    robot.position.y += deltaY;


    if (lockCamera) {
        const { lat, lng } = characterPositionToLatLng(character.position, mapOptions);
        map.setCenter({ lat, lng });
    }

}

function characterPositionToLatLng(characterPosition, mapOptions) {
    const factor = 0.000009;  
    const lat = +(mapOptions.center.lat + characterPosition.y * factor).toFixed(6); 
    const lng = +(mapOptions.center.lng + characterPosition.x * 0.0000117);
    return { lat, lng };
}
