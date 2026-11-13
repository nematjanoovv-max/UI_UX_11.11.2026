import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let scene, camera, renderer, controls;
let modelRoot, modelPivot, modelPulse, modelHolder;
let heartMesh = null;
const heartMaterials = [];
let isLoaded = false;
let isVisible = true;
let autoRotate = true;
let xRayMode = false;
let currentBpm = 72;
let phase = 0;
const clock = new THREE.Clock();

const HOME = {
  pos: new THREE.Vector3(2.5, 2.0, 16.5),
  target: new THREE.Vector3(0.3, 1.1, 0)
};

// 4D Cardiac contraction pulse function: bump(t, a, b, skew)
const bump = (t, a, b, skew = 1) => {
  if (t < a || t > b) return 0;
  const x = Math.pow((t - a) / (b - a), skew);
  return Math.sin(Math.PI * x) ** 2;
};

// Upgrade GLTF MeshStandardMaterial to MeshPhysicalMaterial with wet biological tissue properties
function upgradeGltfMaterial(mat) {
  if (!mat || Array.isArray(mat) || !mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) return mat;
  const p = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(p, mat);
  p.metalness = 0;
  p.metalnessMap = null;
  p.clearcoat = 0.55;
  p.clearcoatRoughness = 0.22;
  p.side = THREE.DoubleSide;
  return p;
}

export function init3DHeart() {
  const container = document.getElementById('three-heart-container');
  if (!container) return;

  const w = container.clientWidth || 450;
  const h = container.clientHeight || 340;

  // Scene
  scene = new THREE.Scene();

  // Camera: PerspectiveCamera fov 38, pos (2.5, 2.0, 16.5), target (0.3, 1.1, 0)
  camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 1000);
  camera.position.copy(HOME.pos);

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // OrbitControls: enableDamping, minDistance 3.5, maxDistance 40
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3.5;
  controls.maxDistance = 40;
  controls.target.copy(HOME.target);
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.2;
  controls.update();

  // RoomEnvironment (PMREMGenerator) for realistic PBR environment reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv).texture;
  scene.environmentIntensity = 0.9;
  roomEnv.dispose();
  pmremGenerator.dispose();

  // Directional Lighting: (5,7,8) 1.7, (-7,1,4) 0.55 (bluish), (-3,3,-8) 0.9 (warm)
  const light1 = new THREE.DirectionalLight(0xffffff, 1.7);
  light1.position.set(5, 7, 8);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0x88bbff, 0.55);
  light2.position.set(-7, 1, 4);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffeedd, 0.90);
  light3.position.set(-3, 3, -8);
  scene.add(light3);

  // Model Hierarchy: modelRoot (position) -> modelPivot (rotation) -> modelPulse (4D heartbeat scale)
  modelRoot = new THREE.Group();
  modelPivot = new THREE.Group();
  modelPulse = new THREE.Group();
  scene.add(modelRoot);
  modelRoot.add(modelPivot);
  modelPivot.add(modelPulse);

  // Load models/heart.glb via GLTFLoader
  const spinner = document.getElementById('three-loading-spinner');
  if (spinner) {
    spinner.style.display = 'flex';
    const span = spinner.querySelector('span');
    if (span) span.textContent = '3D anatomik model (heart.glb) yuklanmoqda...';
  }

  const loader = new GLTFLoader();
  loader.load(
    'models/heart.glb',
    (gltf) => {
      const root = gltf.scene;
      const meshes = [];
      root.traverse((o) => {
        if (o.isMesh) {
          meshes.push(o);
          if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
          o.material = upgradeGltfMaterial(o.material);
          heartMaterials.push(o.material);
        }
      });

      if (!meshes.length) {
        if (spinner) {
          spinner.innerHTML = `<span class="text-rose-400">Xatolik: Modelda 3D to'r topilmadi.</span>`;
        }
        return;
      }

      heartMesh = meshes[0];
      heartMesh.name = "Anatomik Yurak (Cor humanum)";

      const holder = new THREE.Group();
      holder.add(root);
      modelPulse.add(holder);
      modelHolder = holder;
      holder.updateMatrixWorld(true);

      // Normalize: max dimension = 4.4, centered at (0.3, 1.1, 0)
      const box0 = new THREE.Box3().setFromObject(holder);
      const size0 = box0.getSize(new THREE.Vector3());
      const maxDim = Math.max(size0.x, size0.y, size0.z, 1e-9);
      const s = 4.4 / maxDim;
      holder.scale.setScalar(s);
      holder.position.copy(box0.getCenter(new THREE.Vector3())).multiplyScalar(-s);
      modelRoot.position.set(0.3, 1.1, 0);

      isLoaded = true;
      if (spinner) spinner.style.display = 'none';

      const tagEl = document.getElementById('three-anatomy-tag');
      if (tagEl) tagEl.textContent = "Haqiqiy 3D/4D Anatomik Yurak (heart.glb)";
    },
    (xhr) => {
      if (spinner && xhr.total > 0) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        const span = spinner.querySelector('span');
        if (span) span.textContent = `3D model yuklanmoqda: ${pct}%...`;
      }
    },
    (err) => {
      console.error('heart.glb yuklanmadi:', err);
      if (spinner) {
        spinner.innerHTML = `<span class="text-rose-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 3D model yuklanmadi. Qayta urinib ko'ring.</span>`;
      }
    }
  );

  // Resize handler
  window.addEventListener('resize', onWindowResize);

  // IntersectionObserver: pause render loop when off-screen to prevent battery/GPU drain
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);
  }

  // Animation Loop
  requestAnimationFrame(animate);
}

