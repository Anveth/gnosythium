import type { MageFrame } from './mageAtlas';
import { getMageShieldBounds } from './mageCombatContours';

export type MageMagicKind = 'arcane' | 'ward' | 'restoration' | 'air' | 'earth';
type Color = readonly [number, number, number];
type Palette = readonly [Color, Color, Color, Color];

const WARD: Palette = [[14, 6, 29], [45, 19, 82], [89, 39, 141], [158, 131, 189]];
const HEAL_BLUE: Palette = [[11, 35, 85], [37, 113, 218], [105, 191, 250], [222, 243, 255]];
const HEAL_GOLD: Palette = [[77, 40, 7], [200, 121, 14], [255, 196, 59], [255, 241, 194]];
const AIR: Palette = [[27, 35, 44], [93, 108, 123], [167, 186, 200], [235, 241, 246]];
const EARTH: Palette = [[31, 38, 16], [66, 99, 27], [121, 164, 47], [211, 225, 144]];

const REFLECTED_LIGHT: Readonly<Record<string, readonly (readonly [number, number, number, number])[]>> = {
  'block-0': [[149, 710, 25, 22], [143, 758, 25, 35]],
  'block-1': [[334, 713, 28, 22], [342, 765, 25, 32]],
  'block-2': [[544, 718, 31, 22], [551, 760, 25, 35]],
};

const EYES: Readonly<Record<string, readonly (readonly [number, number, number, number])[]>> = {
  'heal-0': [[110, 630, 5, 4], [121, 629, 4, 4]],
  'heal-1': [[297, 623, 6, 4], [316, 619, 6, 5]],
  'heal-2': [[526, 637, 6, 5], [546, 638, 6, 5]],
  'heal-3': [[759, 626, 5, 4], [771, 625, 4, 4]],
  'heal-4': [[969, 645, 5, 4], [977, 645, 5, 4]],
  'block-0': [[122, 669, 4, 4], [134, 670, 4, 4]],
  'block-1': [[300, 670, 4, 4], [311, 671, 4, 4]],
  'block-2': [[522, 684, 4, 4], [535, 685, 4, 4]],
};

