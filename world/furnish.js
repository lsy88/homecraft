// Inside the hall: 中堂's altar table, 太师椅 and scrolls; 书房's desk, shelves
// and a qin on its stand. Everything is batched boxes; the scrolls are painted
// planes. The hall floor is one block up above the court.
import * as THREE from 'three';
import { BoxBatch } from '@engine/world/blocks.js';
import { canvasTexture } from '@engine/world/textures.js';
import { pixelText, textWidth } from '@engine/world/pixel-text.js';
import { HOUSE, TABLE } from './layout.js';

const FLOOR = 1;                       // the hall sits on the platform
const M = {
  rosewood: { tex: 'walnut' }, elm: { tex: 'maple' }, parquet: { tex: 'parquet' },
  rattan: { tex: 'chair_mesh' }, marble: { tex: 'travertine' },
  paper: { tex: 'linen' }, velvet: { tex: 'velvet' },
  paint: tint => ({ tex: 'paint', tint }),
};
const RED = M.paint(0x8f2b22), DARK = M.paint(0x2c2119), INK = M.paint(0x1b1b1e);
const BRASS = M.paint(0xa8925a), PAPER = M.paint(0xe8dfc9);

// 条案, 太师椅 and 茶几: the formal furniture of a 中堂.
function chair(B, x, z, yaw) {
  B.at(x, FLOOR, z, yaw, () => {
    B.box(0, 0.44, 0, 0.62, 0.07, 0.58, M.rosewood);
    B.box(0, 0.51, 0.26, 0.62, 0.42, 0.06, M.rosewood);
    B.box(0, 0.51, 0.26, 0.5, 0.3, 0.04, PAPER);
    for (const [dx, dz] of [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]]) B.box(dx, 0, dz, 0.06, 0.44, 0.06, M.rosewood);
    for (const dx of [-0.3, 0.3]) B.box(dx, 0.5, -0.02, 0.05, 0.13, 0.6, M.rosewood);
  });
}
function teaTable(B, x, z) {
  B.box(x, FLOOR + 0.5, z, 0.5, 0.06, 0.5, M.rosewood);
  for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) B.box(x + dx, FLOOR, z + dz, 0.05, 0.5, 0.05, M.rosewood);
}
// 屏风: three folding panels on the hall's rear wall.
function screen(B, x, z) {
  for (const [dx, yaw] of [[-0.9, 0.16], [0, 0], [0.9, -0.16]]) {
    B.at(x + dx, FLOOR, z, yaw, () => {
      B.box(0, 0.1, 0, 0.94, 2.5, 0.08, M.rosewood);
      B.box(0, 0.45, 0.05, 0.74, 1.6, 0.012, PAPER, { shadow: false });
    });
  }
}
// 挂轴: a hanging scroll with one large character, on the pale paper.
function scroll(ctx, w, h, text) {
  ctx.fillStyle = '#e9e1cb'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d8cdb2'; ctx.fillRect(0, 0, w, 10); ctx.fillRect(0, h - 10, w, 10);
  ctx.fillStyle = '#cdbf9c'; ctx.fillRect(0, 0, w, 4); ctx.fillRect(0, h - 4, w, 4);
  const scale = Math.max(2, Math.floor(Math.min(w / 7, h / 9)));
  const tw = textWidth(text, scale);
  pixelText(ctx, text, Math.round((w - tw) / 2), Math.round((h - 7 * scale) / 2), scale, '#33302c');
}

