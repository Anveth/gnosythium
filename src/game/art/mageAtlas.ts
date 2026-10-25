import type Phaser from 'phaser';
import movementUrl from '../../assets/mage/movement.png';
import combatUrl from '../../assets/mage/combat.png';
import spellsUrl from '../../assets/mage/spells.png';
import { prepareMageFrame } from './mageFrameClip';
import { createMageMagicTextures } from './mageMagicTextures';
import type { MageMagicKind } from './mageMagicColors';

type Sheet = 'mage-movement' | 'mage-combat' | 'mage-spells';

export interface MageFrame {
  name: string;
  sheet: Sheet;
  crop: readonly [number, number, number, number];
  anchor: readonly [number, number];
  orb: readonly [number, number];
  scale: number;
  renderTexture?: string;
  magicTextures: Partial<Record<MageMagicKind, string>>;
}

const BODY_SCALE: Readonly<Record<string, number>> = {
  idle: 1, walk: 1.08, run: 1.18, jump: 1.12, double: 1.1,
  land: 1.08, block: 1.06, hurt: 1.04, cast: 0.96, heal: 0.94,
};

function frame(
  name: string, sheet: Sheet, crop: MageFrame['crop'],
  anchorX: number, anchorY: number, orbX: number, orbY: number,
): MageFrame {
  const scale = BODY_SCALE[name.split('-')[0]!] ?? 1;
  return { name, sheet, crop, scale, magicTextures: {},
    anchor: [anchorX - crop[0], anchorY - crop[1]], orb: [orbX - crop[0], orbY - crop[1]] };
}

const movement: Sheet = 'mage-movement';
const combat: Sheet = 'mage-combat';
const spells: Sheet = 'mage-spells';

export const MAGE_FRAMES = {
  idle: [
    frame('idle-0', movement, [160, 55, 183, 222], 246, 270, 312, 101),
    frame('idle-1', movement, [350, 55, 192, 222], 443, 270, 509, 101),
    frame('idle-2', movement, [548, 55, 183, 222], 638, 270, 702, 101),
    frame('idle-3', movement, [740, 55, 188, 222], 831, 270, 895, 101),
  ],
  walk: [
    frame('walk-0', movement, [10, 283, 205, 197], 119, 472, 183, 322),
    frame('walk-1', movement, [190, 283, 190, 197], 291, 472, 356, 319),
    frame('walk-2', movement, [355, 283, 203, 197], 469, 472, 519, 322),
    frame('walk-3', movement, [528, 283, 196, 197], 642, 472, 685, 314),
    frame('walk-4', movement, [700, 283, 199, 197], 820, 472, 860, 326),
    frame('walk-5', movement, [870, 283, 185, 197], 990, 472, 1026, 323),
  ],
  run: [
    frame('run-0', movement, [0, 490, 236, 216], 112, 695, 206, 542),
    frame('run-1', movement, [180, 490, 220, 216], 290, 695, 368, 536),
    frame('run-2', movement, [355, 490, 214, 216], 467, 695, 526, 538),
    frame('run-3', movement, [530, 490, 213, 216], 638, 695, 699, 545),
    frame('run-4', movement, [707, 490, 210, 216], 815, 695, 875, 542),
    frame('run-5', movement, [882, 490, 173, 216], 985, 695, 1026, 537),
  ],
  jump: [
    frame('jump-0', movement, [96, 730, 225, 187], 230, 918, 290, 786),
    frame('jump-1', movement, [326, 705, 210, 215], 439, 900, 493, 744),
    frame('jump-2', movement, [535, 705, 215, 215], 653, 887, 715, 735),
    frame('jump-3', movement, [750, 705, 225, 215], 866, 886, 936, 744),
  ],
  doubleJump: [
    frame('double-0', movement, [95, 900, 225, 265], 223, 1110, 282, 931),
    frame('double-1', movement, [320, 900, 215, 265], 439, 1110, 501, 924),
    frame('double-2', movement, [535, 910, 217, 255], 653, 1110, 721, 941),
    frame('double-3', movement, [752, 910, 225, 255], 871, 1110, 952, 945),
  ],
  land: [
    frame('land-0', movement, [90, 1180, 215, 280], 221, 1419, 286, 1204),
    frame('land-1', movement, [310, 1180, 235, 280], 444, 1423, 507, 1272),
    frame('land-2', movement, [565, 1180, 220, 280], 686, 1423, 762, 1284),
    frame('land-3', movement, [790, 1180, 185, 280], 878, 1423, 936, 1258),
  ],
  block: [
    frame('block-0', combat, [10, 575, 200, 245], 117, 807, 178, 624),
    frame('block-1', combat, [200, 600, 230, 220], 326, 807, 356, 624),
    frame('block-2', combat, [420, 575, 216, 245], 525, 807, 560, 620),
  ],
  hurt: [
    frame('hurt-1', combat, [290, 1050, 225, 230], 404, 1256, 441, 1100),
    frame('hurt-2', combat, [525, 1050, 290, 230], 652, 1256, 690, 1100),
  ],
  cast: [
    frame('cast-0', spells, [0, 195, 171, 245], 96, 432, 146, 226),
    frame('cast-3', spells, [528, 225, 177, 215], 607, 432, 665, 291),
    frame('cast-4', spells, [705, 225, 195, 215], 782, 432, 875, 267),
    frame('cast-5', spells, [878, 195, 177, 245], 960, 432, 1028, 242),
  ],
  heal: [
    frame('heal-0', spells, [20, 445, 180, 370], 112, 798, 172, 552),
    frame('heal-1', spells, [200, 445, 210, 370], 308, 798, 310, 512),
    frame('heal-2', spells, [410, 445, 245, 370], 538, 798, 497, 555),
    frame('heal-3', spells, [655, 445, 215, 370], 753, 798, 830, 600),
    frame('heal-4', spells, [870, 445, 185, 370], 978, 798, 1028, 602),
  ],
} satisfies Record<string, MageFrame[]>;

export function preloadMage(scene: Phaser.Scene): void {
  for (const [key, url] of [['mage-movement', movementUrl], ['mage-combat', combatUrl], ['mage-spells', spellsUrl]]) {
    if (key && url && !scene.textures.exists(key)) scene.load.image(key, url);
  }
}

export function createMageFrames(scene: Phaser.Scene): void {
  for (const entry of Object.values(MAGE_FRAMES).flat()) {
    const texture = scene.textures.get(entry.sheet);
    if (!texture.has(entry.name)) texture.add(entry.name, 0, ...entry.crop);
    const clipped = prepareMageFrame(scene, entry);
    if (clipped) entry.renderTexture = clipped;
    createMageMagicTextures(scene, entry);
  }
}
