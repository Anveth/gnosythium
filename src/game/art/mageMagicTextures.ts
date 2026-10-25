import type Phaser from 'phaser';
import type { MageFrame } from './mageAtlas';
import { mageHasStaffOrb, recolorMageMagic, type MageMagicKind } from './mageMagicColors';

export function createMageMagicTextures(scene: Phaser.Scene, frame: MageFrame): void {
  const kinds: MageMagicKind[] = frame.name.startsWith('block-') ? ['ward']
    : frame.name.startsWith('heal-') ? ['restoration']
      : mageHasStaffOrb(frame) ? ['ward', 'restoration', 'air', 'earth'] : [];
  for (const kind of kinds) {
    const key = `mage-magic-v6-${kind}-${frame.name}`;
    if (!scene.textures.exists(key)) {
      const [sourceX, sourceY, width, height] = frame.crop;
      const texture = scene.textures.createCanvas(key, width, height);
      if (!texture) throw new Error(`Cannot recolor mage frame: ${frame.name}`);
      const context = texture.getContext();
      const source = scene.textures.get(frame.renderTexture ?? frame.sheet).getSourceImage() as CanvasImageSource;
      context.drawImage(source, frame.renderTexture ? 0 : sourceX, frame.renderTexture ? 0 : sourceY,
        width, height, 0, 0, width, height);
      const image = context.getImageData(0, 0, width, height);
      recolorMageMagic(image.data, width, height, frame, kind);
      context.putImageData(image, 0, 0);
      texture.add(frame.name, 0, 0, 0, width, height);
      texture.refresh();
    }
    frame.magicTextures[kind] = key;
  }
}