export function furnishHall({ layer }) {
  const B = new BoxBatch(layer);
  const planes = [], obstacles = [], bakes = [], hotspots = [], surfaces = {};
  // Contact shadows use floorAt for level 0, and the platform is already a
  // block up, so hall furniture needs no separate level.
  const foot = (x, z, w, d) => obstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, level: 0 });
  const bake = (id, x, y, z, power, radius, direction = null) => bakes.push({ id, position: [x, y, z], power, radius, direction });
  const panel = (w, h, paint, x, y, z, ry = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: canvasTexture(w * 64, h * 64, paint) }));
    mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.receiveShadow = true;
    planes.push(mesh); return mesh;
  };
  const n = HOUSE.z0 - 1;   // the rear wall's plane

  // ---------- 中堂 ----------
  // The 条案 against the rear wall, a vase and a small clock on it, and the
  // two hanging scrolls above.
  B.box(0, FLOOR, n + 1.05, 3.6, 0.92, 0.46, M.rosewood);
  B.box(0, FLOOR + 0.92, n + 1.05, 3.8, 0.07, 0.52, M.rosewood);
  for (const [x, kind] of [[-1.3, 'vase'], [1.3, 'clock']]) if (kind === 'vase') {
    B.box(x, FLOOR + 0.99, n + 1.05, 0.26, 0.34, 0.26, M.paint(0x2f5d6b));
    B.box(x, FLOOR + 1.33, n + 1.05, 0.14, 0.18, 0.14, M.paint(0x2f5d6b));
  } else {
    B.box(x, FLOOR + 0.99, n + 1.05, 0.32, 0.42, 0.14, M.rosewood);
    B.box(x, FLOOR + 1.08, n + 1.05, 0.24, 0.24, 0.02, PAPER);
  }
  foot(0, n + 1.05, 3.8, 0.55);
  for (const x of [-1.5, 1.5]) {
    B.box(x, FLOOR + 1.4, n + 1.04, 0.7, 1.9, 0.05, PAPER);
    B.box(x, FLOOR + 1.35, n + 1.03, 0.8, 0.12, 0.06, M.rosewood);
    B.box(x, FLOOR + 3.25, n + 1.03, 0.8, 0.12, 0.06, M.rosewood);
    panel(0.62, 1.7, (ctx, w, h) => scroll(ctx, w, h, x < 0 ? 'HOME' : 'CRAFT'), x, FLOOR + 2.38, n + 1.07);
  }
  screen(B, 0, n + 1.9);
  foot(0, n + 1.9, 3, 0.7);
  // A pair of 太师椅 either side of a tea table, facing the door.
  for (const x of [-1.9, 1.9]) { chair(B, x, n + 2.6, Math.PI); foot(x, n + 2.6, 0.7, 0.7); }
  teaTable(B, 0, n + 2.6); foot(0, n + 2.6, 0.6, 0.6);

  // ---------- 书房, in the west bay ----------
  // The desk faces the door with a 太师椅 behind it; the bookshelf runs along
  // the west wall; a qin waits on its own low table.
  {
    const dx = -4.4, dz = n + 1.9;
    B.box(dx, FLOOR + 0.78, dz, 2.1, 0.08, 0.92, M.elm);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.box(dx + sx * 0.92, FLOOR, dz + sz * 0.36, 0.08, 0.78, 0.08, M.elm);
    B.box(dx, FLOOR + 0.78, dz - 0.36, 1.9, 0.03, 0.28, M.paint(0x2b3a34), { shadow: false });
    // 笔筒, 砚台 and a stack of books.
    B.box(dx + 0.7, FLOOR + 0.86, dz + 0.12, 0.1, 0.2, 0.1, M.paint(0x6e4b2c));
    B.box(dx - 0.2, FLOOR + 0.86, dz + 0.2, 0.24, 0.03, 0.16, INK);
    for (let i = 0; i < 4; i++) B.box(dx - 0.55, FLOOR + 0.86 + i * 0.045, dz + 0.16, 0.3, 0.04, 0.2, M.paint([0x8a3f38, 0x37556b, 0x6a6440, 0xa08a63][i]));
    chair(B, dx, dz - 0.95, 0); foot(dx, dz - 0.95, 0.7, 0.7);
    foot(dx, dz, 2.2, 1);
    // 书格: four shelves of books against the west wall.
    const bx = HOUSE.x0 + 0.35;
    B.box(bx, FLOOR, -14.5, 0.5, 2.4, 3.4, M.rosewood);
    for (let i = 0; i < 5; i++) {
      B.box(bx + 0.28, FLOOR + 0.35 + i * 0.45, -14.5, 0.06, 0.35, 3.1, M.paint(0x3a2f24), { shadow: false });
      for (let j = 0; j < 9; j++) B.box(bx + 0.3, FLOOR + 0.38 + i * 0.45, -15.9 + j * 0.34, 0.1, 0.3 - (j % 3) * 0.04, 0.26, M.paint([0x8a3f38, 0x37556b, 0x6a6440, 0x2d2c29][j % 4]), { shadow: false });
    }
    foot(bx, -14.5, 0.7, 3.5);
    // 琴桌 and 古琴 by the east end of the rear wall.
    const qx = HOUSE.x1 - 0.9;
    B.box(qx, FLOOR + 0.62, -14.9, 0.5, 0.06, 1.5, M.rosewood);
    for (const sz of [-1, 1]) B.box(qx, FLOOR, -14.9 + sz * 0.6, 0.12, 0.62, 0.12, M.rosewood);
    B.box(qx, FLOOR + 0.68, -14.9, 0.34, 0.07, 1.3, M.paint(0x4a3524), { shadow: false });
    foot(qx, -14.9, 0.6, 1.6);
  }

  // ---------- Light ----------
  // Two warm lamps are baked: one over the 中堂 table, one over the desk.
  bake('hall-centre', 0, 3.6, -14.2, 1.6, 9);
  bake('hall-study', -4.4, 2.9, -13.6, 1.1, 7, [0, -1, 0.3]);
  // A pair of pale paper lanterns hung under the front beam.
  for (const x of [-2, 2]) {
    B.box(x, 3.55, HOUSE.z1 - 0.6, 0.03, 0.7, 0.03, BRASS, { shadow: false });
    B.box(x, 2.95, HOUSE.z1 - 0.6, 0.4, 0.5, 0.4, { tex: 'paint', tint: 0xf4e2ba, emissive: 0.8 });
  }

  return { batch: B, planes, obstacles, bakes, hotspots, surfaces };
}