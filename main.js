// Setup Scene, Camera, and Renderer
const canvas = document.querySelector('#webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

// Perspective Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// ==========================================
// Hero Particle System
// ==========================================
const particleCount = 2000;
const particleGeometry = new THREE.BufferGeometry();

// We need two arrays: one for the current positions, and one for the base/original positions 
// to spring back to after being repelled by the mouse.
const positions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    // Generate random positions spread across a wide 3D space
    const x = (Math.random() - 0.5) * 20; // Spread horizontally (-10 to +10)
    const y = (Math.random() - 0.5) * 20; // Spread vertically (-10 to +10)
    const z = (Math.random() - 0.5) * 15; // Spread on the Z-axis (-7.5 to +7.5)

    const index = i * 3;
    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;

    originalPositions[index] = x;
    originalPositions[index + 1] = y;
    originalPositions[index + 2] = z;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));

// Glowing light-blue material
const particleMaterial = new THREE.PointsMaterial({
    color: 0x44aaff,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false // Helps glowing particles blend without occlusion artifacts
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);


// ==========================================
// Scrolling Geometric Object (Icosahedron)
// ==========================================
const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 1);
const icosahedronMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
// Position it far down so it comes into view at the Projects section
icosahedron.position.set(0, -26, -5);
scene.add(icosahedron);

// ==========================================
// Education 3D Blocks
// ==========================================
const educationBlocks = new THREE.Group();
const blockGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const blockMat = new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const cubes = [];
for (let i = 0; i < 4; i++) {
    const cube = new THREE.Mesh(blockGeom, blockMat);
    // Start scattered arbitrarily
    cube.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
    );
    cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    // Store their ultimate "structured" destination
    cube.userData.targetPos = new THREE.Vector3(
        (i % 2 === 0 ? 1 : -1) * 1.0,
        Math.floor(i / 2) * 2.0 - 1.0,
        0
    );
    // Store original rotation target for cleanliness
    cube.userData.targetRot = new THREE.Euler(0, 0, 0);

    cubes.push(cube);
    educationBlocks.add(cube);
}
// Position it where the Education section will approximately trigger
educationBlocks.position.set(0, -14, -4);
scene.add(educationBlocks);

// ==========================================
// Experience 3D Timeline
// ==========================================
const experienceTimeline = new THREE.Group();

const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.9 });
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.4 });

const linePoints = [];
const numNodes = 4;
for (let i = 0; i < numNodes; i++) {
    const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const sphere = new THREE.Mesh(sphereGeo, nodeMaterial);
    // Slight sine wave offset to make it look like interconnected data
    const xOffset = Math.sin(i * 1.5) * 0.8;
    sphere.position.set(xOffset, -i * 2.5, 0);
    experienceTimeline.add(sphere);
    linePoints.push(new THREE.Vector3(xOffset, -i * 2.5, 0));
}

const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
const line = new THREE.Line(lineGeo, lineMaterial);
experienceTimeline.add(line);

// Position it below the icosahedron, slightly to the left so it offsets from center text
experienceTimeline.position.set(-4, -34, -6);
scene.add(experienceTimeline);


// ==========================================
// Mouse Interaction (Raycasting & Repel)
// ==========================================
const mouse = new THREE.Vector2(9999, 9999); // Start functionally off-screen
const mouse3D = new THREE.Vector3();
// A mathematical plane at Z = 0 to project our 2D mouse coordinates into 3D space
const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove', (event) => {
    // Normalize mouse coordinates from -1 to +1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// ==========================================
// GSAP + ScrollTrigger Animation
// ==========================================
gsap.registerPlugin(ScrollTrigger);

// Timeline linked to scroll progress of the entire body
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5 // Smooth scrubbing, takes 1.5 seconds to "catch up" to scrollbar
    }
});

// Animate Camera flying forward through the particles over the duration of the page
tl.to(camera.position, {
    z: -10, // Fly into the scene
    y: -44, // Move camera down past the particles to see the multiple vertical 3D elements
    ease: 'power1.inOut'
}, 0); // start at timeline 0

// Animate the Icosahedron rotating based on scroll progress
tl.to(icosahedron.rotation, {
    x: Math.PI * 4,
    y: Math.PI * 8,
    ease: 'none'
}, 0);

