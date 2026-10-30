// The swing's ropes and seat, the goldfish circling the vat, and the two
// court trees. Each is its own small mesh so the hall and the walls stay
// batched. Nothing is touched while off screen.
import * as THREE from 'three';
import { BoxBatch } from '@engine/world/blocks.js';
import { rng } from '@engine/world/textures.js';
import { SWING, VAT, TREES_YARD } from './layout.js';

const WOOD = { tex: 'walnut' }, ROPE = { tex: 'paint', tint: 0x5a4632 };

// 秋千: the seat hangs from the crossbeam and drifts, as if someone had just
// stepped off. The seat's pivot sits at the beam, so the ropes stay vertical
// to it and the seat keeps its length.
function createSwing(layer, materials) {
  const group = new THREE.Group(); group.name = 'swing';
  const pivot = new THREE.Group();
  const top = 3.05, length = 1.95;
  pivot.position.set(SWING.x, top, SWING.z);
  const seat = new BoxBatch(layer);
  seat.box(0, 0, 0, 1.1, 0.08, 0.42, WOOD);
  seat.box(0, 0.08, 0, 1.1, 0.03, 0.42, { tex: 'paint', tint: 0x8f2b22 });
  const body = new THREE.Group();
  for (const m of seat.build(materials)) body.add(m);
  body.position.y = -length;
  const ropes = [];
  for (const dx of [-0.46, 0.46]) {
    const rope = new THREE.Mesh(new THREE.BoxGeometry(0.035, length, 0.035), new THREE.MeshLambertMaterial(ROPE));
    rope.castShadow = true; rope.position.set(dx, -length / 2, 0); ropes.push(rope);
  }
  body.add(...ropes);
  pivot.add(body); group.add(pivot);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let t = 0;
  return {
    group,
    update(dt) {
      if (reduced.matches) return;
      t += dt;
      pivot.rotation.x = Math.sin(t * 0.85) * 0.2 * (0.55 + 0.45 * Math.sin(t * 0.37));
    },
  };
}

// 金鱼: three fish drifting round the vat, each a small box body with a tail.
function createFish(layer, materials) {
  const group = new THREE.Group(); group.name = 'fish';
  const random = rng(4242);
  const fish = Array.from({ length: 4 }, (_, i) => {
    const b = new BoxBatch(layer);
    const tint = [0xd9822b, 0xe8b04a, 0xc9452f, 0xe0d6c4][i];
    b.box(0, 0, 0, 0.16, 0.08, 0.08, { tex: 'paint', tint });
    b.box(0, 0.01, -0.11, 0.05, 0.1, 0.1, { tex: 'paint', tint: i === 3 ? 0xf2ede3 : tint });
    b.box(0.09, 0.03, 0, 0.03, 0.03, 0.03, { tex: 'paint', tint: 0x22201c });
    const body = new THREE.Group();
    for (const m of b.build(materials)) body.add(m);
    group.add(body);
    return { body, phase: random() * Math.PI * 2, speed: 0.3 + random() * 0.22, radius: 0.16 + random() * 0.22, depth: 0.1 + random() * 0.16, wobble: random() * 6 };
  });
  group.position.set(VAT.x, 0, VAT.z);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let t = 0;
  return {
    group,
    update(dt) {
      if (reduced.matches) return;
      t += dt;
      for (const f of fish) {
        const a = f.phase + t * f.speed;
        const x = Math.cos(a) * f.radius, z = Math.sin(a) * f.radius;
        f.body.position.set(x, 0.78 + Math.sin(t * 1.6 + f.wobble) * 0.03 - f.depth * 0.3, z);
        f.body.rotation.y = -a + Math.PI / 2;
        f.body.rotation.z = Math.sin(t * 4 + f.wobble) * 0.12;
      }
    },
  };
}

// 石榴 and 枣树: a squat trunk, airy crown, and in late summer a scatter of
// small round fruit. Three crown boxes keep the cost near nothing.
function createTrees(layer, materials) {
  const group = new THREE.Group(); group.name = 'court-trees';
  const random = rng(991);
  const trees = TREES_YARD.map(([x, z], i) => {
    const b = new BoxBatch(layer);
    const trunk = 2.6 + i * 0.7, tint = [0x6f8a52, 0x5f7b48][i];
    b.box(0, 0, 0, 0.5, trunk + 0.4, 0.5, { tex: 'log', top: 'log_top' });
    b.box(0.1, trunk - 0.2, 0.1, 2.6 + i * 0.5, 1.8, 2.4 + i * 0.4, { tex: 'foliage', tint });
    b.box(0.6, trunk + 1.2, -0.4, 1.9, 1.5, 1.9, { tex: 'foliage', tint });
    b.box(-0.7, trunk + 0.55, 0.5, 1.6, 1.3, 1.7, { tex: 'foliage', tint });
    for (let k = 0; k < 9; k++) {
      const a = random() * Math.PI * 2, r = 0.7 + random() * 1.1, y = trunk + random() * 2;
      b.box(Math.cos(a) * r, y, Math.sin(a) * r, 0.16, 0.16, 0.16, { tex: 'paint', tint: i ? 0x9b2b25 : 0xd9822b });
    }
    const mesh = new THREE.Group();
    for (const m of b.build(materials)) mesh.add(m);
    mesh.position.set(x, 0, z); group.add(mesh);
    return mesh;
  });
  return { group, update() {} };
}

export function createCourtLife(layer, materials) {
  const swing = createSwing(layer, materials);
  const fish = createFish(layer, materials);
  const trees = createTrees(layer, materials);
  return {
    group: swing.group,
    add(scene) { scene.add(swing.group, fish.group, trees.group); },
    update(dt) { swing.update(dt); fish.update(dt); trees.update(dt); },
  };
}