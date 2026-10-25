import type Phaser from 'phaser';
import { BALANCE } from '../config';
import { MAGE_FRAMES, type MageFrame } from './mageAtlas';

export type CastingSpell = 'air' | 'earth';

export function spellCastFrame(spell: CastingSpell, age: number): MageFrame {
  if (spell === 'earth') return MAGE_FRAMES.jump[age < 70 ? 0 : 3]!;
  const index = age < BALANCE.airBurst.windupMs ? 0 : age < 170 ? 1 : age < 230 ? 2 : 3;
  return MAGE_FRAMES.cast[index]!;
}

export function spellCastLean(spell: CastingSpell, age: number): number {
  if (spell === 'earth') return Math.sin(Math.min(1, age / 110) * Math.PI / 2) * 0.075;
  return Math.sin(Math.min(1, age / BALANCE.airBurst.animationMs) * Math.PI) * -0.055;
}

export class SpellCastEffect {
  private readonly brush: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.brush = scene.add.graphics().setDepth(12);
  }

  setPosition(worldX: number, worldY: number): void {
    this.brush.setPosition(worldX, worldY);
  }

  refresh(spell: CastingSpell | undefined, age: number, orbX: number, orbY: number): void {
    this.clear();
    if (!spell || age < 0 || !Number.isFinite(age)) return;
    const duration = spell === 'air' ? BALANCE.airBurst.animationMs : 190;
    if (age >= duration) return;
    const progress = Math.min(1, age / duration);
    const opacity = Math.sin(progress * Math.PI) * 0.85;
    if (opacity <= 0) return;
    const color = spell === 'air' ? 0xd4e1e9 : 0x96b354;
    const core = spell === 'earth' ? 0xd0d99a : 0xf2f6fa;
    const radius = spell === 'air' ? 12 + (1 - progress) * 14 : 10 + progress * 11;
    const phase = age / 1000 * (spell === 'air' ? -13 : 8);
    this.brush.fillStyle(color, opacity * 0.12).fillCircle(orbX, orbY, 12);
    this.brush.fillStyle(core, opacity * 0.4).fillCircle(orbX, orbY, 3.5);
    for (let band = 0; band < 3; band++) {
      const start = phase + band * Math.PI * 2 / 3;
      this.brush.lineStyle(3.5, color, opacity * 0.13).beginPath();
      this.brush.arc(orbX, orbY, radius, start, start + 0.85).strokePath();
      this.brush.lineStyle(1, core, opacity).beginPath();
      this.brush.arc(orbX, orbY, radius, start, start + 0.7).strokePath();
    }
    for (let mote = 0; mote < 7; mote++) {
      const angle = phase * 0.65 + mote * Math.PI * 2 / 7;
      const distance = spell === 'air' ? 7 + (1 - progress) * 30 : 5 + progress * 26;
      const pointX = orbX + Math.cos(angle) * distance;
      const pointY = orbY + Math.sin(angle) * distance;
      if (spell === 'earth') {
        this.brush.fillStyle(mote % 2 ? 0x85744f : color, opacity);
        this.brush.fillTriangle(pointX - 2.5, pointY + 2, pointX + 2, pointY + 1, pointX, pointY - 3);
      } else {
        this.brush.lineStyle(1.1, mote % 2 ? color : core, opacity);
        this.brush.lineBetween(pointX, pointY,
          pointX + Math.cos(angle + 0.45) * 6, pointY + Math.sin(angle + 0.45) * 6);
      }
    }
  }

  clear(): void {
    this.brush.clear();
  }
}
