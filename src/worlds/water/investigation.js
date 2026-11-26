import { createJellyfish } from './jellyfish.js';
import {
  BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry, Vector3,
} from 'three';
import { CONFESSION, CRAB, EVIDENCE, JELLYFISH, WHISTLE_DENIAL } from './lines.js';
import { floorHeight } from './shore.js';

function buildClues(scene) {
  const sphere = new SphereGeometry(1, 16, 12);
  const orange = new MeshStandardMaterial({ color: 0xe4804d });
  const dark = new MeshStandardMaterial({ color: 0x292f42 });
  const pink = new MeshStandardMaterial({ color: 0xe8a5b6 });
  const gold = new MeshStandardMaterial({
    color: 0xffcd6a, roughness: 0.32, metalness: 0.36, emissive: 0x84531d,
  });

  function place(x, z) {
    const root = new Group();
    root.position.set(x, floorHeight(x, z), z);
    scene.add(root);
    return root;
  }

  function add(root, material, position, scale, geometry = sphere) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    root.add(mesh);
    return mesh;
  }

  const crab = place(-3.4, -12.2);
  add(crab, orange, [0, 0.25, 0], [0.45, 0.23, 0.32]);
  for (const x of [-0.17, 0.17]) {
    add(crab, orange, [x, 0.45, 0.12], [0.06, 0.19, 0.065]);
    add(crab, dark, [x, 0.59, 0.15], [0.08, 0.09, 0.08]);
  }
  const claw = add(crab, orange, [0.41, 0.31, 0.22], [0.29, 0.13, 0.16]);
  add(crab, orange, [-0.39, 0.15, 0.22], [0.19, 0.085, 0.12]);

  const ivory=new MeshStandardMaterial({color:0xffe4ad});
  for(const side of [-1,1]){
    for(let j=0;j<3;j++){
      const z=-.22+j*.14;
      add(crab,orange,[side*.44,.18,z],[.23,.065,.05]).rotation.z=side*.25;
      add(crab,orange,[side*.62,.12,z-.025],[.055,.15,.041]).rotation.z=side*.48;
    }
    add(crab,ivory,[side*.17,.615,.212],[.028,.03,.016]);
    for(let j=0;j<3;j++)add(crab,ivory,[side*(.12+j*.074),.45-j*.025,-.015],[.028,.019,.034]);
  }
  for(const sign of [-1,1])add(claw,ivory,[.8,sign*.55,.18],[.53,.35,.55]).rotation.z=sign*.32;

  const cup = place(4.7, -19.4);
  add(cup, pink, [0, 0.09, 0], [0.65, 0.14, 0.55]);
  for (const x of [-0.45, 0.45]) {
    add(cup, pink, [x, 0.27, 0], [0.2, 0.32, 0.37]).rotation.z = -x * 0.7;
  }
  const whistle = new Group();
  whistle.position.set(0, 0.36, 0);
  cup.add(whistle);
  add(whistle, gold, [0.09, 0, 0], [0.29, 0.14, 0.13], new BoxGeometry());
  add(whistle, gold, [-0.12, 0, 0], [0.15, 0.108, 0.11]);
  add(whistle, dark, [0.06, 0.074, 0], [0.11, 0.013, 0.055], new BoxGeometry());
  add(whistle, gold, [-0.248, 0, 0], [1, 1, 1], new TorusGeometry(0.056, 0.013, 6, 12));

  const barrel=add(whistle,gold,[-.12,0,0],[.108,.108,.13],new TorusGeometry(1,.14,8,32));
  barrel.position.z=.07;
  add(whistle,dark,[.238,.015,0],[.008,.036,.072],new BoxGeometry());
  const jellyfish = place(-3.4, -31.5);
  const witness=createJellyfish(0xefadff);
  witness.root.position.y=1.37;
  jellyfish.add(witness.root);

  return {
    points: { crab: crab.position, whistle: cup.position, jellyfish: jellyfish.position },
    crab,
    claw,
    cup,
    whistle,
    gold,
    witness,
  };
}

