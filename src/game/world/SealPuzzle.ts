import Phaser from 'phaser';
import { COLORS } from '../config';
import { drawSigil } from '../art/sigil';
import { ARENA } from './arenaData';

export class SealPuzzle {
  readonly target: Phaser.GameObjects.Zone;
  readonly gate: Phaser.Physics.Arcade.Image;
  activated = false;
  private readonly brush: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private readonly onActivate: () => void) {
    this.target = scene.add.zone(ARENA.seal.x, ARENA.seal.y, 62, 62);
    scene.physics.add.existing(this.target, true);
    this.gate = scene.physics.add.staticImage(ARENA.gate.x, ARENA.gate.y, 'solid');
    this.gate.setDisplaySize(ARENA.gate.width, ARENA.gate.height).refreshBody().setVisible(false);
    this.brush = scene.add.graphics().setDepth(5);
  }

  activate(): void {
    if (this.activated) return;
    this.restore(true);
    this.onActivate();
  }

  restore(activated: boolean): void {
    this.activated = activated;
    if (this.gate.body) this.gate.body.enable = !activated;
  }

  update(now: number): void {
    const { seal, gate } = ARENA;
    this.brush.clear();
    this.brush.fillStyle(this.activated ? COLORS.magic : COLORS.gold, 0.07 + Math.sin(now / 600) * 0.025);
    this.brush.fillCircle(seal.x, seal.y, 48);
    drawSigil(this.brush, seal.x, seal.y, 33, this.activated ? COLORS.magic : COLORS.gold, now / 9000);
    const left = gate.x - gate.width / 2;
    const right = gate.x + gate.width / 2;
    const top = gate.y - gate.height / 2;
    const bottom = gate.y + gate.height / 2;
    this.brush.fillStyle(COLORS.stoneTop).fillRect(left - 11, ARENA.floorY - 8, gate.width + 22, 8);
    if (this.activated) {
      this.brush.lineStyle(1, COLORS.magic, 0.3);
      this.brush.lineBetween(left, ARENA.floorY - 20, left, ARENA.floorY);
      this.brush.lineBetween(right, ARENA.floorY - 20, right, ARENA.floorY);
      return;
    }
    const pulse = 0.5 + Math.sin(now / 450) * 0.5;
    this.brush.fillStyle(COLORS.gold, 0.04 + pulse * 0.03).fillRect(left - 13, top, gate.width + 26, gate.height);
    this.brush.fillStyle(COLORS.gold, 0.13 + pulse * 0.06).fillRect(left, top, gate.width, gate.height);
    this.brush.lineStyle(2, COLORS.gold, 0.9);
    this.brush.lineBetween(left, top, left, bottom);
    this.brush.lineBetween(right, top, right, bottom);
    this.brush.lineStyle(1, COLORS.gold, 0.35 + pulse * 0.25);
    for (let bandY = top; bandY < bottom; bandY += 42) {
      const shimmer = Math.sin(now / 500 + bandY / 60) * 6;
      this.brush.lineBetween(left + 5, bandY + shimmer, right - 5, bandY + 20 + shimmer);
    }
    for (let runeY = top + 105; runeY < ARENA.floorY - 60; runeY += 165) {
      drawSigil(this.brush, gate.x, runeY, 19, COLORS.gold, now / 12000);
    }
  }
}
