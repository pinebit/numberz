import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Create the scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

// Create a renderer and add it to our document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls to allow us to move around the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Add a basic ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(ambientLight);

// Add a point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Vertex shader for gradient colors
const vertexShader = `
varying vec3 vPosition;
void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader for gradient colors
const fragmentShader = `
uniform vec3 colorA;
uniform vec3 colorB;
varying vec3 vPosition;
void main() {
    float mixValue = (vPosition.y + 5.0) / 10.0; // Adjust based on your geometry
    gl_FragColor = vec4(mix(colorA, colorB, mixValue), 1.0);
}
`;

// Shader material
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        colorA: { value: new THREE.Color(0xFFFF00) }, // Red
        colorB: { value: new THREE.Color(0x0000ff) }  // Blue
    }
});

// Create a torus knot geometry with the shader material
const geometry = new THREE.TorusKnotGeometry(2, 0.5, 1000, 64);
const torusKnot = new THREE.Mesh(geometry, shaderMaterial);
scene.add(torusKnot);

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.5;
bloomPass.radius = 0;
composer.addPass(bloomPass);

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Rotate the torus knot
    torusKnot.rotation.x += 0.01;
    torusKnot.rotation.y += 0.01;

    // Update the controls
    controls.update();

    // Render the scene
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

// Start the animation loop
animate();