export function createInvestigation({ scene, shore, player, camera, ui, signal, progress, onResolve }) {
  const { teal, station } = shore;
  const { points, crab, claw, cup, whistle, gold, witness } = buildClues(scene);
  const found = new Set();
  const presented = new Set();
  const leave = { id: 'leave', label: 'Keep investigating' };
  let deniedWhistle = false;
  let crabTalking = false;
  let jellyfishTalking = false;
  let displayingWhistle = false;

  const speak = lines => ui.say({ speaker: 'Teal', lines }, signal);

  function guide() {
    const missing = EVIDENCE.find(({ id }) => !found.has(id));
    if (missing) ui.objective(`Find reef clues (${found.size}/3)`, points[missing.id]);
    else ui.objective('Present the clues to Teal', station);
  }

  async function hear(id, dialogue, setTalking) {
    setTalking(true);
    const point = points[id];
    camera.shot({
      eye: point.clone().add(new Vector3(2.95, 1.72, .75)),
      lookAt: point.clone().add(new Vector3(0, 0.62, 0)),
    });
    try {
      await ui.say(dialogue, signal);
      found.add(id);
      guide();
    } finally {
      setTalking(false);
      if (!signal.aborted) camera.releaseShot();
    }
  }

  async function showWhistle(lines) {
    displayingWhistle = true;
    scene.add(whistle);
    whistle.position.copy(station).add(new Vector3(0.45, 1.43, 0.55));
    try {
      await speak(lines);
    } finally {
      displayingWhistle = false;
      whistle.visible = false;
      cup.add(whistle);
    }
  }

  async function confront() {
    camera.shot({
      eye: station.clone().add(new Vector3(1.8, 2.15, 3.1)),
      lookAt: station.clone().add(new Vector3(0, 1.6, 0)),
    });
    try {
      if (found.size < EVIDENCE.length) {
        const options = [{ id: 'accuse', label: 'I know who did it.' }, leave];
        if (found.has('whistle') && !deniedWhistle) options.unshift({ id: 'whistle', label: 'Show Teal the whistle' });
        const choice = await ui.choose({ prompt: 'Talk to Teal', options }, signal);
        if (choice === 'whistle') {
          teal.react(1);
          await showWhistle([WHISTLE_DENIAL]);
          deniedWhistle = true;
        } else if (choice === 'accuse') {
          await speak(['Do you have a witness? A suspect? A very convincing sandcastle?']);
        }
        return;
      }

      await speak(['Ah, back again! Find anything?']);
      while (presented.size < EVIDENCE.length) {
        const remaining = EVIDENCE.filter(({ id }) => !presented.has(id));
        const choice = await ui.choose({ prompt: 'Present evidence to Teal', options: [...remaining, leave] }, signal);
        if (choice === leave.id) return;
        const evidence = remaining.find(({ id }) => id === choice);
        if (!evidence) return;
        teal.react(presented.size + 1);
        if (choice === 'whistle') await showWhistle([evidence.reply]);
        else await speak([evidence.reply]);
        presented.add(choice);
      }

      teal.confess();
      await speak(CONFESSION);
      if (progress.apply('clearBeach').changed) onResolve();
    } finally {
      teal.settle();
      if (!signal.aborted) camera.releaseShot();
    }
  }

  return {
    guide,
    register(interactions, locked, hasBubble) {
      const available = () => locked() && hasBubble();
      return [
        interactions.register({
          id: 'crab', point: points.crab, label: 'Talk to the crab',
          enabled: () => available() && !found.has('crab'),
          run: () => hear('crab', CRAB, value => { crabTalking = value; }),
        }),
        interactions.register({
          id: 'whistle', point: points.whistle, label: 'Pick up the whistle',
          enabled: () => available() && !found.has('whistle'),
          run() {
            found.add('whistle');
            whistle.visible = false;
            guide();
          },
        }),
        interactions.register({
          id: 'jellyfish', point: points.jellyfish, label: 'Talk to the jellyfish',
          enabled: () => available() && !found.has('jellyfish'),
          run: () => hear('jellyfish', JELLYFISH, value => { jellyfishTalking = value; }),
        }),
        interactions.register({
          id: 'teal', point: station, label: 'Talk to Teal', enabled: locked, run: confront,
        }),
      ];
    },
    animate(elapsed) {
      if (crabTalking) {
        crab.rotation.y = Math.atan2(player.position.x - crab.position.x, player.position.z - crab.position.z);
      }
      claw.rotation.z = crabTalking ? 0.55 + Math.sin(elapsed * 7) * 0.18 : 0;
      witness.animate(elapsed, Number(jellyfishTalking));
      whistle.visible = displayingWhistle || !found.has('whistle');
      whistle.rotation.y = displayingWhistle ? 0.3 : Math.sin(elapsed * 1.8) * 0.45;
      gold.emissiveIntensity = 0.35 + 0.3 * Math.sin(elapsed * 3);
    },
  };
}
