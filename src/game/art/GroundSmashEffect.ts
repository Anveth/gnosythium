import type Phaser from 'phaser';
import { BALANCE } from '../config';
import type { PlatformSpec } from '../world/arenaData';
import { SPELL_PRESENTATION } from './spellPresentation';
import { TerraStrikeBurst } from './TerraStrikeBurst';

export class GroundSmashEffect {
  private readonly brush: Phaser.GameObjects.Graphics;
  private readonly burst: TerraStrikeBurst | undefined;
  private impactedAt = -Infinity;
  private centerX = 0;
  private groundY = 0;
  private left = 0;
  private right = 0;

  constructor(scene: Phaser.Scene) {
    this.brush = scene.add.graphics().setDepth(13);
    this.burst = SPELL_PRESENTATION.terraImpact ? new TerraStrikeBurst(scene) : undefined;
  }

  impact(worldX: number, surface: PlatformSpec, now: number): void {
    this.centerX = worldX;
    this.groundY = surface.y;
    this.left = surface.x;
    this.right = surface.x + surface.width;
    this.impactedAt = now;
    this.burst?.impact(worldX, surface, now);
  }

  update(now: number, playerX: number, feetY: number, diving: boolean): void {
    this.brush.clear();
    if (diving) this.drawDescent(now, playerX, feetY);
    const age = now - this.impactedAt;
    if (age >= 0 && age < 1050) {
      this.drawFractures(age);
      this.drawStones(age);
    }
    this.burst?.update(now, playerX, feetY, diving);
  }

  clear(): void {
    this.impactedAt = -Infinity;
    this.brush.clear();
    this.burst?.clear();
  }

  private drawDescent(now: number, centerX: number, feetY: number): void {
    const { brush } = this;
    for (let ribbon = 0; ribbon < 6; ribbon++) {
      const side = ribbon % 2 === 0 ? -1 : 1;
      const spread = 14 + ribbon % 3 * 6;
      const shimmer = Math.sin(now / 70 + ribbon) * 3;
      brush.lineStyle(4, 0x5a7d32, 0.18);
      brush.lineBetween(centerX + side * spread, feetY - 78 - ribbon % 3 * 12,
        centerX + side * 8 + shimmer, feetY - 5);
      brush.lineStyle(1.3, ribbon % 3 === 0 ? 0xb3c775 : 0x7f9f48, 0.8);
      brush.lineBetween(centerX + side * spread, feetY - 70 - ribbon % 3 * 12,
        centerX + side * 8 + shimmer, feetY - 5);
    }
    brush.lineStyle(2, 0xa4bd64, 0.85).strokeEllipse(centerX, feetY - 3, 33, 9);
    for (let grain = 0; grain < 8; grain++) {
      const phase = (now / 240 + grain / 8) % 1;
      const offsetX = (grain % 2 ? -1 : 1) * (12 + grain % 3 * 7);
      brush.fillStyle(grain % 3 ? 0x887c57 : 0x92ac54, (1 - phase) * 0.7);
      brush.fillTriangle(centerX + offsetX, feetY - 12 - phase * 95,
        centerX + offsetX + 2, feetY - 7 - phase * 95,
        centerX + offsetX - 2, feetY - 6 - phase * 95);
    }
  }

  private drawFractures(age: number): void {
    const { brush, centerX, groundY } = this;
    const expansion = 1 - (1 - Math.min(1, age / 230)) ** 3;
    const fade = Math.max(0, 1 - age / 1050);
    for (const side of [-1, 1]) {
      const extent = Math.min(BALANCE.groundSmash.radius * expansion,
        side < 0 ? centerX - this.left : this.right - centerX);
      for (let vein = 0; vein < 3; vein++) {
        brush.lineStyle(vein === 0 ? 3 : 1.5, vein === 0 ? 0x152414 : 0x536d31, fade * 0.9).beginPath();
        brush.moveTo(centerX, groundY + 2 + vein * 3);
        for (let segment = 1; segment <= 7; segment++) {
          const offsetX = side * extent * segment / 7;
          const offsetY = 2 + vein * 3 + Math.sin(segment * 2.1 + vein) * (2 + vein);
          brush.lineTo(centerX + offsetX, groundY + offsetY);
        }
        brush.strokePath();
      }
      brush.lineStyle(2, 0x9bb75c, fade * 0.8);
      for (let branch = 1; branch < 5; branch++) {
        const pointX = centerX + side * extent * branch / 5;
        brush.lineBetween(pointX, groundY + 3,
          Math.max(this.left, Math.min(this.right, pointX + side * 9)), groundY + 10 + branch % 2 * 3);
      }
      const waveX = centerX + side * extent;
      const opacity = Math.max(0, 1 - age / 420);
      brush.fillStyle(0x5a643d, opacity * 0.2).fillEllipse(waveX, groundY - 6, 29, 13);
      brush.lineStyle(3, 0x8da64a, opacity).lineBetween(waveX - side * 12, groundY - 3, waveX, groundY - 8);
    }
    if (age < 210) {
      const opacity = 1 - age / 210;
      brush.fillStyle(0x748e3d, opacity * 0.2).fillEllipse(centerX, groundY, 80, 20);
      brush.lineStyle(2.4, 0xb5c87c, opacity).strokeEllipse(centerX, groundY - 2, 30 + expansion * 45, 10 + expansion * 8);
      brush.lineStyle(3, 0xb4c57b, opacity * 0.7).lineBetween(centerX, groundY - 2, centerX, groundY - 28 * opacity);
    }
  }

  private drawStones(age: number): void {
    const { brush, centerX, groundY } = this;
    for (let stone = 0; stone < 24; stone++) {
      const lifetime = 440 + stone % 5 * 90;
      const progress = age / lifetime;
      if (progress >= 1) continue;
      const seconds = age / 1000;
      const side = stone % 2 === 0 ? -1 : 1;
      const velocityX = side * (65 + stone % 7 * 21);
      const velocityY = -95 - stone % 6 * 31;
      const pointX = centerX + velocityX * seconds;
      const pointY = groundY - 4 + velocityY * seconds + 430 * seconds ** 2;
      if (pointY > groundY + 9 || pointX < this.left - 6 || pointX > this.right + 6) continue;
      const radius = 2.5 + stone % 4 * 1.15;
      const angle = stone * 1.7 + seconds * side * 5;
      const opacity = (1 - progress) ** 0.7;
      brush.fillStyle(stone % 3 === 0 ? 0x75754e : 0x655f45, opacity).beginPath();
      for (let corner = 0; corner < 5; corner++) {
        const phase = angle + corner * Math.PI * 2 / 5;
        const distance = radius * (corner % 2 === 0 ? 1 : 0.7);
        const cornerX = pointX + Math.cos(phase) * distance;
        const cornerY = pointY + Math.sin(phase) * distance;
        if (corner === 0) brush.moveTo(cornerX, cornerY);
        else brush.lineTo(cornerX, cornerY);
      }
      brush.closePath().fillPath();
      brush.lineStyle(0.9, stone % 3 === 0 ? 0xa8bb67 : 0x9c9270, opacity * 0.9);
      brush.lineBetween(pointX - radius * 0.6, pointY - 1, pointX + radius * 0.3, pointY - radius * 0.6);
      if (stone % 3 === 0) {
        brush.lineStyle(1.1, 0x859f44, opacity * 0.65);
        brush.lineBetween(pointX, pointY, pointX - velocityX * 0.035, pointY - velocityY * 0.02);
      }
    }
  }
}
