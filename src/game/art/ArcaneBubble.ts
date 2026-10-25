import type Phaser from 'phaser';
import { WARD_PULSE_MS } from './spellPresentation';

const STAFF_RELEASE_MS = 160;

export class ArcaneBubble {
  private readonly rear: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;
  private startedAt = -Infinity;
  private wasActive = false;

  constructor(scene: Phaser.Scene) {
    this.rear = scene.add.graphics().setDepth(9);
    this.front = scene.add.graphics().setDepth(12);
  }

  setPosition(worldX: number, feetY: number): void {
    this.rear.setPosition(worldX, feetY - 48);
    this.front.setPosition(worldX, feetY - 48);
  }

  refresh(now: number, active: boolean, hitAge: number, hitAngle: number, orbX: number, orbY: number): void {
    this.rear.clear();
    this.front.clear();
    if (active && !this.wasActive) this.startedAt = now;
    this.wasActive = active;
    if (!active) return;
    const age = now - this.startedAt;
    const radiusX = 60;
    const radiusY = 64;
    const breath = 0.92 + Math.sin(age / 410) * 0.08;
    const opacity = breath;
    this.rear.fillStyle(0x35194e, opacity * 0.11).fillEllipse(0, 0, radiusX * 2, radiusY * 2);
    this.rear.lineStyle(10, 0x62328a, opacity * 0.1).strokeEllipse(0, 0, radiusX * 2, radiusY * 2);
    this.front.lineStyle(1.7, 0x7948a9, opacity * 0.85).strokeEllipse(0, 0, radiusX * 2, radiusY * 2);
    if (age < WARD_PULSE_MS) {
      this.pulse(age, radiusX, radiusY);
    }
    if (age < STAFF_RELEASE_MS) {
      this.staffRelease(age, orbX, orbY + 48, radiusX, radiusY);
    }
    const phase = age / 1000 * 0.65;
    for (let band = 0; band < 3; band++) {
      const angle = phase + band * Math.PI * 2 / 3;
      this.arc(radiusX - 2, radiusY - 2, angle, 0.7, 0xb0a0c5, opacity * 0.38, 0.9);
      this.arc(radiusX - 6, radiusY - 6, -angle + 1.2, 0.4, 0x8d66b2, opacity * 0.3, 1.1);
    }
    this.front.lineStyle(0.8, 0x8754af, opacity * 0.2)
      .strokeEllipse(0, Math.sin(phase) * 7, radiusX * 1.9, 17 + Math.cos(phase) * 6);
    for (let mote = 0; mote < 5; mote++) {
      const angle = -phase * 1.7 + mote * Math.PI * 2 / 5;
      const pointX = Math.cos(angle) * (radiusX - 3);
      const pointY = Math.sin(angle) * (radiusY - 3);
      this.front.fillStyle(0xb2a1c6, opacity * 0.5).fillCircle(pointX, pointY, 1);
    }
    if (hitAge >= 0 && hitAge < 220) {
      const progress = hitAge / 220;
      const ripple = Math.sin(Math.min(1, progress * 4) * Math.PI / 2) * (1 - progress);
      this.arc(radiusX, radiusY, hitAngle - 0.25 - progress * 0.55,
        0.5 + progress * 1.1, 0xc1afcf, ripple * 0.85, 2.8 - progress * 1.6);
      this.arc(radiusX - 6 - progress * 5, radiusY - 6 - progress * 5,
        hitAngle - 0.4 - progress * 0.4, 0.8 + progress * 0.8, 0x9b6fbe, ripple * 0.6, 1.4);
    }
  }

  clear(): void {
    this.wasActive = false;
    this.startedAt = -Infinity;
    this.rear.clear();
    this.front.clear();
  }

  private pulse(age: number, radiusX: number, radiusY: number): void {
    const progress = age / WARD_PULSE_MS;
    const opacity = (1 - progress) ** 1.3;
    this.front.lineStyle(6, 0x724099, opacity * 0.2).strokeEllipse(0, 0, radiusX * 2, radiusY * 2);
    for (let band = 0; band < 4; band++) {
      const start = progress * Math.PI * 0.8 + band * Math.PI / 2;
      this.arc(radiusX, radiusY, start, 0.9, 0xab80c5, opacity * 0.85, 2.6);
    }
  }

  private staffRelease(age: number, orbX: number, orbY: number, radiusX: number, radiusY: number): void {
    const progress = age / STAFF_RELEASE_MS;
    const opacity = (1 - progress) ** 1.15;
    const head = Math.min(1, 0.15 + progress * 1.7);
    const tail = Math.max(0, head - 0.45);
    const originAngle = Math.atan2(orbY / radiusY, orbX / radiusX);
    this.front.fillStyle(0x70379d, opacity * 0.18).fillCircle(orbX, orbY, 13 + progress * 5);
    this.front.fillStyle(0xa77ac9, opacity * 0.75).fillCircle(orbX, orbY, 5 - progress * 2);
    this.front.fillStyle(0xd0b9de, opacity * 0.8).fillCircle(orbX, orbY, 1.7);
    for (let stream = 0; stream < 3; stream++) {
      const angle = originAngle - 1.3 + stream * 1.5;
      const targetX = Math.cos(angle) * radiusX;
      const targetY = Math.sin(angle) * radiusY;
      const deltaX = targetX - orbX;
      const deltaY = targetY - orbY;
      const length = Math.max(1, Math.hypot(deltaX, deltaY));
      const bend = stream % 2 ? -16 : 13;
      const controlX = (orbX + targetX) / 2 - deltaY / length * bend;
      const controlY = (orbY + targetY) / 2 + deltaX / length * bend;
      for (const glow of [true, false]) {
        this.front.lineStyle(glow ? 5 : 1.4, glow ? 0x78429f : 0xb390cd, opacity * (glow ? 0.2 : 0.9));
        this.front.beginPath();
        for (let step = 0; step <= 16; step++) {
          const position = tail + (head - tail) * step / 16;
          const remaining = 1 - position;
          const pointX = remaining ** 2 * orbX + 2 * remaining * position * controlX + position ** 2 * targetX;
          const pointY = remaining ** 2 * orbY + 2 * remaining * position * controlY + position ** 2 * targetY;
          if (step === 0) this.front.moveTo(pointX, pointY);
          else this.front.lineTo(pointX, pointY);
        }
        this.front.strokePath();
      }
      if (head === 1) {
        this.arc(radiusX, radiusY, angle - 0.22 - progress * 0.2,
          0.44 + progress * 0.4, 0xac86c7, opacity * 0.8, 2);
      }
    }
    for (let spark = 0; spark < 5; spark++) {
      const angle = spark * Math.PI * 2 / 5 + progress;
      const distance = 5 + progress * 20;
      const pointX = orbX + Math.cos(angle) * distance;
      const pointY = orbY + Math.sin(angle) * distance;
      this.front.lineStyle(1.2, 0xa77ac9, opacity * 0.8);
      this.front.lineBetween(pointX, pointY,
        pointX - Math.cos(angle) * 4, pointY - Math.sin(angle) * 4);
    }
  }

  private arc(
    radiusX: number, radiusY: number, phase: number, length: number,
    color: number, opacity: number, width: number,
  ): void {
    this.front.lineStyle(width, color, opacity).beginPath();
    for (let step = 0; step <= 28; step++) {
      const angle = phase + step / 28 * length;
      const pointX = Math.cos(angle) * radiusX;
      const pointY = Math.sin(angle) * radiusY;
      if (step === 0) this.front.moveTo(pointX, pointY);
      else this.front.lineTo(pointX, pointY);
    }
    this.front.strokePath();
  }
}
