import type Phaser from 'phaser';
import type { MageFrame } from './mageAtlas';
import { getMageFrameContours } from './mageFrameContours';
import { isolateMageArtwork } from './mageFrameIsolation';
import { getMageShieldBounds } from './mageCombatContours';
import { recolorJumpAura } from './mageJumpAura';

export function prepareMageFrame(scene: Phaser.Scene, frame: MageFrame): string | undefined {
  const contours = getMageFrameContours(frame);
  if (!contours) return undefined;
  const key = `mage-clipped-v2-${frame.name}`;
  if (scene.textures.exists(key)) return key;
  const [sourceX, sourceY, width, height] = frame.crop;
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) throw new Error(`Cannot prepare mage frame: ${frame.name}`);
  const context = texture.getContext();
  const mask = document.createElement('canvas');
  mask.width = width;
  mask.height = height;
  const maskContext = mask.getContext('2d');
  if (!maskContext) throw new Error(`Cannot mask mage frame: ${frame.name}`);
  const shield = getMageShieldBounds(frame);
  contours.forEach((contour, contourIndex) => {
    if (shield && contourIndex === 1) {
      const [centerX, centerY, radiusX, radiusY, rotation] = shield;
      maskContext.save();
      maskContext.translate(centerX - sourceX, centerY - sourceY);
      maskContext.rotate(rotation);
      maskContext.scale(radiusX, radiusY);
      const gradient = maskContext.createRadialGradient(0, 0, 0, 0, 0, 1);
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.88, '#fff');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      maskContext.fillStyle = gradient;
      maskContext.fillRect(-1, -1, 2, 2);
      maskContext.restore();
      return;
    }
    maskContext.beginPath();
    contour.forEach(([offsetX, offsetY], index) => {
      const pointX = offsetX + frame.anchor[0];
      const pointY = offsetY + frame.anchor[1];
      if (index === 0) maskContext.moveTo(pointX, pointY);
      else maskContext.lineTo(pointX, pointY);
    });
    maskContext.closePath();
    maskContext.fillStyle = '#fff';
    maskContext.fill();
  });
  context.drawImage(scene.textures.get(frame.sheet).getSourceImage() as CanvasImageSource,
    sourceX, sourceY, width, height, 0, 0, width, height);
  context.save();
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(mask, 0, 0);
  context.restore();
  const image = context.getImageData(0, 0, width, height);
  isolateMageArtwork(image.data, width, height, frame.orb[0], frame.orb[1],
    frame.anchor, frame.name.startsWith('double-'), frame.name.startsWith('block-'));
  recolorJumpAura(image.data, width, height, frame);
  context.putImageData(image, 0, 0);
  texture.add(frame.name, 0, 0, 0, width, height);
  texture.refresh();
  return key;
}
