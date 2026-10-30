// The compound's blocks and its ground: 青砖 walls tinted from the brick tile,
// grey tile roofs, 青石 plinths, and paved or grass ground by region.
import { inRect } from '@engine/world/terrain.js';
import { COMPOUND, STREET } from './layout.js';

export function defineBlocks(grid) {
  // 青砖: white_brick's courses at 25 cm each, tinted blue-grey.
  grid.define('brick', { tex: { all: 'white_brick' }, tint: 0x84939d, merge: true });
  // 青石 for the plinth and the step courses.
  grid.define('plinth', { tex: { all: 'stone' }, tint: 0xa8b0b4, merge: true });
  // 灰瓦: the roof tile, plain and as a lighter ridge line.
  grid.define('tile', { tex: { all: 'roof' }, merge: true });
  grid.define('tile_ridge', { tex: { all: 'roof' }, tint: 0xa4aeb4, merge: true });
  // The ground: square flags in the compound, rough setts in the lane.
  grid.define('paving', { tex: { all: 'pavers' }, tint: 0x939da5, merge: true });
  grid.define('lane', { tex: { all: 'gravel' }, tint: 0xc3c7c9, merge: true });
}

export const surfaceAt = (x, z, edge) => {
  if (edge < 2.5) return 'sand';
  if (inRect(STREET, x, z)) return 'lane';
  if (inRect(COMPOUND, x, z)) return 'paving';
  return 'grass';
};