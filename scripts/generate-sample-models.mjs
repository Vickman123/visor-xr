class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const modelsDir = path.join(publicDir, 'models');
const thumbnailsDir = path.join(publicDir, 'thumbnails');

fs.mkdirSync(modelsDir, { recursive: true });
fs.mkdirSync(thumbnailsDir, { recursive: true });

function exportGLB(scene) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => resolve(Buffer.from(gltf)),
      (error) => reject(error),
      { binary: true }
    );
  });
}

// 1. CASA RESIDENCIAL (Modern 2-story residence, ~10m x 12m x 6.5m)
async function buildCasa() {
  const scene = new THREE.Scene();
  scene.name = 'Casa_Residencial';

  const matFoundation = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.8 });
  const matWallsWhite = new THREE.MeshStandardMaterial({ color: 0xefefea, roughness: 0.5 });
  const matWood = new THREE.MeshStandardMaterial({ color: 0x9e6a38, roughness: 0.6 });
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x6bb8d6, transparent: true, opacity: 0.5, roughness: 0.1 });
  const matFrames = new THREE.MeshStandardMaterial({ color: 0x222224, roughness: 0.4 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0x2d3135, roughness: 0.7 });
  const matInteriorFloor = new THREE.MeshStandardMaterial({ color: 0xd9c8b4, roughness: 0.6 });

  // Foundation slab (11m x 13m x 0.3m)
  const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 13), matFoundation);
  slab.position.set(0, 0.15, 0);
  scene.add(slab);

  // Interior floor level 1
  const floor1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 12), matInteriorFloor);
  floor1.position.set(0, 0.325, 0);
  scene.add(floor1);

  // Exterior Walls Ground Floor (H: 3.0m)
  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.3), matWallsWhite);
  backWall.position.set(0, 1.8, -5.85);
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 12), matWallsWhite);
  leftWall.position.set(-4.85, 1.8, 0);
  scene.add(leftWall);

  // Right wall (partial with glass section)
  const rightWallBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 6), matWallsWhite);
  rightWallBack.position.set(4.85, 1.8, -3);
  scene.add(rightWallBack);

  const rightWallGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 5.8), matGlass);
  rightWallGlass.position.set(4.85, 1.6, 2.9);
  scene.add(rightWallGlass);

  // Front facade - Modern Glass & Entry Door
  const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 0.3), matWood);
  frontWallLeft.position.set(-3.25, 1.8, 5.85);
  scene.add(frontWallLeft);

  const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.1), matFrames);
  frontDoor.position.set(-0.9, 1.5, 5.85);
  scene.add(frontDoor);

  const frontGlassWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.7, 0.1), matGlass);
  frontGlassWall.position.set(2.3, 1.65, 5.85);
  scene.add(frontGlassWall);

  // Front porch canopy with columns
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 3), matFoundation);
  canopy.position.set(0.5, 3.2, 7.2);
  scene.add(canopy);

  const column1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3), matFrames);
  column1.position.set(3.2, 1.65, 8.5);
  scene.add(column1);

  const column2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3), matFrames);
  column2.position.set(-2.2, 1.65, 8.5);
  scene.add(column2);

  // Intermediate Slab (Second floor base)
  const midSlab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 13), matFoundation);
  midSlab.position.set(0, 3.475, 0);
  scene.add(midSlab);

  // Second Floor Cantilevered Volume (Width 8m, Depth 9m, Height 2.8m)
  const secondFloorWalls = new THREE.Mesh(new THREE.BoxGeometry(8, 2.8, 8.5), matWallsWhite);
  secondFloorWalls.position.set(-0.8, 5.05, -1.2);
  scene.add(secondFloorWalls);

  // Wood cladding accent on upper floor
  const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 4), matWood);
  woodPanel.position.set(3.25, 5.0, -1.2);
  scene.add(woodPanel);

  // Upper balcony & glass railing
  const balconyRailing = new THREE.Mesh(new THREE.BoxGeometry(7, 1.0, 0.08), matGlass);
  balconyRailing.position.set(-0.8, 4.15, 4.2);
  scene.add(balconyRailing);

  // Roof Slab
  const roof = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.3, 10.5), matRoof);
  roof.position.set(-0.8, 6.6, -1.2);
  scene.add(roof);

  const buffer = await exportGLB(scene);
  fs.writeFileSync(path.join(modelsDir, 'casa.glb'), buffer);
  console.log('✓ Generated casa.glb (' + buffer.length + ' bytes)');
}

