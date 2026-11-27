import {
  BoxGeometry, CatmullRomCurve3, CylinderGeometry, DirectionalLight, Fog, Group, HemisphereLight,
  LatheGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, SphereGeometry, TubeGeometry, Vector2, Vector3,
} from 'three';
import { createSword } from '../../shared/props/sword.js';
import { buildGrotto } from './grotto.js';

export function dressCavern(scene, board, forge, clinkPoint, pedestal, boardPoint) {
  scene.fog = new Fog(0x0c2225, 9, 32);
  scene.background = scene.fog.color;
  scene.add(new HemisphereLight(0xa8d6c9, 0x62564a, 0.75));
  const key = new DirectionalLight(0xe1edce, 1.05);
  key.position.set(-3, 7, 5);
  scene.add(key);

  const stone = new MeshStandardMaterial({ color: 0x303746 });
  const rock = new MeshStandardMaterial({ color: 0x44605b });
  const copper = new MeshStandardMaterial({ color: 0x91634f, metalness: 0.39, roughness: 0.43 });
  const flowMaterial = new MeshStandardMaterial({
    color: 0x86ecbd, emissive: 0x54dbcb, emissiveIntensity: 0.9, metalness: 0.22, roughness: 0.22,
  });
  const ember = new MeshStandardMaterial({ color: 0x3e3332, emissive: 0xff7631, emissiveIntensity: 0 });
  const box = new BoxGeometry();
  const chamber = new Group();
  scene.add(chamber);

  function mesh(geometry, material, position, scale = [1, 1, 1]) {
    const object = new Mesh(geometry, material);
    object.position.set(...position);
    object.scale.set(...scale);
    chamber.add(object);
    return object;
  }

  mesh(box, stone, [-1, 4.2, -6.03], [17, 8.5, 0.75]);
  const animateCave = buildGrotto(scene, forge);
  scene.environmentIntensity = 0.55;
  mesh(box, stone, [forge.x, 0.18, forge.z], [3.25, 0.36, 2.15]);
  mesh(box, rock, [forge.x, 0.52, forge.z], [2.65, 0.44, 1.78]);
  mesh(box, stone, [forge.x, 1.67, forge.z - 0.56], [2.49, 2.4, 0.6]);
  for (const side of [-1, 1]) mesh(box, rock, [forge.x + side * 1.03, 1.48, forge.z], [0.46, 1.78, 1.06]);
  mesh(box, stone, [forge.x, 2.42, forge.z], [2.62, 0.51, 1.29]);
  mesh(new LatheGeometry([[0.38,-0.22],[0.45,-0.18],[0.5,-0.1],[0.62,0.02],[0.69,0.19],[0.65,0.22],[0.58,0.19]].map(([r,y]) => new Vector2(r,y)), 40), copper, [forge.x, 0.97, forge.z + 0.23]);
  const surface = mesh(new CylinderGeometry(0.57, 0.57, 0.036, 28), ember, [forge.x, 1.18, forge.z + 0.23]);
  const fireLight = new PointLight(0xff9b53, 0, 6);
  fireLight.position.set(forge.x, 1.52, forge.z + 0.78);
  scene.add(fireLight);

  mesh(box, rock, [clinkPoint.x, 0.105, clinkPoint.z], [1.22, 0.21, 0.76]);
  const band = new MeshStandardMaterial({ color: 0xac8964, metalness: 0.56, roughness: 0.39 });
  const fluted = new CylinderGeometry(1, 0.96, 1, 10);
  mesh(fluted, stone, [clinkPoint.x, 0.05, clinkPoint.z], [.75,.12,.52]);
  mesh(fluted, band, [clinkPoint.x, 0.168, clinkPoint.z], [.68,.035,.47]);
  mesh(fluted, rock, [clinkPoint.x, 0.19, clinkPoint.z], [.68,.04,.47]);
  for (const side of [-1, 1]) {
    for (const y of [0.73,1.88,2.22]) {
      mesh(box, band, [forge.x + side*1.03,y,forge.z], [.50,.065,1.1]);
    }
  }
  const { x, z, halfX, halfZ, height } = pedestal;
  mesh(box, stone, [x, height / 2, z], [halfX * 2, height, halfZ * 2]);
  mesh(fluted, band, [x,height-.07,z], [.49,.055,.46]);
  mesh(fluted, rock, [x,height-.017,z], [.51,.06,.49]);
  const sword = createSword();
  sword.position.set(x, height + 0.01, z);
  sword.rotation.z = -0.14;
  scene.add(sword);

  board.root.position.set(boardPoint.x, 3.03, -5.07);
  board.root.rotation.y = 0.1;
  scene.add(board.root);
  const boardLight = new PointLight(0xb0dfcc, 12, 6);
  boardLight.position.set(boardPoint.x, 3.6, -2.4);
  scene.add(boardLight);
  const backing = mesh(box, rock, [boardPoint.x - 0.06, 3.03, -5.64], [7.3, 6.45, 0.95]);
  backing.rotation.y = board.root.rotation.y;

  const outlet = board.outletPoint();
  const curve = new CatmullRomCurve3([
    outlet, outlet.clone().add(new Vector3(0.43, -0.02, 0.05)), new Vector3(1.4, 1.85, -5.2),
    new Vector3(2.68, 1.24, -4.37), new Vector3(forge.x - 0.48, 1.18, forge.z + 0.23),
  ]);
  const segments = 36;
  const sides = 10;
  mesh(new TubeGeometry(curve, segments, 0.14, sides), copper, [0, 0, 0]);
  const stripe = mesh(new TubeGeometry(curve, segments, 0.046, sides), flowMaterial, [0, 0, 0.145]);
  stripe.geometry.setDrawRange(0, 0);
  const mote = new SphereGeometry(0.03, 6, 4);
  const sparkle = new MeshBasicMaterial({ color: 0xffebae, toneMapped: false });
  const sparks = Array.from({ length: 5 }, () => mesh(mote, sparkle, [0, 0, 0]));
  let flowAmount = 0;

  return {
    sword,
    forge,
    flow(value) {
      flowAmount = value;
      stripe.geometry.setDrawRange(0, Math.floor(value * segments) * sides * 6);
    },
    animate(time, lit) {
      const flicker = lit ? 1 + 0.07 * Math.sin(time * 6) : 0.12;
      animateCave(time);
      surface.material.emissiveIntensity = 1.5 * flicker;
      fireLight.intensity = 10 * flicker;
      flowMaterial.emissiveIntensity = 0.9 + Math.sin(time * 9) * 0.14;
      for (const [i, spark] of sparks.entries()) {
        const along = (time * 0.75 + i / sparks.length) % 1;
        spark.visible = along < flowAmount;
        if (!spark.visible) continue;
        curve.getPoint(along, spark.position);
        spark.position.y += 0.08 + (i % 3) * 0.045;
        spark.position.z += 0.17;
        spark.scale.setScalar(0.25 + 0.8 * Math.abs(Math.sin(time * 10 + i)));
      }
    },
  };
}
