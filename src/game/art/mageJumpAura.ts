import type { MageFrame } from './mageAtlas';

export function recolorJumpAura(pixels: Uint8ClampedArray, width: number, height: number, frame: MageFrame): void {
  if (!frame.name.startsWith('jump-') && !frame.name.startsWith('double-') && !frame.name.startsWith('land-')) return;
  for (let row = 0; row < height; row++) {
    const relativeY = row - frame.anchor[1];
    if (relativeY < -95 || relativeY > 60) continue;
    for (let column = 0; column < width; column++) {
      const relativeX = column - frame.anchor[0];
      if (relativeX < -140 || relativeX > 56) continue;
      if ((column - frame.orb[0]) ** 2 + (row - frame.orb[1]) ** 2 < 44 ** 2) continue;
      const offset = (row * width + column) * 4;
      if (pixels[offset + 3] === 0) continue;
      const red = pixels[offset]!;
      const green = pixels[offset + 1]!;
      const blue = pixels[offset + 2]!;
      const excess = green - Math.max(red, blue);
      if (excess <= 0 || (blue < red - 8 && excess <= Math.max(10, red * 0.25))) continue;
      const gray = (red * 0.2126 + green * 0.7152 + blue * 0.0722) * 0.9;
      pixels[offset] = gray;
      pixels[offset + 1] = gray;
      pixels[offset + 2] = gray;
    }
  }
}
