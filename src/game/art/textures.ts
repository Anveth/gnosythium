import Phaser from 'phaser';
import { ART_SCALE, COLORS, MAGE_ART } from '../config';

export function createTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('mage')) return;
  const brush = scene.add.graphics().setScale(ART_SCALE);
  brush.generateTexture('mage', MAGE_ART.width * ART_SCALE, MAGE_ART.height * ART_SCALE).clear();

  brush.fillStyle(0x060c13, 0.5).fillEllipse(30, 71, 51, 9);
  brush.fillStyle(0x393037).fillTriangle(28, 22, 7, 71, 53, 71);
  brush.fillStyle(0x65515a).fillTriangle(32, 25, 33, 70, 53, 70);
  brush.fillStyle(0x8a746b).fillEllipse(30, 21, 23, 28);
  brush.fillStyle(0x241d25).fillRect(19, 17, 22, 7);
  brush.fillStyle(COLORS.danger).fillRect(23, 20, 4, 3).fillRect(34, 20, 4, 3);
  brush.lineStyle(2, COLORS.danger).lineBetween(23, 32, 37, 32);
  brush.lineStyle(3, 0x8d8584).lineBetween(50, 43, 50, 67);
  brush.fillStyle(0x10151e).fillRect(17, 68, 11, 8).fillRect(36, 68, 11, 8);
  brush.generateTexture('sentinel', 60 * ART_SCALE, 78 * ART_SCALE).clear();

  brush.fillStyle(COLORS.magic, 0.08).fillCircle(18, 18, 18);
  brush.fillStyle(COLORS.magic, 0.22).fillCircle(18, 18, 11);
  brush.fillStyle(COLORS.magic).fillCircle(18, 18, 5);
  brush.fillStyle(0xf0fff6).fillCircle(18, 18, 2);
  brush.generateTexture('bolt', 36 * ART_SCALE, 36 * ART_SCALE).clear();

  brush.fillStyle(COLORS.hostileMagic, 0.15).fillCircle(12, 12, 12);
  brush.fillStyle(COLORS.hostileMagic).fillCircle(12, 12, 5);
  brush.fillStyle(0xffded1).fillCircle(12, 12, 2);
  brush.generateTexture('hostile-bolt', 24 * ART_SCALE, 24 * ART_SCALE).clear();

  brush.setScale(1);
  brush.fillStyle(0xffffff).fillRect(0, 0, 8, 8);
  brush.generateTexture('solid', 8, 8).clear();
  brush.fillStyle(COLORS.magic).fillCircle(3, 3, 2);
  brush.generateTexture('mote', 6, 6).clear();
  brush.destroy();
}
