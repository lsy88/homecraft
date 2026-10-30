// The court's furnishings: painted plaques and couplets, the screen wall's
// heart, the gate's doors and lions, the goldfish vat, the swing, the well and
// the lanterns. Painted panels are small canvas textures on planes; solid
// pieces are batched boxes.
import * as THREE from 'three';
import { BoxBatch } from '@engine/world/blocks.js';
import { canvasTexture } from '@engine/world/textures.js';
import { pixelText, textWidth } from '@engine/world/pixel-text.js';
import { HOUSE, GATE, SCREEN, SWING, VAT, WELL, TABLE } from './layout.js';

const M = {
  walnut: { tex: 'walnut' }, maple: { tex: 'maple' },
  stone: { tex: 'travertine' },
  paint: tint => ({ tex: 'paint', tint }),
};
const LACQUER = M.paint(0x8f2b22);   // 朱漆: posts, doors, lanterns
const BADGE = M.paint(0x1c1a17);     // lacquered black boards and frames
const BRASS = M.paint(0xa8925a);
const GREY = M.paint(0x9aa2a6);
const glow = (tint, emissive = 1) => ({ tex: 'paint', tint, emissive });

// 匾额: a black lacquered board with raised gold characters on a gold rim.
function plaque(ctx, w, h, text) {
  ctx.fillStyle = '#221f1a'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#b8944e'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
  const scale = Math.max(1, Math.floor(Math.min(h / 8, w / (text.length * 6.2))));
  const tw = textWidth(text, scale);
  pixelText(ctx, text, Math.round((w - tw) / 2), Math.round((h - 7 * scale) / 2), scale, '#e3c069');
}

// 对联: a red strip with gold characters, hung each side of the hall door.
function couplet(ctx, w, h, text) {
  ctx.fillStyle = '#9c2a20'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b23a2b'; ctx.fillRect(2, 2, w - 4, h - 4);
  const scale = Math.max(1, Math.floor(Math.min(w / 6.5, h / (text.length * 6.2))));
  const tw = textWidth('A', scale);
  [...text].forEach((ch, i) => pixelText(ctx, ch, Math.round((w - tw) / 2), Math.round(h * 0.07 + i * h * 0.86 / text.length), scale, '#efcd86'));
}

// 影壁's heart: a raised circular medallion of brick, with a carved 福 in it.
function screenHeart(ctx, w, h) {
  ctx.fillStyle = '#8e969c'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#7e868c';
  for (let y = 0; y < h; y += 12) ctx.fillRect(0, y, w, 1);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#69727a'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.fillStyle = '#aab1b6'; ctx.fill();
  const s = Math.max(2, Math.floor(r * 0.14));
  ctx.fillStyle = '#5c666e';
  // A seal-script 福, chunky enough to read at a distance.
  const x0 = cx - 3 * s, y0 = cy - 3.5 * s;
  ctx.fillRect(x0, y0, 6 * s, s);
  ctx.fillRect(x0 + 2.5 * s, y0, s, 2 * s);
  ctx.fillRect(x0, y0 + 2 * s, 6 * s, s);
  ctx.fillRect(x0, y0 + 2.5 * s, s, 4 * s);
  ctx.fillRect(x0 + 5 * s, y0 + 2.5 * s, s, 4 * s);
  ctx.fillRect(x0, y0 + 6.5 * s, 6 * s, s);
  ctx.fillRect(x0 + 3 * s, y0 + 3.5 * s, s, 3 * s);
}

