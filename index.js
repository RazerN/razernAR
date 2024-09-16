import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/FlyControls.js';
import { FirstPersonControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/FirstPersonControls.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/PointerLockControls.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/loaders/RGBELoader.js';  // HDRI loader

// import * as THREE from './three.js-master/three.js-master/build/three.module.js'
// import {GLTFLoader} from './three.js-master/three.js-master/examples/jsm/loaders/GLTFLoader.js'


// Add Scene & Load GLB/GLTF
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

// HDRI Loader
const rgbeLoader = new RGBELoader()
rgbeLoader.load('/images/sky4k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture; // Optional: Set as background
    scene.environment = texture; // Set as environment map for reflections
});

// Load 3D Model
const loader = new GLTFLoader()
let glbObject = null;  // Variable to hold the loaded GLB model


loader.load('assets/seperate blend to gltf.glb', function(glb){
    console.log(glb)
    const root = glb.scene
    root.scale.set(1,1,1)
    root.position.set(1, 1, 1);  // Ensure the model is at the origin


    

// Store the loaded model
glbObject = root;
scene.add(root);  // Add the model to the scene

// Log bounding sphere radius
const boundingSphere = new THREE.Sphere();
new THREE.Box3().setFromObject(root).getBoundingSphere(boundingSphere);
console.log('Bounding Sphere Radius:', boundingSphere.radius);




   
}, function(xhr){
    console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function(error){
    console.log('An error occured')
})




// Lighting Setup

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2,2,5)
scene.add(light)

const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // Add ambient light
scene.add(ambientLight);


// Test cube (Sanity Check)

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);


// Boilerplate Code
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,2,2.5)
scene.add(camera)

// Renderer Setup
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding; 
// renderer.gammaOutput = true




// // Orbit Controls
// const orbitControls = new OrbitControls(camera, renderer.domElement)
// orbitControls.enableDamping = true

// // Fly Controls (optional)
// const flyControls = new FlyControls(camera, renderer.domElement)
// flyControls.movementSpeed = 10
// flyControls.rollSpeed = Math.PI / 24

// // First Person Controls (optional)
// const firstPersonControls = new FirstPersonControls(camera, renderer.domElement)
// firstPersonControls.lookSpeed = 0.1
// firstPersonControls.movementSpeed = 5





// PointerLockControls for FPS Movement
const controls = new PointerLockControls(camera, renderer.domElement)

// Event listeners to lock the pointer
document.addEventListener('click', () => {
    controls.lock()
})

// Movement variables
const move = {
    forward: false,
    backward: false,
    left: false,
    right: false
}

// Movement speed
const moveSpeed = 0.015

// Key event listeners for movement
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            move.forward = true
            break
        case 'ArrowDown':
        case 'KeyS':
            move.backward = true
            break
        case 'ArrowLeft':
        case 'KeyA':
            move.left = true
            break
        case 'ArrowRight':
        case 'KeyD':
            move.right = true
            break
    }
})

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            move.forward = false
            break
        case 'ArrowDown':
        case 'KeyS':
            move.backward = false
            break
        case 'ArrowLeft':
        case 'KeyA':
            move.left = false
            break
        case 'ArrowRight':
        case 'KeyD':
            move.right = false
            break
    }
})






// Initialize Joystick for Mobile Controls
const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: { left: '50px', top: '50px' },
});

joystick.on('move', (evt, data) => {
    if (data.direction) {
        switch (data.direction.angle) {
            case 'left':
                move.left = true;
                break;
            case 'right':
                move.right = true;
                break;
            case 'up':
                move.forward = true;
                break;
            case 'down':
                move.backward = true;
                break;
        }
    }
});

joystick.on('end', () => {
    move.forward = false;
    move.backward = false;
    move.left = false;
    move.right = false;
});





// Add touch control for looking around
const lookAroundZone = document.getElementById('lookaround');
let touchStartX, touchStartY;
const lookSpeed = 0.0025; // Adjust this for sensitivity

// Camera rotation variables
let yaw = 0;
let pitch = 0;

lookAroundZone.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

lookAroundZone.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Adjust yaw and pitch based on touch movement
    yaw -= deltaX * lookSpeed; // Horizontal look (left-right)
    pitch -= deltaY * lookSpeed; // Vertical look (up-down)

    // Clamp pitch to avoid flipping
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    // Apply rotation to camera using quaternions
    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});



// Gravity and Grounding
const gravity = -0.0005; // Adjust for stronger/weaker gravity
const groundHeight = 1.7; // Height at which the camera stays above the ground
let velocityY = 0;

function applyGravity() {
    velocityY += gravity;
    camera.position.y += velocityY;

    // Prevent the camera from falling below the ground height
    if (camera.position.y < groundHeight) {
        camera.position.y = groundHeight;
        velocityY = 0;
    }
}





// Collision detection functions
function getBoundingBox(object) {
    const box = new THREE.Box3().setFromObject(object);
    return box;
}

function checkCollision(camera, boundingBox) {
    const cameraPosition = camera.position;
    const box = boundingBox.clone();
    // Adjust bounding box position to world coordinates
    box.applyMatrix4(camera.matrixWorld);
    
    // Check if the camera is within the bounding box
    return box.containsPoint(cameraPosition);
}




// Animation function for Orbit control
// function animate(){
//     requestAnimationFrame(animate)
//     renderer.render(scene,camera)
// }

// animate()



// Animation function for WASD Control
function animate() {
    requestAnimationFrame(animate)
    
    // Apply movement logic
    if (move.forward) controls.moveForward(moveSpeed)
    if (move.backward) controls.moveForward(-moveSpeed)
    if (move.left) controls.moveRight(-moveSpeed)
    if (move.right) controls.moveRight(moveSpeed)




 // Collision detection
 if (glbObject) {
    const boundingSphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(glbObject).getBoundingSphere(boundingSphere);
    if (checkCollision(camera, boundingSphere)) {
        // Handle collision
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.add(direction.multiplyScalar(-moveSpeed));
    }
}

        


// Apply gravity
applyGravity();

renderer.render(scene, camera);


    renderer.render(scene, camera)
}

animate()





