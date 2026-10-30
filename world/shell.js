// The compound in blocks: the perimeter wall, the side ranges, the gate, the
// screen wall and the hall's shell and roof. Ground and block types live in
// materials.js.
import { COMPOUND, GATE, SOUTH_ROOMS, WEST_WING, EAST_WING, SCREEN, HOUSE, PLATFORM } from './layout.js';

// 硬山顶 in block form: courses step in from both eaves, one block a course,
// with a lighter ridge on top. Bounds are the outer cells, inclusive.
function saddleRoof(grid, { x0, x1, z0, z1, base, courses, along, group = 'static' }) {
  for (let k = 0; k < courses; k++) {
    const y = base + k, block = k === courses - 1 ? 'tile_ridge' : 'tile';
    if (along === 'z') grid.fill(x0, y, z0 + k, x1 + 1, y + 1, z1 - k + 1, block, group);
    else grid.fill(x0 + k, y, z0, x1 - k + 1, y + 1, z1 + 1, block, group);
  }
}

// 山墙: the brick under a gable end, rising with the courses.
function gables(grid, { x0, x1, z0, z1, base, courses, along, group = 'static' }) {
  const top = v => base + Math.min(v - (along === 'z' ? z0 : x0), (along === 'z' ? z1 : x1) - v, courses - 1);
  if (along === 'z') {
    for (let z = z0; z <= z1; z++) for (const x of [x0, x1]) for (let y = base; y < top(z); y++) grid.set(x, y, z, 'brick', group);
  } else {
    for (let x = x0; x <= x1; x++) for (const z of [z0, z1]) for (let y = base; y < top(x); y++) grid.set(x, y, z, 'brick', group);
  }
}

// A closed range: solid blue brick to the wall head, then its tiled roof.
function range(grid, r) {
  grid.fill(r.x0, 0, r.z0, r.x1 + 1, 4, r.z1 + 1, 'brick');
  saddleRoof(grid, { ...r, base: 4, courses: 2, along: 'x' });
  gables(grid, { ...r, base: 4, courses: 2, along: 'x' });
}

export function buildCompound(grid) {
  const { x0, x1, z0, z1 } = COMPOUND;
  const west = x0, east = x1 - 1, north = z0, south = z1 - 1;
  // 院墙: three metres of brick under a grey tile coping, with the gate's
  // passage left open in the south wall.
  for (let x = x0; x < x1; x++) {
    for (const z of [north, south]) {
      if (z === south && x >= GATE.door.x0 && x < GATE.door.x1) continue;
      grid.fill(x, 0, z, x + 1, 3, z + 1, 'brick');
      grid.set(x, 3, z, 'tile_ridge');
    }
  }
  for (let z = z0; z < z1; z++) {
    for (const x of [west, east]) {
      grid.fill(x, 0, z, x + 1, 3, z + 1, 'brick');
      grid.set(x, 3, z, 'tile_ridge');
    }
  }

  // 厢房: their ridges run north and south, down the court's sides.
  for (const w of [WEST_WING, EAST_WING]) range(grid, { x0: w.x0, x1: w.x1 - 1, z0: w.z0, z1: w.z1 - 1 });
  // 倒座房: its ridge runs east and west, along the south wall.
  range(grid, { x0: SOUTH_ROOMS.x0, x1: SOUTH_ROOMS.x1 - 1, z0: SOUTH_ROOMS.z0, z1: SOUTH_ROOMS.z1 - 1 });

  // 门楼: a house over the passage, its roof ridge running north and south.
  {
    const g = GATE, r = { x0: g.x0, x1: g.x1 - 1, z0: g.z0, z1: g.z1 - 1 };
    grid.fill(r.x0, 0, r.z0, r.x1 + 1, 4, r.z1 + 1, 'brick');
    // The 门道: three metres wide, four high, out through both faces.
    grid.fill(g.door.x0, 0, r.z0, g.door.x1, 4, r.z1 + 1, null);
    saddleRoof(grid, { ...r, base: 4, courses: 2, along: 'z' });
    gables(grid, { ...r, base: 4, courses: 2, along: 'z' });
  }

  // 影壁 opposite the gate: a brick face under a tiled cap. Its stone base and
  // heart are furniture in court.js, so it can overhang the cells here.
  grid.fill(SCREEN.x0, 0, SCREEN.z, SCREEN.x1, SCREEN.height, SCREEN.z + 1, 'brick');
  grid.fill(SCREEN.x0, SCREEN.height, SCREEN.z, SCREEN.x1, SCREEN.height + 1, SCREEN.z + 1, 'tile_ridge');
}

// 正房: four walls, each in its own group so the camera can lower the one in
// the way; a glazed front with the middle bay left open as the door; the roof
// lifts away when the player is inside.
export function buildHall(grid) {
  const { x0, x1, z0, z1, height } = HOUSE;
  const w0 = x0 - 1, w1 = x1, n = z0 - 1, s = z1;
  // Rear, west and east walls, standing on the platform.
  grid.fill(w0, 1, n, w1 + 1, height, n + 1, 'brick', 'wallN');
  grid.fill(w0, 1, z0, w0 + 1, height, z1, 'brick', 'wallW');
  grid.fill(w1, 1, z0, w1 + 1, height, z1, 'brick', 'wallE');
  // The front: 槛窗 either side of the door. The middle three metres stay open.
  for (let x = w0; x <= w1; x++) {
    if (x >= -1 && x <= 1) continue;
    grid.fill(x, 1, s, x + 1, height - 1, s + 1, 'glass', 'wallS');
    grid.fill(x, height - 1, s, x + 1, height, s + 1, 'brick', 'wallS');
  }
  // Vermilion posts divide the bays; the middle two carry the door frame.
  for (const x of [w0, -2, 2, w1]) grid.fill(x, 1, s, x + 1, height, s + 1, 'brick', 'wallS');
  grid.fill(w0, height - 1, s, w1 + 1, height, s + 1, 'brick', 'wallS');

  // The roof, one course of eaves beyond the walls on every side.
  const r = { x0: w0 - 1, x1: w1 + 1, z0: n - 1, z1: s + 1 };
  saddleRoof(grid, { ...r, base: height, courses: 3, along: 'z', group: 'roof' });
  gables(grid, { ...r, base: height, courses: 3, along: 'z', group: 'roof' });

  // 台基: the deck the hall stands on.
  grid.fill(PLATFORM.x0, 0, PLATFORM.z0, PLATFORM.x1, 1, PLATFORM.z1, 'plinth');
}