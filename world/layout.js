// 1 block = 1 m. x east, z south, y up. A one-court siheyuan facing south:
// the gate stands in the south-east corner, the main hall across the court to
// the north, wings east and west, the reversed rooms along the south wall.

export const ISLAND = { x0: -30, x1: 32, z0: -28, z1: 31 };

// The compound wall: the perimeter cells are x = x0 and x1 - 1, z = z0 and
// z1 - 1. Everything inside is the compound's own ground.
export const COMPOUND = { x0: -15, x1: 16, z0: -17, z1: 19 };

// 正房, the one enterable building. The engine seats its north wall on z0 - 1,
// which here is the compound's own north wall: the hall is built into it.
export const HOUSE = { x0: -6, x1: 6, z0: -16, z1: -11, height: 5 };
// The 台基, a block up, and the steps down into the court. floorAt ramps
// between them; the step courses themselves are boxes.
export const PLATFORM = { x0: -8, x1: 8, z0: -16, z1: -9 };
export const STEPS = { x0: -3, x1: 4, z0: -9, z1: -7 };

export const WEST_WING = { x0: -15, x1: -9, z0: -8, z1: 2 };
export const EAST_WING = { x0: 9, x1: 15, z0: -8, z1: 2 };
export const SOUTH_ROOMS = { x0: -15, x1: 10, z0: 13, z1: 18 };
// 门楼: the passage runs north through it from the lane. `door` is [x0, x1).
export const GATE = { x0: 10, x1: 15, z0: 13, z1: 19, door: { x0: 11, x1: 14 } };
// 影壁 just inside the gate: the visitor sees it on entering and rounds it.
// Grid rectangles are whole cells, so the wall is exactly four metres wide.
export const SCREEN = { x0: 10, x1: 14, z: 10, height: 3.2 };

// Open ground inside the compound, and the lane outside the gate.
export const COURT_YARD = { x0: -9, x1: 9, z0: -8, z1: 13 };
export const STREET = { x0: -14, x1: 16, z0: 19, z1: 26 };

// The visitor starts in the court, facing the hall.
export const SPAWN = { x: 2, z: 10, heading: Math.PI };

export const MAILBOX = { x: 7.4, z: 11.8, yaw: Math.PI };
// The portal faces south, so arrivals step out into the open court.
export const PORTAL = { x: 7, z: -5.4, yaw: 0 };

// Court trees, the swing, the stone table, the goldfish vat, the well.
export const TREES_YARD = [[5.6, 0.5], [-3, -3]];
export const SWING = { x: 3.2, z: 11.2 };
export const TABLE = { x: 0.5, z: 4 };
export const VAT = { x: 7.4, z: 9.4 };
export const WELL = { x: -4, z: -6 };

export const STATIONS = [
  { id: 'about', name: '中堂', en: 'Main hall', icon: 'about', at: [0.5, -12.6], look: [0.5, -16.2], floor: 1 },
  { id: 'works', name: '书房', en: 'Study', icon: 'works', at: [-4.4, -12.6], look: [-5, -16.2], floor: 1 },
  { id: 'mailbox', name: '信箱', en: 'Mailbox', icon: 'mail', at: [MAILBOX.x, MAILBOX.z - 1.3], look: [MAILBOX.x, MAILBOX.z] },
  { id: 'portal', name: '传送门', en: 'Portal', icon: 'portal',
    at: [PORTAL.x + Math.sin(PORTAL.yaw) * 2.4, PORTAL.z + Math.cos(PORTAL.yaw) * 2.4], look: [PORTAL.x, PORTAL.z] },
  // No page of its own: the camera rises over the court until a key is pressed.
  { id: 'garden', name: '庭院', en: 'Courtyard', icon: 'scroll', page: false, at: [1, 9], look: [0, -8],
    show: [[19, 18, 24], [0, 1, -6]], showPortrait: [[27, 26, 34], [0, 1, -6]] },
];

const inside = (r, x, z) => x >= r.x0 && x < r.x1 && z >= r.z0 && z < r.z1;

// The hall floor is a block up; the steps ramp down into the court.
export function floorAt(x, z) {
  if (inside(PLATFORM, x, z)) return 1;
  if (inside(STEPS, x, z)) return Math.max(0, Math.min(1, (STEPS.z1 - z) / (STEPS.z1 - STEPS.z0)));
  return 0;
}

export const inHouse = (x, z) => inside(HOUSE, x, z);
export const inCourt = (x, z) => inside(COURT_YARD, x, z);

// Trees beyond the wall; the court has its own two.
export const TREES = [
  [-24, -14], [-26, -2], [-25, 11], [-22, 23], [-13, 27], [-1, 28], [11, 27], [22, 25],
  [26, 12], [28, -1], [26, -14], [22, -24], [11, -25], [-2, -25], [-14, -24], [9, -25],
  [-28, 4], [29, 3], [-27, 17], [28, 17], [-21, -25], [28, 24], [-27, -20], [30, 10],
];

// Baked lamp light over the compound and a little of the lane.
export const LIGHT_VOLUME = { min: [-17, -1, -19], extent: [34, 11, 40], size: [34, 11, 40] };

// Flying out of the hall goes through its middle door and down the steps.
export const DOORWAY = [{ x: 0, y: 2.2, z: -10.5 }, { x: 0, y: 1, z: -8 }];
export const EXIT = { x: 0, z: -6.4 };

// Seen from the south-east, over the gate, the whole compound in view.
export const INTRO = { pos: [38, 25, 45], portrait: [56, 38, 66], look: [0, 2, -3] };

export const PETS = {
  cat: {
    anchors: [[3.5, 8.5], [-4, 5], [6, 6], [-6.5, 11], [1, 11.5]], home: [3.5, 8.5], within: inCourt,
  },
  dog: {
    anchors: [[6, 10.6], [-6, 7.5], [2, 1], [6, -5], [-5, -3]], home: [6, 10.6], within: inCourt,
  },
};