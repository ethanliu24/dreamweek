import {
  BoxGeometry, CanvasTexture, CubicBezierCurve3, CylinderGeometry, Group, InstancedMesh, Matrix4, LineCurve3, MathUtils,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Raycaster, SphereGeometry,
  SRGBColorSpace, TubeGeometry, Vector2, Vector3,
} from 'three';
import { COLUMNS, DIRECTIONS, OUTLET, PORTS, ROWS, SOURCE, TILES, cellKey, tracePath } from './layout.js';

const WIDTH = COLUMNS + 2.25;
const HEIGHT = ROWS + 0.75;
const PIPE_Z = 0.22;
const PADDING = 0.8;
const QUARTER_TURN = Math.PI / 2;

const columnX = column => column - (COLUMNS + 1) / 2;
const rowY = row => (ROWS + 1) / 2 - row;

function makeAxes() {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * 128;
  canvas.height = HEIGHT * 128;
  const ink = canvas.getContext('2d');
  ink.translate(canvas.width / 2, canvas.height / 2);
  ink.fillStyle = '#d8cdb5';
  ink.font = 'bold 23px system-ui';
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  for (let column = 1; column <= COLUMNS; column++) {
    ink.fillText(column, columnX(column) * 128, -(ROWS / 2 + 0.17) * 128);
  }
  for (let row = 1; row <= ROWS; row++) {
    ink.fillText(row, -(COLUMNS / 2 + 0.88) * 128, -rowY(row) * 128);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return new Mesh(new PlaneGeometry(WIDTH, HEIGHT), new MeshBasicMaterial({ map, transparent: true, depthWrite: false }));
}

export function createPipeBoard() {
  const root = new Group();
  root.name = 'Forge pipe board';
  root.scale.setScalar(5 / COLUMNS);
  const slab = new BoxGeometry(WIDTH, HEIGHT, 0.16);
  const plate = new BoxGeometry(0.96, 0.96, 0.07);
  const stone = new MeshStandardMaterial({ color: 0x303746, roughness: 0.9 });
  const dark = new MeshStandardMaterial({ color: 0x273e40, roughness: 0.95 });
  const copper = new MeshStandardMaterial({ color: 0x91634f, metalness: 0.46, roughness: 0.4 });
  const collarMetal = new MeshStandardMaterial({ color: 0xc29474, metalness: 0.4, roughness: 0.35 });
  const energy = new MeshStandardMaterial({
    color: 0x9be8b8, emissive: 0x54dbcb, emissiveIntensity: 0.65, metalness: 0.22, roughness: 0.22,
  });
  const straight = new LineCurve3(new Vector3(-0.5, 0, 0), new Vector3(0.5, 0, 0));
  const elbow = new CubicBezierCurve3(new Vector3(0, 0.5, 0), new Vector3(0, 0.224, 0),
    new Vector3(0.224, 0, 0), new Vector3(0.5, 0, 0));
  const pipeShapes = {
    straight: new TubeGeometry(straight, 1, 0.102, 12, false),
    elbow: new TubeGeometry(elbow, 16, 0.102, 12, false),
  };
  const collar = new CylinderGeometry(0.147, 0.147, 0.084, 16);

  function add(parent, geometry, material, x, y, z) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  add(root, slab, stone, 0, 0, -0.08);
  const axes = makeAxes();
  axes.position.z = 0.011;
  root.add(axes);
  const recesses = new InstancedMesh(plate, dark, ROWS * COLUMNS);
  const transform = new Matrix4();
  root.add(recesses);
  for (let row = 1; row <= ROWS; row++) {
    for (let column = 1; column <= COLUMNS; column++) {
      recesses.setMatrixAt(cellKey(row, column), transform.makeTranslation(columnX(column), rowY(row), 0.027));
    }
  }

  const tiles = new Map();
  for (const { row, column, shape, turns } of TILES) {
    const pivot = new Group();
    pivot.position.set(columnX(column), rowY(row), PIPE_Z);
    pivot.rotation.z = -turns * QUARTER_TURN;
    root.add(pivot);
    const body = add(pivot, pipeShapes[shape], copper, 0, 0, 0);
    for (const port of PORTS[shape]) {
      const [dr, dc] = DIRECTIONS[port];
      add(pivot, collar, collarMetal, 0.426 * dc, -0.426 * dr, 0).rotation.z = -port * QUARTER_TURN;
    }
    tiles.set(cellKey(row, column), { pivot, body, shape, turns });
  }

  const socket = new CylinderGeometry(0.2, 0.115, 0.35, 18);
  const socketX = COLUMNS / 2 + 0.17;
  add(root, socket, collarMetal, -socketX, rowY(SOURCE.row), PIPE_Z).rotation.z = QUARTER_TURN;
  add(root, socket, collarMetal, socketX, rowY(OUTLET.row), PIPE_Z).rotation.z = -QUARTER_TURN;
  const orb = new SphereGeometry(0.13, 16, 10);
  const source = add(root, orb, energy, -socketX - 0.33, rowY(SOURCE.row), PIPE_Z);
  source.scale.y = 1.25;
  const outlet = add(root, orb, copper, socketX + 0.33, rowY(OUTLET.row), PIPE_Z);
  outlet.scale.set(0.82, 0.72, 0.82);

  const hitArea = new Mesh(new PlaneGeometry(COLUMNS, ROWS));
  hitArea.position.z = PIPE_Z;
  hitArea.visible = false;
  root.add(hitArea);
  const ray = new Raycaster();
  const pointer = new Vector2();

  function rotate(row, column) {
    if (!Number.isInteger(row) || !Number.isInteger(column) ||
        row < 1 || row > ROWS || column < 1 || column > COLUMNS) return false;
    const tile = tiles.get(cellKey(row, column));
    if (!tile) return false;
    tile.turns = (tile.turns + 1) % 4;
    tile.pivot.rotation.z = -tile.turns * QUARTER_TURN;
    return true;
  }

  return {
    root,
    outletPoint: () => outlet.getWorldPosition(new Vector3()),
    animateFlow(time) { energy.emissiveIntensity = 0.72 + Math.sin(time * 8) * 0.13; },
    rotate,
    rotateAtPointer(event, canvas, camera) {
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX >= rect.right ||
          event.clientY < rect.top || event.clientY >= rect.bottom) return false;
      root.updateWorldMatrix(true, true);
      camera.updateWorldMatrix(true, false);
      pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
      ray.setFromCamera(pointer, camera);
      const [hit] = ray.intersectObject(hitArea, false);
      if (!hit) return false;
      const point = hitArea.worldToLocal(hit.point);
      return rotate(Math.floor(ROWS / 2 - point.y) + 1, Math.floor(point.x + COLUMNS / 2) + 1);
    },
    connectedPath() {
      return tracePath((row, column) => {
        const tile = tiles.get(cellKey(row, column));
        return tile && PORTS[tile.shape].map(port => (port + tile.turns) % 4);
      });
    },
    setPowered(path = []) {
      const powered = new Set(path.map(({ row, column }) => cellKey(row, column)));
      for (const [key, { body }] of tiles) body.material = powered.has(key) ? energy : copper;
      outlet.material = powered.has(cellKey(OUTLET.row, OUTLET.column)) ? energy : copper;
    },
    frame(camera) {
      const scale = root.getWorldScale(new Vector3());
      const halfHeight = Math.max(HEIGHT * scale.y, WIDTH * scale.x / camera.aspect) / (2 * PADDING);
      const distance = halfHeight / Math.tan(MathUtils.degToRad(camera.fov / 2));
      const lookAt = root.localToWorld(new Vector3(0, 0, PIPE_Z));
      const forward = new Vector3(0, 0, 1).transformDirection(root.matrixWorld);
      return { lookAt, eye: forward.multiplyScalar(distance + 0.2 * scale.z).add(lookAt) };
    },
  };
}
