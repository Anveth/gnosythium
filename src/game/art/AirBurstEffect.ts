import type Phaser from 'phaser';
import { BALANCE } from '../config';

interface AirImpact {
  x: number;
  y: number;
  startedAt: number;
}

const WAVE_DURATION_MS = 620;

export class AirBurstEffect {
  private readonly brush: Phaser.GameObjects.Graphics;
  private startedAt = -Infinity;
  private centerX = 0;
  private centerY = 0;
  private readonly impacts: AirImpact[] = [];

  constructor(scene: Phaser.Scene) {
    this.brush = scene.add.graphics().setDepth(13);
  }

  release(worldX: number, worldY: number, now: number): void {
    this.centerX = worldX;
    this.centerY = worldY;
    this.startedAt = now;
  }

  impact(worldX: number, worldY: number, now: number): void {
    if (this.impacts.length < 8) this.impacts.push({ x: worldX, y: worldY, startedAt: now });
  }

  update(now: number): void {
    this.brush.clear();
    const age = now - this.startedAt;
    if (age >= 0 && age < WAVE_DURATION_MS) this.drawWave(age);
    for (let index = this.impacts.length - 1; index >= 0; index--) {
      const impact = this.impacts[index]!;
      const progress = (now - impact.startedAt) / 300;
      if (progress >= 1) {
        this.impacts.splice(index, 1);
        continue;
      }
      const radius = 5 + progress * 35;
      for (let shard = 0; shard < 8; shard++) {
        const angle = shard * Math.PI / 4 + 0.2;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        this.brush.lineStyle(1.5, 0xd9e4ec, (1 - progress) ** 2);
        this.brush.lineBetween(impact.x + offsetX * 0.55, impact.y + offsetY * 0.55,
          impact.x + offsetX, impact.y + offsetY);
      }
    }
  }

  clear(): void {
    this.startedAt = -Infinity;
    this.impacts.length = 0;
    this.brush.clear();
  }

  private drawWave(age: number): void {
    const progress = age / WAVE_DURATION_MS;
    const expansion = 1 - (1 - Math.min(1, age / 320)) ** 3;
    const radius = 18 + (BALANCE.airBurst.radius - 18) * expansion;
    const opacity = Math.sin(Math.min(1, age / 40) * Math.PI / 2) * (1 - progress) ** 1.05;
    const { brush, centerX, centerY } = this;
    for (let shell = 0; shell < 3; shell++) {
      const shellRadius = radius * (1 - shell * 0.14);
      for (let arc = 0; arc < 6; arc++) {
        const phase = arc * Math.PI * 2 / 6 + shell * 0.7 + progress * (shell % 2 ? -1.6 : 1.6);
        brush.lineStyle(9 - shell * 2, 0x9aafbe, opacity * 0.23).beginPath();
        brush.arc(centerX, centerY, shellRadius, phase, phase + 0.9).strokePath();
        brush.lineStyle(2.8 - shell * 0.55, shell === 0 ? 0xeff5f8 : 0xbacbd7, opacity * 0.95).beginPath();
        brush.arc(centerX, centerY, shellRadius, phase, phase + 0.75).strokePath();
        brush.lineStyle(0.85, 0xf6f9fc, opacity * 0.75).beginPath();
        brush.arc(centerX, centerY, shellRadius - 2, phase + 0.12, phase + 0.48).strokePath();
      }
    }
    for (let gust = 0; gust < 24; gust++) {
      const angle = gust * Math.PI * 2 / 24 + progress * 0.5;
      const distance = radius * (0.65 + gust % 3 * 0.11);
      const length = (22 + gust % 4 * 7) * (1 - progress);
      const pointX = centerX + Math.cos(angle) * distance;
      const pointY = centerY + Math.sin(angle) * distance;
      brush.lineStyle(gust % 3 === 0 ? 2.2 : 1.3, 0xe6eff5, opacity * 0.9).beginPath();
      brush.moveTo(pointX, pointY);
      for (let step = 1; step <= 8; step++) {
        const curl = step / 8;
        const curlAngle = angle + curl * 0.3;
        const curlRadius = distance + curl * length;
        brush.lineTo(centerX + Math.cos(curlAngle) * curlRadius, centerY + Math.sin(curlAngle) * curlRadius);
      }
      brush.strokePath();
    }
    if (radius > 55) {
      for (let fleck = 0; fleck < 20; fleck++) {
        const angle = fleck * Math.PI * 2 / 20 - progress * 0.8;
        const distance = radius * (0.6 + fleck % 4 * 0.1);
        const pointX = centerX + Math.cos(angle) * distance;
        const pointY = centerY + Math.sin(angle) * distance;
        const length = (3 + fleck % 3 * 2) * (1 - progress);
        brush.lineStyle(1.1, 0xf1f6fa, opacity * 0.85);
        brush.lineBetween(pointX, pointY,
          pointX + Math.cos(angle - 0.5) * length, pointY + Math.sin(angle - 0.5) * length);
      }
    }
    if (age < 180) {
      brush.lineStyle(7, 0xdce6ed, (1 - age / 180) * 0.16).strokeCircle(centerX, centerY, radius * 0.88);
    }
  }
}