function onWindowResize() {
  const container = document.getElementById('three-heart-container');
  if (!container || !renderer || !camera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  requestAnimationFrame(animate);
  if (!isVisible || !renderer || !scene || !camera) return;

  const dt = Math.min(clock.getDelta(), 0.1);

  if (controls) {
    controls.update();
  }

  // 4D (urish) animatsiyasi:
  // sikl fazasi: phase = (phase + dt * bpm / 60) % 1
  // vent = bump(phase, 0.15, 0.50, 0.75)
  // modelPulse.scale.set(1 - 0.05*vent, 1 - 0.03*vent, 1 - 0.05*vent)
  if (isLoaded && modelPulse) {
    phase = (phase + dt * (currentBpm / 60)) % 1;
    const vent = bump(phase, 0.15, 0.50, 0.75);
    modelPulse.scale.set(1 - 0.05 * vent, 1 - 0.03 * vent, 1 - 0.05 * vent);
  }

  renderer.render(scene, camera);
}

// Window Exposed Control Functions
window.toggle3DAutoRotate = function() {
  autoRotate = !autoRotate;
  if (controls) controls.autoRotate = autoRotate;
  const btn = document.getElementById('btn-3d-rotate');
  if (btn) {
    btn.className = autoRotate
      ? "px-2 py-1 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 transition border border-rose-200 dark:border-rose-900"
      : "px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700";
  }
};

window.toggle3DXRayMode = function() {
  xRayMode = !xRayMode;
  heartMaterials.forEach(mat => {
    if (xRayMode) {
      mat.transparent = true;
      mat.opacity = 0.45;
      mat.depthWrite = false;
    } else {
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.depthWrite = true;
    }
    mat.needsUpdate = true;
  });

  const btn = document.getElementById('btn-3d-xray');
  if (btn) {
    btn.className = xRayMode
      ? "px-2 py-1 rounded text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 transition border border-cyan-300 dark:border-cyan-800"
      : "px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700";
  }
};

window.focus3DStenosis = function() {
  if (!controls || !camera) return;
  autoRotate = false;
  if (controls) controls.autoRotate = false;
  camera.position.set(1.2, 1.4, 9.5);
  controls.target.set(0.2, 0.9, 0);
  controls.update();
  const tagEl = document.getElementById('three-anatomy-tag');
  if (tagEl) tagEl.textContent = "Koronar Arteriyalar (Fokuslandi)";
};

window.reset3DCamera = function() {
  if (!controls || !camera) return;
  camera.position.copy(HOME.pos);
  controls.target.copy(HOME.target);
  controls.update();
  const tagEl = document.getElementById('three-anatomy-tag');
  if (tagEl) tagEl.textContent = "100% Real 3D/4D Kardiologik Model";
};

window.set3DHeartBpm = function(bpm) {
  if (typeof bpm === 'number' && bpm > 0) {
    currentBpm = bpm;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3DHeart);
} else {
  setTimeout(init3DHeart, 50);
}