// 2. EDIFICIO (Corporate 4-story building, ~16m x 14m x 16m)
async function buildEdificio() {
  const scene = new THREE.Scene();
  scene.name = 'Edificio_Corporativo';

  const matBase = new THREE.MeshStandardMaterial({ color: 0x272b30, roughness: 0.8 });
  const matConcrete = new THREE.MeshStandardMaterial({ color: 0xd6d8dc, roughness: 0.4 });
  const matGlassCurtain = new THREE.MeshStandardMaterial({ color: 0x3d7b99, roughness: 0.1, transparent: true, opacity: 0.65 });
  const matFrames = new THREE.MeshStandardMaterial({ color: 0x1a1c1e, roughness: 0.3 });
  const matAccents = new THREE.MeshStandardMaterial({ color: 0xc49b45, roughness: 0.3, metalness: 0.4 });

  // Podium / Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(17, 0.5, 15), matBase);
  base.position.set(0, 0.25, 0);
  scene.add(base);

  // Ground Lobby (Height 4.0m)
  // Structural columns
  const colCoords = [
    [-7, -6], [-7, 0], [-7, 6],
    [0, -6],           [0, 6],
    [7, -6],  [7, 0],  [7, 6]
  ];
  for (const [cx, cz] of colCoords) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4), matConcrete);
    col.position.set(cx, 2.5, cz);
    scene.add(col);
  }

  // Lobby glass enclosure
  const lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(14, 3.8, 12), matGlassCurtain);
  lobbyGlass.position.set(0, 2.5, 0);
  scene.add(lobbyGlass);

  // Central elevator/stair core
  const core = new THREE.Mesh(new THREE.BoxGeometry(4.5, 16, 4.5), matConcrete);
  core.position.set(0, 8.5, 0);
  scene.add(core);

  // Floors 1, 2, 3, Roof slabs
  const numFloors = 4;
  const floorHeight = 3.5;
  for (let f = 1; f <= numFloors; f++) {
    const slabY = 4.5 + (f - 1) * floorHeight;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 14), matConcrete);
    slab.position.set(0, slabY, 0);
    scene.add(slab);

    if (f < numFloors) {
      // Glass curtain wall for this floor
      const glassFloor = new THREE.Mesh(new THREE.BoxGeometry(15.8, floorHeight - 0.4, 13.8), matGlassCurtain);
      glassFloor.position.set(0, slabY + floorHeight / 2, 0);
      scene.add(glassFloor);

      // Louvers/sunshades
      const shade = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.15, 0.8), matAccents);
      shade.position.set(0, slabY + 0.2, 7.2);
      scene.add(shade);
    }
  }

  // Rooftop mechanical penthouse
  const penthouse = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 6), matFrames);
  penthouse.position.set(0, 16.1, 0);
  scene.add(penthouse);

  // Parapet around roof
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(16, 1.0, 14), matConcrete);
  parapet.position.set(0, 15.5, 0);
  scene.add(parapet);

  const buffer = await exportGLB(scene);
  fs.writeFileSync(path.join(modelsDir, 'edificio.glb'), buffer);
  console.log('✓ Generated edificio.glb (' + buffer.length + ' bytes)');
}

