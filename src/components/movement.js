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

export function updateModelPosition(model, map, moveForward, moveBackward, moveLeft, moveRight, speed, mapOptions) {
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
        model.rotation.y = angle + Math.PI / 2;
    }

    model.position.x += deltaX;
    model.position.y += deltaY;

    const { lat, lng } = modelPositionToLatLng(model.position, mapOptions);
    map.setCenter({ lat, lng });
}

function modelPositionToLatLng(modelPosition, mapOptions) {
    const factor = 0.000009;  
    const lat = +(mapOptions.center.lat + modelPosition.y * factor).toFixed(6); 
    const lng = +(mapOptions.center.lng + modelPosition.x * 0.0000117);
    return { lat, lng };
}
