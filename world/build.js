import { buildIsland } from '@engine/world/terrain.js';
import { buildForest } from '@engine/world/landscape.js';
import { ISLAND, TREES } from './layout.js';
import { defineBlocks, surfaceAt } from './materials.js';
import { buildCompound, buildHall } from './shell.js';
import { furnishCourt } from './court.js';
import { furnishHall } from './furnish.js';
import { createCourtLife } from './life.js';

export function build({ grid, layer, materials }) {
  defineBlocks(grid);
  buildIsland(grid, ISLAND, { surfaceAt, corner: 10, wobble: 0 });
  buildCompound(grid);
  buildHall(grid);
  const court = furnishCourt({ layer });
  const hall = furnishHall({ layer });
  return {
    batches: { static: court.batch, hall: hall.batch },
    planes: [...court.planes, ...hall.planes],
    obstacles: [...court.obstacles, ...hall.obstacles],
    bakes: [...court.bakes, ...hall.bakes],
    hotspots: [...court.hotspots, ...hall.hotspots],
    surfaces: { ...court.surfaces, ...hall.surfaces },
    forest: buildForest(grid, layer, TREES),
  };
}

// The moving parts the engine does not know about: the swing drifting, the
// goldfish circling the vat, the court trees' fruit.
export function setup({ stage, world }) {
  const life = createCourtLife(world.tiles.layer, world.materials);
  life.add(stage.scene);
  return { update(dt) { life.update(dt); } };
}