// 3. LABORATORIO (High-tech research pavilion, ~18m x 18m x 5.5m)
async function buildLaboratorio() {
  const scene = new THREE.Scene();
  scene.name = 'Laboratorio_Tecnologico';

  const matFloor = new THREE.MeshStandardMaterial({ color: 0x35393f, roughness: 0.3 });
  const matWhiteWalls = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.2 });
  const matCleanGlass = new THREE.MeshStandardMaterial({ color: 0x56a3bf, transparent: true, opacity: 0.55, roughness: 0.1 });
  const matSteel = new THREE.MeshStandardMaterial({ color: 0x8a929a, metalness: 0.8, roughness: 0.2 });
  const matCyanAccent = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3 });
  const matBench = new THREE.MeshStandardMaterial({ color: 0x2a3342, roughness: 0.4 });

  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 20), matFloor);
  base.position.set(0, 0.2, 0);
  scene.add(base);

  // Exterior clean white facade panels
  // Perimeter walls with architectural glass slits
  const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(18, 4.5, 0.4), matWhiteWalls);
  wallNorth.position.set(0, 2.65, -9);
  scene.add(wallNorth);

  const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(12, 4.5, 0.4), matWhiteWalls);
  wallSouth.position.set(-3, 2.65, 9);
  scene.add(wallSouth);

  // Lab Entrance with Air-Lock Canopy
  const airLockGlass = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.8, 2.5), matCleanGlass);
  airLockGlass.position.set(5.8, 2.3, 9.5);
  scene.add(airLockGlass);

  const entranceCanopy = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 3.5), matCyanAccent);
  entranceCanopy.position.set(5.8, 4.35, 10.0);
  scene.add(entranceCanopy);

  // Side Walls
  const wallWest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 18), matWhiteWalls);
  wallWest.position.set(-9, 2.65, 0);
  scene.add(wallWest);

  const wallEast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 18), matWhiteWalls);
  wallEast.position.set(9, 2.65, 0);
  scene.add(wallEast);

  // Roof with central skylight
  const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(19, 0.4, 19), matSteel);
  mainRoof.position.set(0, 5.1, 0);
  scene.add(mainRoof);

  const skylight = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), matCleanGlass);
  skylight.position.set(0, 5.3, 0);
  scene.add(skylight);

  // Interior Modular Lab Benches (Cleanroom Island)
  const benchPositions = [
    [-4, -3], [-4, 3], [4, -3], [4, 3]
  ];
  for (const [bx, bz] of benchPositions) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.9, 1.2), matBench);
    bench.position.set(bx, 0.85, bz);
    scene.add(bench);

    // Overhead service arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 0.4), matCyanAccent);
    arm.position.set(bx, 2.6, bz);
    scene.add(arm);

    const supportPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), matSteel);
    supportPost.position.set(bx, 1.7, bz);
    scene.add(supportPost);
  }

  // Central circular analysis kiosk
  const kiosk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.0, 24), matCyanAccent);
  kiosk.position.set(0, 0.9, 0);
  scene.add(kiosk);

  const buffer = await exportGLB(scene);
  fs.writeFileSync(path.join(modelsDir, 'laboratorio.glb'), buffer);
  console.log('✓ Generated laboratorio.glb (' + buffer.length + ' bytes)');
}