export function furnishCourt({ layer }) {
  const B = new BoxBatch(layer);
  const planes = [], obstacles = [], bakes = [], hotspots = [], surfaces = {};
  const foot = (x, z, w, d, level = 0) => obstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, level });
  const bake = (id, x, y, z, power, radius, direction = null) => bakes.push({ id, position: [x, y, z], power, radius, direction });
  // A painted board standing flat on a wall (facing south unless turned).
  const panel = (w, h, paint, x, y, z, ry = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: canvasTexture(w * 64, h * 64, paint) }));
    mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.receiveShadow = true;
    planes.push(mesh); return mesh;
  };
  const front = HOUSE.z1 + 1;   // the hall's front wall plane

  // ---------- 正房's front ----------
  // 门额 over the middle door, 楹联 either side, hung flat on the lattice.
  B.box(0, 3.55, front + 0.06, 3.2, 0.8, 0.12, BADGE);
  panel(3.0, 0.66, (ctx, w, h) => plaque(ctx, w, h, 'MY HOME'), 0, 3.95, front + 0.125);
  for (const [x, text] of [[-2.36, 'HOME'], [2.36, 'SWEET']]) {
    B.box(x, 1.35, front + 0.06, 0.46, 1.9, 0.1, BADGE);
    panel(0.36, 1.78, (ctx, w, h) => couplet(ctx, w, h, text), x, 2.3, front + 0.12);
  }
  // The opened door leaves: red lattice panels folded back against the posts.
  for (const side of [-1, 1]) {
    B.at(side * 1.5, 1, front - 0.1, side * Math.PI * 0.4, () => {
      B.box(0.72, 0, 0, 1.38, 2.85, 0.07, M.walnut);
      B.box(0.72, 0.12, 0.05, 1.2, 2.55, 0.012, M.paint(0xb9a98c), { shadow: false });
      for (let i = 0; i < 4; i++) B.box(0.72, 0.6 + i * 0.5, 0.06, 1.24, 0.04, 0.02, LACQUER);
      B.box(1.28, 1.15, 0.09, 0.16, 0.16, 0.05, BRASS);
    });
  }
  // The platform's front edge, and three stone steps down to the court.
  B.box(0, 0, -9.3, 16, 1, 0.55, M.stone);
  for (let i = 0; i < 3; i++) B.box(0, 0, -8.8 + i * 0.5, 6.6, 0.34 + i * 0.33, 0.5, GREY);
  foot(0, -8.4, 6.8, 1.6);

  // ---------- 影壁 ----------
  const scx = (SCREEN.x0 + SCREEN.x1) / 2;
  B.box(scx, 0, SCREEN.z + 0.5, SCREEN.x1 - SCREEN.x0 + 0.5, 0.5, 1.3, M.stone);
  panel(2.6, 2.3, (ctx, w, h) => screenHeart(ctx, w, h), scx, SCREEN.height / 2 + 0.28, SCREEN.z - 0.001);
  foot(scx, SCREEN.z + 0.5, SCREEN.x1 - SCREEN.x0, 1.3);

  // ---------- 门楼 ----------
  const gd = GATE.door, gcx = (gd.x0 + gd.x1) / 2;
  // A stone threshold, a plaque over the street door, and a pair of red leaves
  // swung open inside the passage.
  B.box(gcx, 0, GATE.z1 - 0.15, gd.x1 - gd.x0, 0.08, 0.3, M.stone);
  B.box(gcx, 3.2, GATE.z1 + 0.06, 3.3, 0.8, 0.12, BADGE);
  panel(3.1, 0.66, (ctx, w, h) => plaque(ctx, w, h, 'HOMECRAFT'), gcx, 3.6, GATE.z1 + 0.125);
  for (const [x, dir] of [[gd.x0 + 0.05, -1], [gd.x1 - 0.05, 1]]) {
    B.at(x, 0, GATE.z1 - 0.6, dir * Math.PI * 0.34, () => {
      B.box(0.7, 0, 0, 1.38, 2.8, 0.09, LACQUER);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) B.box(0.24 + i * 0.34, 0.5 + j * 0.72, 0.06, 0.22, 0.5, 0.02, BRASS);
      B.box(1.2, 1.25, 0.08, 0.16, 0.16, 0.06, BRASS);
    });
  }
  // Two stone lions on pedestals, one either side of the street door.
  for (const x of [gd.x0 - 0.75, gd.x1 + 0.75]) {
    B.box(x, 0, GATE.z1 + 0.4, 0.7, 0.62, 0.7, M.stone);
    B.box(x, 0.62, GATE.z1 + 0.4, 0.54, 0.52, 0.54, M.stone);
    B.box(x, 1.14, GATE.z1 + 0.36, 0.44, 0.4, 0.44, M.stone);
    B.box(x, 1.46, GATE.z1 + 0.3, 0.5, 0.18, 0.34, M.stone);
    foot(x, GATE.z1 + 0.4, 0.85, 0.85);
  }

  // ---------- The court ----------
  // 金鱼缸: a stone vat of water under the gingko.
  B.box(VAT.x, 0, VAT.z, 1.7, 0.12, 1.7, M.stone);
  B.box(VAT.x, 0.12, VAT.z, 1.5, 0.6, 1.5, GREY);
  B.box(VAT.x, 0.6, VAT.z, 1.56, 0.16, 1.56, M.stone);
  B.box(VAT.x, 0.68, VAT.z, 1.2, 0.02, 1.2, M.paint(0x2f6f7a, 0.3));
  foot(VAT.x, VAT.z, 1.75, 1.75);

  // 石桌: a stone table with a teapot and two cups, and four drum stools.
  B.box(TABLE.x, 0, TABLE.z, 0.46, 0.72, 0.46, GREY);
  B.box(TABLE.x, 0.72, TABLE.z, 1.34, 0.1, 1.34, M.paint(0xb2b7b9));
  B.box(TABLE.x - 0.22, 0.82, TABLE.z - 0.18, 0.3, 0.18, 0.3, M.paint(0x7a4030));
  for (const [dx, dz] of [[0.26, 0.2], [-0.05, 0.3]]) {
    B.box(TABLE.x + dx, 0.82, TABLE.z + dz, 0.1, 0.07, 0.1, M.paint(0x8d4a34));
  }
  for (const [dx, dz] of [[0, -1.05], [0, 1.05], [-1.05, 0], [1.05, 0]]) {
    B.box(TABLE.x + dx, 0, TABLE.z + dz, 0.46, 0.44, 0.46, M.paint(0x8f8681));
    B.box(TABLE.x + dx, 0.44, TABLE.z + dz, 0.54, 0.06, 0.54, M.paint(0xa9a39c));
    foot(TABLE.x + dx, TABLE.z + dz, 0.5, 0.5);
  }
  foot(TABLE.x, TABLE.z, 1.4, 1.4);

  // 秋千: two timber posts, a crossbeam and the seat (the ropes and seat swing).
  for (const dx of [-1.5, 1.5]) B.box(SWING.x + dx, 0, SWING.z, 0.15, 3.1, 0.15, M.walnut);
  B.box(SWING.x, 3.05, SWING.z, 3.5, 0.16, 0.16, M.walnut);
  foot(SWING.x, SWING.z, 3.5, 0.35);

  // 井: a low stone drum well, its rim worn smooth, under a small pulley frame.
  B.box(WELL.x, 0, WELL.z, 1.5, 0.7, 1.5, M.paint(0x8d949a));
  B.box(WELL.x, 0.7, WELL.z, 1.62, 0.12, 1.62, M.stone);
  B.box(WELL.x, 0.74, WELL.z, 1.1, 0.03, 1.1, M.paint(0x25323a, 0.15));
  for (const dx of [-0.62, 0.62]) B.box(WELL.x + dx, 0, WELL.z, 0.12, 1.9, 0.12, M.walnut);
  B.box(WELL.x, 1.82, WELL.z, 1.42, 0.14, 0.14, M.walnut);
  B.box(WELL.x, 1.58, WELL.z, 0.18, 0.26, 0.18, M.walnut);
  foot(WELL.x, WELL.z, 1.7, 1.7);

  // 石灯: two lanterns flanking the steps, their light baked in.
  for (const x of [-4.4, 4.4]) {
    B.box(x, 0, -6.4, 0.42, 0.35, 0.42, M.stone);
    B.box(x, 0.35, -6.4, 0.16, 1.25, 0.16, GREY);
    B.box(x, 1.6, -6.4, 0.42, 0.42, 0.42, glow(0xffdca6, 0.9));
    B.box(x, 2.02, -6.4, 0.58, 0.12, 0.58, GREY);
    bake('court-lantern', x, 1.7, -6.4, 1.4, 6.5);
    foot(x, -6.4, 0.6, 0.6);
  }
  // 宫灯: red lanterns hung from each end of the hall's front eave.
  for (const x of [-6.5, 6.5]) {
    B.box(x, 3.55, front + 0.55, 0.05, 0.7, 0.05, BRASS, { shadow: false });
    B.box(x, 2.92, front + 0.55, 0.52, 0.6, 0.52, glow(0xff7a4a, 0.85));
    B.box(x, 3.52, front + 0.55, 0.36, 0.06, 0.36, BRASS);
    bake('hall-lantern', x, 3.05, front + 0.55, 1.8, 7);
  }
  // Light through the hall's open middle door.
  bake('hall-door', 0, 2.6, front + 0.2, 2.2, 9, [0, -1, 0.2]);

  return { batch: B, planes, obstacles, bakes, hotspots, surfaces };
}