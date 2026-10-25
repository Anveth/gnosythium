import type Phaser from 'phaser';

export class HealingAura {
  private readonly rear: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.rear = scene.add.graphics().setDepth(9);
    this.front = scene.add.graphics().setDepth(11);
  }

  setPosition(worldX: number, worldY: number): void {
    this.rear.setPosition(worldX, worldY);
    this.front.setPosition(worldX, worldY);
  }

  refresh(age: number, active: boolean, channelMs: number): void {
    this.clear();
    if (!active || age < 0 || !Number.isFinite(age)) return;
    const opacity = Math.max(0, Math.min(1, age / 160, (channelMs + 200 - age) / 200));
    if (opacity === 0) return;
    const phase = age / 1000 * 3.6;
    const breath = 0.9 + Math.sin(age / 155) * 0.1;
    const completion = Math.max(0, Math.min(1, (age - channelMs) / 200));
    this.rear.fillStyle(0x5b9eea, opacity * breath * 0.07).fillEllipse(0, -42, 78, 94);
    this.rear.fillStyle(0x407ed1, opacity * 0.12).fillEllipse(0, -3, 89, 19);
    this.rear.fillStyle(0xd6eaff, opacity * 0.08).fillEllipse(0, -2, 64, 11);
    this.ring(-3, 39 + completion * 12, 8 + completion * 3, phase, 0xffd277, opacity * 0.9);
    this.ring(-2, 31 + completion * 10, 6, -phase * 0.8, 0xbce1ff, opacity * 0.7);
    this.ring(-100 - Math.sin(phase) * 3, 23, 5, phase * 0.7, 0xffdf9a, opacity * 0.55);
    this.spiral(phase, opacity * breath, 0xffd277);
    this.spiral(phase + Math.PI, opacity * 0.65, 0xa2d2ff);
    for (let index = 0; index < 10; index++) {
      const progress = (age / 1150 + index / 10) % 1;
      const direction = index % 2 === 0 ? -1 : 1;
      const sparkX = direction * (30 + Math.sin(phase * 0.7 + index * 1.7) * 13);
      const sparkY = -7 - progress * 110;
      const alpha = Math.sin(progress * Math.PI) * opacity;
      const size = (index % 3 === 0 ? 3.3 : 2) * (0.8 + Math.sin(phase + index) * 0.2);
      this.spark(sparkX, sparkY, size, index % 3 === 0 ? 0xffd277 : 0xc3e5ff, alpha);
    }
  }

  clear(): void {
    this.rear.clear();
    this.front.clear();
  }

  private ring(
    centerY: number, radiusX: number, radiusY: number, phase: number, color: number, opacity: number,
  ): void {
    for (const brush of [this.rear, this.front]) {
      const start = brush === this.rear ? Math.PI : 0;
      brush.lineStyle(4, color, opacity * 0.08).beginPath();
      for (let step = 0; step <= 24; step++) {
        const angle = start + step / 24 * Math.PI;
        const pointX = Math.cos(angle) * radiusX;
        const pointY = centerY + Math.sin(angle) * radiusY;
        if (step === 0) brush.moveTo(pointX, pointY);
        else brush.lineTo(pointX, pointY);
      }
      brush.strokePath();
      brush.lineStyle(0.9, color, opacity).strokePath();
    }
    for (let index = 0; index < 6; index++) {
      const angle = phase + index * Math.PI / 3;
      const brush = Math.sin(angle) < 0 ? this.rear : this.front;
      const pointX = Math.cos(angle) * radiusX;
      const pointY = centerY + Math.sin(angle) * radiusY;
      brush.lineStyle(0.8, 0xfff1d1, opacity * 0.8);
      brush.lineBetween(pointX, pointY - 1.8, pointX, pointY + 1.8);
    }
  }

  private spiral(phase: number, opacity: number, color: number): void {
    for (let step = 0; step < 84; step++) {
      const progress = step / 84;
      const nextProgress = (step + 1) / 84;
      const angle = phase + progress * Math.PI * 4;
      const nextAngle = phase + nextProgress * Math.PI * 4;
      const radius = 38 - Math.sin(progress * Math.PI) * 5;
      const pointX = Math.cos(angle) * radius;
      const pointY = -4 - progress * 100 + Math.sin(angle) * 5;
      const nextX = Math.cos(nextAngle) * radius;
      const nextY = -4 - nextProgress * 100 + Math.sin(nextAngle) * 5;
      const brush = Math.sin(angle) < 0 ? this.rear : this.front;
      const alpha = Math.sin(progress * Math.PI) * opacity;
      brush.lineStyle(4.5, color, alpha * 0.08).lineBetween(pointX, pointY, nextX, nextY);
      brush.lineStyle(0.85, color, alpha * 0.65).lineBetween(pointX, pointY, nextX, nextY);
    }
  }

  private spark(pointX: number, pointY: number, size: number, color: number, opacity: number): void {
    this.front.fillStyle(color, opacity * 0.12).fillCircle(pointX, pointY, size * 2);
    this.front.fillStyle(color, opacity * 0.9).beginPath();
    this.front.moveTo(pointX, pointY - size * 1.5);
    this.front.lineTo(pointX + size * 0.65, pointY);
    this.front.lineTo(pointX, pointY + size * 1.5);
    this.front.lineTo(pointX - size * 0.65, pointY);
    this.front.closePath().fillPath();
    this.front.fillStyle(0xfffcf1, opacity).fillCircle(pointX, pointY, size * 0.35);
  }
}