// Generate WebP/SVG Thumbnails
function createSVGs() {
  const casaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
      <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.4" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <ellipse cx="300" cy="330" rx="220" ry="25" fill="#020617" opacity="0.6"/>
    <!-- House Geometry Isometric Projection -->
    <!-- Ground Base -->
    <polygon points="120,300 300,350 480,300 300,250" fill="#334155"/>
    <!-- First Floor -->
    <polygon points="150,280 290,320 290,210 150,170" fill="url(#wall)"/>
    <polygon points="290,320 450,280 450,170 290,210" fill="#94a3b8"/>
    <!-- Glass Doors & Windows -->
    <polygon points="310,290 420,262 420,195 310,220" fill="url(#glass)" stroke="#0ea5e9" stroke-width="2"/>
    <!-- Wood Entry -->
    <polygon points="170,270 240,290 240,200 170,185" fill="url(#wood)"/>
    <!-- Second Floor Cantilever -->
    <polygon points="130,170 280,210 280,120 130,80" fill="url(#wall)"/>
    <polygon points="280,210 420,170 420,80 280,120" fill="#cbd5e1"/>
    <!-- Upper Glass Balcony -->
    <polygon points="290,165 410,135 410,110 290,140" fill="url(#glass)" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Roof Slab -->
    <polygon points="120,80 280,120 430,80 270,45" fill="#1e293b"/>
    <!-- Tag -->
    <rect x="25" y="25" width="135" height="28" rx="6" fill="#0f172a" fill-opacity="0.8" stroke="#334155"/>
    <text x="35" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12" font-weight="600">RESIDENCIAL</text>
  </svg>`;

  const edificioSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#111c2e" />
      </linearGradient>
      <linearGradient id="glass2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0369a1" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="glass3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.3" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg2)"/>
    <ellipse cx="300" cy="350" rx="200" ry="20" fill="#000000" opacity="0.6"/>
    <!-- Building Tower Isometric -->
    <!-- Base -->
    <polygon points="160,320 300,360 440,320 300,280" fill="#1e293b"/>
    <!-- Glass Tower Body -->
    <polygon points="180,310 300,345 300,90 180,60" fill="url(#glass2)"/>
    <polygon points="300,345 420,310 420,60 300,90" fill="url(#glass3)"/>
    <!-- Floor Spandrel Lines -->
    <line x1="180" y1="240" x2="300" y2="275" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <line x1="300" y1="275" x2="420" y2="240" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <line x1="180" y1="180" x2="300" y2="215" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <line x1="300" y1="215" x2="420" y2="180" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <line x1="180" y1="120" x2="300" y2="155" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <line x1="300" y1="155" x2="420" y2="120" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.8"/>
    <!-- Roof Penthouse -->
    <polygon points="180,60 300,90 420,60 300,30" fill="#334155"/>
    <polygon points="240,45 300,60 360,45 300,30" fill="#64748b"/>
    <!-- Tag -->
    <rect x="25" y="25" width="130" height="28" rx="6" fill="#0f172a" fill-opacity="0.8" stroke="#334155"/>
    <text x="35" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12" font-weight="600">CORPORATIVO</text>
  </svg>`;

  const labSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#021a24" />
        <stop offset="100%" stop-color="#082f49" />
      </linearGradient>
      <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#0891b2" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg3)"/>
    <ellipse cx="300" cy="340" rx="230" ry="25" fill="#01161e" opacity="0.7"/>
    <!-- Pavilion Geometry -->
    <polygon points="110,310 300,360 490,310 300,260" fill="#0e7490"/>
    <!-- Cleanroom Walls -->
    <polygon points="130,290 300,335 300,180 130,140" fill="#f8fafc"/>
    <polygon points="300,335 470,290 470,140 300,180" fill="#e2e8f0"/>
    <!-- Futuristic Atrium Glass -->
    <polygon points="210,265 300,290 300,195 210,170" fill="url(#cyanGlow)" opacity="0.8"/>
    <polygon points="300,290 390,265 390,170 300,195" fill="#22d3ee" opacity="0.6"/>
    <!-- Cantilevered Roof with Central Skylight -->
    <polygon points="100,140 300,185 500,140 300,95" fill="#0f172a"/>
    <polygon points="220,135 300,155 380,135 300,115" fill="#06b6d4" stroke="#67e8f9" stroke-width="2"/>
    <!-- Tag -->
    <rect x="25" y="25" width="130" height="28" rx="6" fill="#082f49" fill-opacity="0.8" stroke="#0e7490"/>
    <text x="35" y="44" fill="#22d3ee" font-family="system-ui, sans-serif" font-size="12" font-weight="600">TECNOLOGÍA</text>
  </svg>`;

  fs.writeFileSync(path.join(thumbnailsDir, 'casa.svg'), casaSvg);
  fs.writeFileSync(path.join(thumbnailsDir, 'edificio.svg'), edificioSvg);
  fs.writeFileSync(path.join(thumbnailsDir, 'laboratorio.svg'), labSvg);

  // Also write .webp placeholder or SVG as webp alternative fallback
  fs.writeFileSync(path.join(thumbnailsDir, 'casa.webp'), casaSvg);
  fs.writeFileSync(path.join(thumbnailsDir, 'edificio.webp'), edificioSvg);
  fs.writeFileSync(path.join(thumbnailsDir, 'laboratorio.webp'), labSvg);
  console.log('✓ Generated SVG/WebP thumbnails');
}

async function main() {
  console.log('Building sample 3D architectural models...');
  await buildCasa();
  await buildEdificio();
  await buildLaboratorio();
  createSVGs();
  console.log('All sample assets successfully generated!');
}

main().catch(console.error);
