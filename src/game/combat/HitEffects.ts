import Phaser from 'phaser';
import { COLORS } from '../config';

interface Effect {
  brush: Phaser.GameObjects.Graphics;
  progress: number;
}

export class HitEffects {
  private readonly active = new Set<Effect>();

  constructor(private readonly scene: Phaser.Scene) {
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.clear());
  }

  blood(worldX: number, worldY: number, sourceX: number): void {
    const direction = worldX >= sourceX ? 1 : -1;
    const droplets = Array.from({ length: 15 }, () => ({
      velocityX: direction * Phaser.Math.Between(65, 240) + Phaser.Math.Between(-45, 45),
      velocityY: Phaser.Math.Between(-165, 45),
      radius: Phaser.Math.FloatBetween(1.1, 2.6),
    }));
    this.animate(460, (brush, progress) => {
      const seconds = progress * 0.46;
      for (const [index, droplet] of droplets.entries()) {
        const offsetX = droplet.velocityX * seconds;
        const offsetY = droplet.velocityY * seconds + 380 * seconds ** 2;
        brush.lineStyle(droplet.radius, index % 3 === 0 ? 0xda655b : 0x983847, 1 - progress);
        brush.lineBetween(worldX + offsetX - droplet.velocityX * 0.025,
          worldY + offsetY - droplet.velocityY * 0.012, worldX + offsetX, worldY + offsetY);
        brush.fillStyle(0xb84350, 1 - progress).fillCircle(worldX + offsetX, worldY + offsetY, droplet.radius);
      }
      if (progress < 0.3) {
        brush.lineStyle(3 * (1 - progress), 0xf0c0b0, 1 - progress / 0.3);
        brush.lineBetween(worldX - direction * 9, worldY + 12, worldX + direction * 14, worldY - 14);
      }
    });
  }

  arcane(worldX: number, worldY: number, strength = 1): void {
    const phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.animate(360, (brush, progress) => {
      const radius = (7 + (1 - (1 - progress) ** 3) * 44) * strength;
      const opacity = 1 - progress;
      brush.fillStyle(COLORS.magic, opacity ** 3 * 0.22).fillCircle(worldX, worldY, radius * 0.8);
      brush.lineStyle(2.2 * opacity + 0.3, COLORS.magic, opacity).strokeCircle(worldX, worldY, radius);
      brush.lineStyle(1, 0xc3efa1, opacity * 0.8).strokeCircle(worldX, worldY, radius * 0.62);
      for (let index = 0; index < 9; index++) {
        const angle = phase + index * Math.PI * 2 / 9 + progress * 0.4;
        const shardX = worldX + Math.cos(angle) * radius;
        const shardY = worldY + Math.sin(angle) * radius;
        const length = (8 + index % 3 * 3) * opacity * strength;
        brush.lineStyle(index % 2 + 1, index % 2 ? COLORS.magic : COLORS.magicLight, opacity);
        brush.lineBetween(shardX, shardY, shardX + Math.cos(angle) * length, shardY + Math.sin(angle) * length);
      }
      brush.fillStyle(0xf0fff6, opacity ** 4).fillCircle(worldX, worldY, (6 + progress * 5) * strength);
    });
  }

  surfaceImpact(worldX: number, worldY: number, color: number): void {
    this.animate(160, (brush, progress) => {
      const opacity = 1 - progress;
      brush.lineStyle(1.2, color, opacity * 0.7).strokeCircle(worldX, worldY, 3 + progress * 8);
      for (let spark = 0; spark < 4; spark++) {
        const direction = Math.PI / 4 + spark * Math.PI / 2;
        const distance = 4 + progress * (12 + spark % 2 * 6);
        brush.lineStyle(1.4, color, opacity);
        brush.lineBetween(worldX + Math.cos(direction) * distance * 0.6,
          worldY + Math.sin(direction) * distance * 0.6,
          worldX + Math.cos(direction) * distance, worldY + Math.sin(direction) * distance);
      }
    });
  }

  clear(): void {
    for (const effect of this.active) {
      this.scene.tweens.killTweensOf(effect);
      effect.brush.destroy();
    }
    this.active.clear();
  }

  private animate(duration: number, draw: (brush: Phaser.GameObjects.Graphics, progress: number) => void): void {
    if (this.active.size >= 24) return;
    const effect: Effect = { brush: this.scene.add.graphics().setDepth(16), progress: 0 };
    this.active.add(effect);
    draw(effect.brush, 0);
    this.scene.tweens.add({
      targets: effect,
      progress: 1,
      duration,
      onUpdate: () => { effect.brush.clear(); draw(effect.brush, effect.progress); },
      onComplete: () => { effect.brush.destroy(); this.active.delete(effect); },
    });
  }
}
