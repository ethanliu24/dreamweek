import { CatmullRomCurve3, CylinderGeometry, DoubleSide, Group, IcosahedronGeometry, Mesh, MeshStandardMaterial, Shape, ShapeGeometry, SphereGeometry, TubeGeometry, Vector3 } from 'three';

// Extra beach and reef dressing; keeps the central walking route and existing landmarks clear.
export function createShoreDetails(scene, floorHeight) {
  const materials = {
    sandStone: new MeshStandardMaterial({ color: 0xb9a17b, roughness: 0.94 }), warmStone: new MeshStandardMaterial({ color: 0x9d8b73, roughness: 0.92 }), darkStone: new MeshStandardMaterial({ color: 0x586d6b, roughness: 0.9 }),
    shell: new MeshStandardMaterial({ color: 0xe9c7a8, roughness: 0.48, metalness: 0.04 }), shellPink: new MeshStandardMaterial({ color: 0xd99a9b, roughness: 0.43, metalness: 0.05 }), shellRidge: new MeshStandardMaterial({ color: 0xffe8cd, roughness: 0.42 }),
    starfish: new MeshStandardMaterial({ color: 0xc97855, roughness: 0.86 }), starfishLight: new MeshStandardMaterial({ color: 0xe4a36f, roughness: 0.84 }), wood: new MeshStandardMaterial({ color: 0x80664d, roughness: 0.96 }), woodLight: new MeshStandardMaterial({ color: 0xa58a68, roughness: 0.92 }),
    grass: new MeshStandardMaterial({ color: 0x788d59, roughness: 0.9, side: DoubleSide }), grassLight: new MeshStandardMaterial({ color: 0xa5a66b, roughness: 0.9, side: DoubleSide }), kelp: new MeshStandardMaterial({ color: 0x367d70, roughness: 0.72, side: DoubleSide }), kelpLight: new MeshStandardMaterial({ color: 0x67a58d, roughness: 0.72, side: DoubleSide }),
    coralPink: new MeshStandardMaterial({ color: 0xd27e87, roughness: 0.66 }), coralPeach: new MeshStandardMaterial({ color: 0xe49b78, roughness: 0.68 }), coralLilac: new MeshStandardMaterial({ color: 0x9d8bc5, roughness: 0.66 }), coralCream: new MeshStandardMaterial({ color: 0xe2c7a0, roughness: 0.7 }), sponge: new MeshStandardMaterial({ color: 0xd18c55, roughness: 0.8 }), spongeInner: new MeshStandardMaterial({ color: 0x686868, roughness: 0.95 }),
  };
  const rockGeometry = new IcosahedronGeometry(1, 1), pebbleGeometry = new SphereGeometry(1, 12, 8), shellGeometry = new SphereGeometry(0.18, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), woodGeometry = new CylinderGeometry(1, 1, 1, 8), seaBladeGeometry = makeLeafGeometry();
  const ridgeGeometries = [], seaGrass = [], kelpPlants = [], coralPlants = [], looseObjects = new Group();
  looseObjects.name = 'Shore details';
  scene.add(looseObjects);

  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2;
    const curve = new CatmullRomCurve3([new Vector3(0, 0.087, 0), new Vector3(Math.cos(a) * 0.075, 0.078, Math.sin(a) * 0.057), new Vector3(Math.cos(a) * 0.15, 0.018, Math.sin(a) * 0.116)]);
    ridgeGeometries.push(new TubeGeometry(curve, 6, 0.0045, 4, false));
  }
  function random(seed) { let state = seed >>> 0; return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; }; }
  const rand = random(74291), between = (a, b) => a + (b - a) * rand(), pick = list => list[Math.floor(rand() * list.length)];
  function addPebble(x, z, scale, material = pick([materials.sandStone, materials.warmStone, materials.darkStone])) {
    const mesh = new Mesh(pebbleGeometry, material);
    mesh.position.set(x, floorHeight(x, z) + scale.y * 0.42, z); mesh.scale.set(scale.x, scale.y, scale.z); mesh.rotation.set(between(-0.16, 0.16), between(0, Math.PI * 2), between(-0.13, 0.13));
    looseObjects.add(mesh); return mesh;
  }
  function addShell(x, z, scale = 1, pink = false) {
    const root = new Group();
    root.position.set(x, floorHeight(x, z) + 0.025, z); root.rotation.y = between(0, Math.PI * 2); root.rotation.z = between(-0.15, 0.15); root.scale.setScalar(scale);
    const base = new Mesh(shellGeometry, pink ? materials.shellPink : materials.shell); base.scale.set(1, 0.58, 0.78); root.add(base);
    for (const geometry of ridgeGeometries) { const ridge = new Mesh(geometry, materials.shellRidge); ridge.scale.set(1, 0.58, 0.78); root.add(ridge); }
    looseObjects.add(root); return root;
  }
  const starShape = new Shape();
  for (let i = 0; i < 10; i++) { const angle = i / 10 * Math.PI * 2 - Math.PI / 2, radius = i % 2 === 0 ? 0.23 : 0.105, x = Math.cos(angle) * radius, y = Math.sin(angle) * radius; if (i === 0) starShape.moveTo(x, y); else starShape.lineTo(x, y); }
  starShape.closePath();
  const starGeometry = new ShapeGeometry(starShape, 2);
  function addStarfish(x, z, scale = 1, light = false) {
    const root = new Group();
    root.position.set(x, floorHeight(x, z) + 0.035, z); root.rotation.set(-Math.PI / 2, between(0, Math.PI * 2), 0); root.scale.setScalar(scale);
    root.add(new Mesh(starGeometry, light ? materials.starfishLight : materials.starfish));
    const centre = new Mesh(new SphereGeometry(0.065, 12, 8), materials.starfishLight); centre.position.z = 0.012; root.add(centre); looseObjects.add(root); return root;
  }
  function addLog(x, z, length, angle) {
    const root = new Group(); root.position.set(x, floorHeight(x, z) + 0.085, z); root.rotation.y = angle;
    const trunk = new Mesh(woodGeometry, materials.wood); trunk.scale.set(0.075, length, 0.09); trunk.rotation.z = Math.PI / 2; root.add(trunk);
    for (const side of [-1, 1]) { const knot = new Mesh(pebbleGeometry, materials.woodLight); knot.position.set(side * length * 0.28, 0.018, 0.006); knot.scale.set(0.065, 0.043, 0.082); root.add(knot); }
    looseObjects.add(root);
  }
  function makeLeafGeometry() { const shape = new Shape(); shape.moveTo(0, 0); shape.bezierCurveTo(-0.13, 0.24, -0.19, 0.72, 0, 1); shape.bezierCurveTo(0.17, 0.72, 0.12, 0.24, 0, 0); return new ShapeGeometry(shape, 8); }
  function makeSeaGrass(x, z, size = 1) {
    const root = new Group(); root.position.set(x, floorHeight(x, z) + 0.018, z);
    const count = 6 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + between(-0.24, 0.24), height = between(0.38, 0.78) * size, lean = between(0.13, 0.4) * size, dx = Math.cos(angle) * lean, dz = Math.sin(angle) * lean;
      const curve = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(dx * 0.28, height * 0.38, dz * 0.28), new Vector3(dx * 0.72, height * 0.78, dz * 0.72), new Vector3(dx, height, dz)]);
      root.add(new Mesh(new TubeGeometry(curve, 8, 0.018 * size, 5, false), i % 3 ? materials.grass : materials.grassLight));
    }
    looseObjects.add(root); seaGrass.push({ root, phase: between(0, Math.PI * 2), amount: between(0.035, 0.085) });
  }
  function makeKelp(x, z, size = 1) {
    const root = new Group(); root.position.set(x, floorHeight(x, z) + 0.025, z);
    for (let i = 0; i < 4; i++) {
      const angle = i / 4 * Math.PI * 2 + between(-0.28, 0.28), height = between(1.0, 1.8) * size, width = between(0.17, 0.27) * size;
      const leaf = new Mesh(seaBladeGeometry, i % 2 ? materials.kelp : materials.kelpLight); leaf.position.set(Math.cos(angle) * 0.07, 0.02, Math.sin(angle) * 0.07); leaf.rotation.y = -angle; leaf.rotation.z = between(-0.14, 0.14); leaf.scale.set(width, height, 1); root.add(leaf);
      const stem = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(Math.cos(angle) * 0.05, height * 0.42, Math.sin(angle) * 0.05), new Vector3(Math.cos(angle) * 0.1, height * 0.88, Math.sin(angle) * 0.1)]);
      root.add(new Mesh(new TubeGeometry(stem, 7, 0.013 * size, 5, false), materials.kelp));
    }
    looseObjects.add(root); kelpPlants.push({ root, phase: between(0, Math.PI * 2), amount: between(0.045, 0.095) });
  }
  function makeCoralFan(x, z, material, size = 1) {
    const root = new Group(); root.position.set(x, floorHeight(x, z) + 0.035, z);
    for (let i = 0; i < 7; i++) {
      const fan = (i / 6 - 0.5) * 1.6, height = between(0.78, 1.42) * size * (1 - Math.abs(fan) * 0.24), sway = fan * 0.48 * size;
      const points = [new Vector3(0, 0, 0), new Vector3(sway * 0.15, height * 0.32, 0), new Vector3(sway * 0.62, height * 0.73, between(-0.07, 0.07) * size), new Vector3(sway, height, 0)];
      root.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(points), 9, 0.035 * size, 6, false), material));
      if (i % 2 === 0) { const fork = new CatmullRomCurve3([points[2].clone(), points[2].clone().add(new Vector3(fan * 0.18, 0.12 * size, 0.035 * size)), points[2].clone().add(new Vector3(fan * 0.36, 0.24 * size, 0.055 * size))]); root.add(new Mesh(new TubeGeometry(fork, 5, 0.022 * size, 5, false), material)); }
    }
    const base = new Mesh(new SphereGeometry(0.15 * size, 12, 8), materials.coralCream); base.scale.set(1, 0.55, 0.85); base.position.y = 0.055 * size; root.add(base);
    looseObjects.add(root); coralPlants.push({ root, phase: between(0, Math.PI * 2), amount: between(0.012, 0.028) });
  }
  function makeSponge(x, z, size = 1) {
    const root = new Group(); root.position.set(x, floorHeight(x, z) + 0.04, z);
    const height = 0.55 * size, tube = new Mesh(new CylinderGeometry(0.13 * size, 0.18 * size, height, 12, 1, true), materials.sponge); tube.position.y = height * 0.5; root.add(tube);
    const rim = new Mesh(new SphereGeometry(0.145 * size, 16, 8), materials.sponge); rim.scale.set(1, 0.22, 1); rim.position.y = height; root.add(rim);
    const hole = new Mesh(new CylinderGeometry(0.075 * size, 0.09 * size, 0.015, 12), materials.spongeInner); hole.position.y = height + 0.005; root.add(hole); looseObjects.add(root);
  }

  // Pebbles and driftwood frame the beach edges without closing the route.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 18; i++) { const x = side * between(7.6, 17.2), z = between(0.2, 8.6), s = between(0.11, 0.34); addPebble(x, z, { x: s * between(0.9, 1.7), y: s * between(0.35, 0.65), z: s * between(0.8, 1.5) }); }
    for (let i = 0; i < 11; i++) { const x = side * between(8.2, 16.4), z = between(-8.5, -0.8); addPebble(x, z, { x: between(0.17, 0.52), y: between(0.08, 0.21), z: between(0.16, 0.43) }); }
  }
  const shellSites = [[-13.2, 7.4], [-10.6, 5.6], [-15.3, 3.1], [-8.8, 1.7], [-16.7, 7.9], [12.3, 7.1], [9.6, 5.4], [15.8, 4.2], [11.1, 1.6], [17.1, 7.8], [-12.2, -3.2], [-15.4, -5.1], [13.7, -2.8], [9.2, -6.3]];
  for (const [x, z] of shellSites) { addShell(x, z, between(0.55, 0.95), rand() > 0.55); if (rand() > 0.46) addShell(x + between(-0.38, 0.38), z + between(-0.32, 0.32), between(0.28, 0.48), rand() > 0.5); }
  addStarfish(-14.4, 5.7, 0.82, true); addStarfish(14.1, 2.2, 0.72, false); addStarfish(-10.1, -4.7, 0.58, true);
  addLog(-12.0, 3.0, 1.55, -0.42); addLog(13.7, 6.1, 1.15, 0.68); addLog(-16.0, -2.8, 0.95, 0.2);
  for (const [x, z, size] of [[-9.1, 8.0, 0.78], [-16.5, 6.2, 0.92], [-8.3, 3.5, 0.72], [-18.0, 1.3, 0.82], [9.0, 8.1, 0.8], [16.7, 6.5, 0.95], [8.5, 3.0, 0.75], [18.0, 0.9, 0.82], [-11.8, -7.2, 0.88], [12.4, -8.3, 0.9]]) makeSeaGrass(x, z, size);
  for (const [x, z, size] of [[-10.5, -13.5, 0.92], [13.4, -16.0, 0.95], [-15.0, -20.5, 1.1], [9.7, -24.2, 1.0], [-12.1, -29.5, 1.05], [15.3, -33.0, 0.9], [-8.9, -36.2, 0.86], [11.2, -38.0, 0.9]]) makeKelp(x, z, size);
  const coralMats = [materials.coralPink, materials.coralPeach, materials.coralLilac, materials.coralCream], coralSites = [[-9.3, -17.8, 0.95], [14.8, -20.8, 0.86], [-15.2, -25.5, 1.05], [9.4, -29.0, 0.9], [-10.2, -34.1, 0.86], [15.5, -37.5, 0.9]];
  for (const [x, z, size] of coralSites) makeCoralFan(x, z, pick(coralMats), size);
  makeSponge(-13.0, -16.8, 1.0); makeSponge(12.2, -31.2, 0.88); makeSponge(7.8, -37.2, 0.76);

  return {
    animate(elapsed) {
      for (const item of seaGrass) { item.root.rotation.z = Math.sin(elapsed * 0.8 + item.phase) * item.amount; item.root.rotation.x = Math.cos(elapsed * 0.62 + item.phase) * item.amount * 0.55; }
      for (const item of kelpPlants) { item.root.rotation.z = Math.sin(elapsed * 0.55 + item.phase) * item.amount; item.root.rotation.x = Math.cos(elapsed * 0.43 + item.phase) * item.amount * 0.7; }
      for (const item of coralPlants) item.root.rotation.y = Math.sin(elapsed * 0.38 + item.phase) * item.amount;
    },
  };
}