// Animate Experience Job Entries
gsap.utils.toArray('.timeline-item').forEach((item) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -40,
        duration: 0.8,
        ease: 'power2.out'
    });
});

// Animate Education Blocks assembling on scroll into view
cubes.forEach((cube) => {
    // Pull position into tight formation
    gsap.to(cube.position, {
        scrollTrigger: {
            trigger: '#education',
            start: 'top bottom', // Start merging when section enters viewport
            end: 'center center', // Finish merging when section is centered
            scrub: 1.5
        },
        x: cube.userData.targetPos.x,
        y: cube.userData.targetPos.y,
        z: cube.userData.targetPos.z,
        ease: 'power1.out'
    });

    // Smooth out rotation into clean alignment
    gsap.to(cube.rotation, {
        scrollTrigger: {
            trigger: '#education',
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5
        },
        x: cube.userData.targetRot.x,
        y: cube.userData.targetRot.y,
        z: cube.userData.targetRot.z,
        ease: 'power1.out'
    });
});


// ==========================================
// Animation Loop
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Subtle, continuous rotation for particles
    particleSystem.rotation.y = elapsedTime * 0.05;
    particleSystem.rotation.x = elapsedTime * 0.02;

    // Constant subtle rotation for the Icosahedron even when not scrolling
    icosahedron.rotation.x += 0.002;
    icosahedron.rotation.y += 0.003;

    // Subtle continuous rotation for experience timeline to feel active
    experienceTimeline.rotation.y += 0.005;
    experienceTimeline.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05;

    // Gentle floating for the education blocks even after they assemble
    educationBlocks.position.y += Math.sin(elapsedTime * 2) * 0.002;
    educationBlocks.rotation.y += 0.001;

    // Ensure the transformation matrix is updated before converting world-to-local 
    // because we just manually changed the rotation.
    particleSystem.updateMatrixWorld();

    // 2. Project 2D mouse onto 3D plane
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(planeZ, mouse3D);

    // Convert the world-space mouse3D coordinate into the particle system's local space
    // so we can correctly compute distance to particles, even while rotating.
    const localMouse = mouse3D.clone();
    particleSystem.worldToLocal(localMouse);

    // 3. Shift/Repel physics evaluation
    const posAttribute = particleGeometry.attributes.position;
    const posArray = posAttribute.array;
    const origPosArray = particleGeometry.attributes.originalPosition.array;

    const interactRadiusSq = 3.0 * 3.0; // The threshold squared distance for the repel effect

    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        // Current positions
        const px = posArray[index];
        const py = posArray[index + 1];
        const pz = posArray[index + 2];

        // Original positions
        const ox = origPosArray[index];
        const oy = origPosArray[index + 1];
        const oz = origPosArray[index + 2];

        // Distance from local mouse to the original particle location
        const dx = ox - localMouse.x;
        const dy = oy - localMouse.y;
        const dz = oz - localMouse.z;

        const distSq = dx * dx + dy * dy + dz * dz;

        // Where the point "wants" to be
        let targetX = ox;
        let targetY = oy;
        let targetZ = oz;

        if (distSq < interactRadiusSq) {
            // Repel logic
            const dist = Math.sqrt(distSq);
            // Stronger force the closer particle is to cursor (0 to 1)
            const force = (3.0 - dist) / 3.0;

            // Normalize direction vector away from mouse
            const dirX = dx / dist;
            const dirY = dy / dist;
            const dirZ = dz / dist;

            // Only push away strongly if the camera isn't moving extremely fast
            const repelStrength = 1.5;

            targetX = ox + dirX * force * repelStrength;
            targetY = oy + dirY * force * repelStrength;
            targetZ = oz + dirZ * force * repelStrength;
        }

        // Apply a gentle spring back toward target destination. 
        // This makes it organic rather than snapping instantly.
        const springStrength = 0.05;
        posArray[index] += (targetX - px) * springStrength;
        posArray[index + 1] += (targetY - py) * springStrength;
        posArray[index + 2] += (targetZ - pz) * springStrength;
    }

    // Flag buffer data as updated so WebGL redraws changes
    posAttribute.needsUpdate = true;

    // Render Scene
    renderer.render(scene, camera);
}

// Start loop
animate();
