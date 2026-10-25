export interface PlatformSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnemySpawn {
  x: number;
  y: number;
  left: number;
  right: number;
}

const ARENA_HEIGHT = 960;

export const ARENA = {
  width: 3000,
  height: ARENA_HEIGHT,
  floorY: 740,
  deathY: 900,
  platforms: [
    { x: 0, y: 740, width: 1260, height: 220 },
    { x: 1450, y: 740, width: 1550, height: 220 },
    { x: 430, y: 616, width: 220, height: 26 },
    { x: 730, y: 506, width: 240, height: 28 },
    { x: 1085, y: 618, width: 155, height: 26 },
    { x: 1620, y: 610, width: 200, height: 26 },
    { x: 1925, y: 500, width: 220, height: 28 },
  ] satisfies PlatformSpec[],
  enemies: [
    { x: 880, y: 690, left: 690, right: 1130 },
    { x: 2030, y: 690, left: 1870, right: 2230 },
    { x: 2530, y: 690, left: 2440, right: 2790 },
  ] satisfies EnemySpawn[],
  seal: { x: 850, y: 442 },
  gate: { x: 2320, y: ARENA_HEIGHT / 2, width: 54, height: ARENA_HEIGHT },
  checkpoint: { x: 1555, y: 690 },
  exit: { x: 2850, y: 678 },
} as const;
