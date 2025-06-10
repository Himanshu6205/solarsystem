// script.js
import * as THREE from 'https://esm.sh/three';
import { OrbitControls } from 'https://esm.sh/three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, clock, controls;
let sun, isPaused = false;
const planets = [], meteorGroup = [];

const planetData = [
  { name: "Mercury", size: 0.8, dist: 10, speed: 0.04, color: 0xb1b1b1 },
  { name: "Venus", size: 1.2, dist: 15, speed: 0.035, color: 0xffd27f },
  { name: "Earth", size: 1.3, dist: 20, speed: 0.03, color: 0x2a56ff },
  { name: "Mars", size: 1.1, dist: 25, speed: 0.028, color: 0xff4500 },
  { name: "Jupiter", size: 2.5, dist: 35, speed: 0.022, color: 0xffe4b5 },
  { name: "Saturn", size: 2.2, dist: 45, speed: 0.018, color: 0xf5deb3 },
  { name: "Uranus", size: 1.8, dist: 55, speed: 0.015, color: 0xadd8e6 },
  { name: "Neptune", size: 1.7, dist: 65, speed: 0.012, color: 0x4169e1 }
];

init();


// star animation 

function init() {
  scene = new THREE.Scene();
  addStarfield();
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 40, 140);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas"), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 300;

  addLights();
  addSun();
  addPlanets();
  addMeteors();
  setupTooltip();
  setupClickHandler();
  setupUI();
  window.addEventListener("resize", onResize);
  animate();
}

// star add

function addStarfield(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(600),
      THREE.MathUtils.randFloatSpread(600),
      THREE.MathUtils.randFloatSpread(600)
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: true, opacity: 0.85 });
  scene.add(new THREE.Points(geometry, material));
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 0);
  scene.add(light);
}

function addSun() {
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  sun = new THREE.Mesh(geometry, material);
  scene.add(sun);
}

// controless
function addPlanets() {
  const panel = document.getElementById("controlPanel");

  planetData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);

    planet.userData = { angle: 0, speed: data.speed, dist: data.dist };
    planet.name = data.name;
    planets.push(planet);
    scene.add(planet);

    const curve = new THREE.EllipseCurve(0, 0, data.dist, data.dist);
    const points = curve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
    const orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.5 })
    );
    scene.add(orbit);

    // pln name

    const label = makeLabel(data.name);
    label.position.set(data.dist, 2.5, 0);
    scene.add(label);

    const labelEl = document.createElement("label");
    labelEl.textContent = `${data.name} Speed:`;
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 0.1;
    slider.step = 0.001;
    slider.value = data.speed;
    slider.oninput = () => (planet.userData.speed = parseFloat(slider.value));
    panel.appendChild(labelEl);
    panel.appendChild(slider);
  });
}

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  ctx.fillText(text, 10, 40);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(12, 3, 1);
  return sprite;
}

// mtor - random

function addMeteors() {
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.SphereGeometry(0.4, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const meteor = new THREE.Mesh(geo, mat);
    meteor.position.set(
      -150 + Math.random() * 300,
      80 + Math.random() * 40,
      -200 + Math.random() * 400
    );
    meteor.userData.vel = new THREE.Vector3(Math.random() * 1.5, -1.2, Math.random() * 1.5);
    meteorGroup.push(meteor);
    scene.add(meteor);
  }
}

function setupTooltip() {
  const tooltip = document.getElementById("tooltip");
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("mousemove", e => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(planets);
    if (hit.length > 0) {
      tooltip.style.display = "block";
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.textContent = hit[0].object.name;
    } else {
      tooltip.style.display = "none";
    }
  });
}

function setupClickHandler() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("click", e => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);
    if (intersects.length > 0) {
      flyToPlanet(intersects[0].object);
    }
  });
}

function flyToPlanet(planet) {
  const targetPos = planet.position.clone().add(new THREE.Vector3(0, 5, 15));
  const lookAt = planet.position.clone();
  const duration = 1000;
  const startPos = camera.position.clone();
  const startTime = performance.now();

  function animateFly(time) {
    const t = Math.min((time - startTime) / duration, 1);
    camera.position.lerpVectors(startPos, targetPos, t);
    camera.lookAt(lookAt);
    controls.target.copy(lookAt);
    controls.update();
    if (t < 1) requestAnimationFrame(animateFly);
  }

  requestAnimationFrame(animateFly);
}

// btn

function setupUI() {
  document.getElementById("pauseBtn").onclick = () => {
    isPaused = !isPaused;
    document.getElementById("pauseBtn").textContent = isPaused ? "▶ Resume" : "⏸ Pause";
  };

  document.getElementById("themeToggleBtn").onclick = () => {
    document.body.classList.toggle("light-mode");
  };
}

function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    const dt = clock.getDelta();
    planets.forEach(p => {
      p.userData.angle += p.userData.speed * dt * 60;
      const a = p.userData.angle;
      const d = p.userData.dist;
      p.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    });
    meteorGroup.forEach(m => {
      m.position.add(m.userData.vel);
      if (m.position.y < -50) {
        m.position.set(
          -100 + Math.random() * 200,
          80 + Math.random() * 40,
          -100 + Math.random() * 200
        );
      }
    });
  }
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