export function mageHasStaffOrb(frame: MageFrame): boolean {
  return !frame.name.startsWith('hurt-')
    && frame.name !== 'block-2' && frame.name !== 'heal-2';
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function sample(palette: Palette, brightness: number): Color {
  const position = clamp(brightness) * 3;
  const index = Math.min(2, Math.floor(position));
  const amount = position - index;
  const first = palette[index]!;
  const second = palette[index + 1]!;
  return [
    first[0] + (second[0] - first[0]) * amount,
    first[1] + (second[1] - first[1]) * amount,
    first[2] + (second[2] - first[2]) * amount,
  ];
}

export function recolorMageMagic(
  pixels: Uint8ClampedArray, width: number, height: number, frame: MageFrame, kind: MageMagicKind,
): void {
  if (kind === 'arcane') return;
  const healing = frame.name.startsWith('heal-');
  const blocking = frame.name.startsWith('block-');
  const shield = getMageShieldBounds(frame);
  const reflectedLight = REFLECTED_LIGHT[frame.name];
  const eyes = EYES[frame.name];
  const hasOrb = mageHasStaffOrb(frame);
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const offset = (row * width + column) * 4;
      if (pixels[offset + 3] === 0) continue;
      const orbDistance = (column - frame.orb[0]) ** 2 + (row - frame.orb[1]) ** 2;
      const inOrb = hasOrb && orbDistance < 44 ** 2;
      const sourceX = column + frame.crop[0];
      const sourceY = row + frame.crop[1];
      if (eyes?.some(([centerX, centerY, radiusX, radiusY]) =>
        ((sourceX - centerX) / radiusX) ** 2 + ((sourceY - centerY) / radiusY) ** 2 <= 1)) continue;
      if (!healing && !blocking && !inOrb) continue;
      const red = pixels[offset]!;
      const green = pixels[offset + 1]!;
      const blue = pixels[offset + 2]!;
      const inShield = shield ? ((sourceX - shield[0]) / shield[2]) ** 2
        + ((sourceY - shield[1]) / shield[3]) ** 2 <= 1 : false;
      const onBody = !shield || sourceX < shield[0] - shield[2] * 0.55;
      const inReflection = onBody && reflectedLight?.some(([centerX, centerY, radiusX, radiusY]) =>
        ((sourceX - centerX) / radiusX) ** 2 + ((sourceY - centerY) / radiusY) ** 2 <= 1);
      if (inReflection && !inOrb && green >= red - 2 && green - blue > 6) {
        const brightness = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
        const reflected = sample(WARD, clamp(brightness * 1.12));
        pixels[offset] = reflected[0];
        pixels[offset + 1] = reflected[1];
        pixels[offset + 2] = reflected[2];
        continue;
      }
      const greenExcess = green - Math.max(red, blue);
      const mint = blue >= red - 4;
      const saturatedGreen = greenExcess > Math.max(12, red * 0.35);
      const paleShield = inShield && Math.min(red, green, blue) > 185
        && Math.max(red, green, blue) - Math.min(red, green, blue) < 40;
      if (greenExcess <= 0 && !paleShield) continue;
      if (!mint && !saturatedGreen && !paleShield) {
        if (inOrb) pixels[offset + 1] = Math.min(green, red);
        continue;
      }
      const brightness = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
      let color = sample(WARD, brightness ** 1.25);
      if (kind === 'air') color = sample(AIR, brightness);
      if (kind === 'earth') color = sample(EARTH, brightness);
      if (kind === 'ward' && brightness > 0.965) {
        const pearl = clamp((brightness - 0.965) / 0.035) * 0.3;
        color = [color[0] + (192 - color[0]) * pearl,
          color[1] + (188 - color[1]) * pearl, color[2] + (204 - color[2]) * pearl];
      }
      if (kind === 'restoration') {
        const cool = sample(HEAL_BLUE, brightness);
        const warm = sample(HEAL_GOLD, brightness);
        const gold = inOrb ? 1 : clamp((brightness - 0.72) / 0.14);
        const mixedRed = cool[0] + (warm[0] - cool[0]) * gold;
        const mixedGreen = cool[1] + (warm[1] - cool[1]) * gold;
        const mixedBlue = cool[2] + (warm[2] - cool[2]) * gold;
        color = [mixedRed, Math.min(mixedGreen, Math.max(mixedRed, mixedBlue) - 2), mixedBlue];
        if (brightness > 0.94) {
          const white = clamp((brightness - 0.94) / 0.06) * 0.65;
          color = [color[0] + (255 - color[0]) * white,
            color[1] + (252 - color[1]) * white,
            color[2] + (248 - color[2]) * white];
        }
      }
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
    }
  }
  if (kind === 'ward' && shield) addShieldGlow(pixels, width, height, frame, shield);
}

function addShieldGlow(
  pixels: Uint8ClampedArray, width: number, height: number, frame: MageFrame,
  shield: readonly [number, number, number, number, number],
): void {
  const [centerX, centerY, radiusX, radiusY] = shield;
  const glowColor: Color = [98, 56, 152];
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const distance = Math.hypot((column + frame.crop[0] - centerX) / (radiusX + 5),
        (row + frame.crop[1] - centerY) / (radiusY + 5));
      const glow = Math.max(0, 1 - Math.abs(distance - 0.9) / 0.14) * 0.075;
      if (glow === 0) continue;
      const offset = (row * width + column) * 4;
      const opacity = pixels[offset + 3]! / 255;
      const added = glow * (1 - opacity);
      const combined = opacity + added;
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = (pixels[offset + channel]! * opacity + glowColor[channel]! * added) / combined;
      }
      pixels[offset + 3] = combined * 255;
    }
  }
}
