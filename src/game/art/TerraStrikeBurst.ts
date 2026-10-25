import type Phaser from 'phaser';
import { BALANCE } from '../config';
import type { PlatformSpec } from '../world/arenaData';

export class TerraStrikeBurst {
  private readonly rear: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;
  private impactedAt = -Infinity;
  private centerX = 0;
  private groundY = 0;
  private left = 0;
  private right = 0;

  constructor(scene: Phaser.Scene) {
    this.rear = scene.add.graphics().setDepth(9);
    this.front = scene.add.graphics().setDepth(14);
  }

  impact(worldX: number, surface: PlatformSpec, now: number): void {
    this.centerX = worldX;
    this.groundY = surface.y;
    this.left = Math.max(surface.x, worldX - BALANCE.groundSmash.radius);
    this.right = Math.min(surface.x + surface.width, worldX + BALANCE.groundSmash.radius);
    this.impactedAt = now;
  }

  update(now: number, playerX: number, feetY: number, diving: boolean): void {
    this.rear.clear();
    this.front.clear();
    if (diving) this.descent(now, playerX, feetY);
    const age = now - this.impactedAt;
    if (age < 0 || age >= 1000) return;
    this.shockwave(age);
    this.plates(age);
    this.debris(age);
    this.dust(age);
  }

  clear(): void {
    this.impactedAt = -Infinity;
    this.rear.clear();
    this.front.clear();
  }

  private descent(now: number, centerX: number, feetY: number): void {
    for (let band = 0; band < 3; band++) {
      const progress = (now / 180 + band / 3) % 1;
      const spread = 24 + (1 - progress) * 12;
      const pointY = feetY - 112 + progress * 105;
      this.rear.lineStyle(7, 0x638631, progress * 0.12);
      this.rear.lineBetween(centerX - spread, pointY - 13, centerX, pointY);
      this.rear.lineBetween(centerX + spread, pointY - 13, centerX, pointY);
      this.rear.lineStyle(1.7, 0xc0cf82, progress * 0.8);
      this.rear.lineBetween(centerX - spread, pointY - 13, centerX, pointY);
      this.rear.lineBetween(centerX + spread, pointY - 13, centerX, pointY);
    }
  }

  private shockwave(age: number): void {
    const expansion = 1 - (1 - Math.min(1, age / 260)) ** 3;
    for (let ring = 0; ring < 2; ring++) {
      const opacity = Math.max(0, 1 - age / (350 + ring * 90));
      const radius = (18 + expansion * (BALANCE.groundSmash.radius - 18)) * (1 - ring * 0.22);
      for (const glow of [true, false]) {
        this.front.lineStyle(glow ? 8 : 2.3, glow ? 0x6b8d35 : 0xb7c77b, opacity * (glow ? 0.15 : 0.8));
        this.front.beginPath();
        for (let step = 0; step <= 48; step++) {
          const angle = step / 48 * Math.PI * 2;
          const pointX = Math.max(this.left, Math.min(this.right, this.centerX + Math.cos(angle) * radius));
          const pointY = this.groundY - 2 + Math.sin(angle) * radius * 0.13;
          if (step === 0) this.front.moveTo(pointX, pointY);
          else this.front.lineTo(pointX, pointY);
        }
        this.front.strokePath();
      }
    }
    if (age < 170) {
      const opacity = (1 - age / 170) ** 2;
      const width = Math.min(58, (this.centerX - this.left) * 2, (this.right - this.centerX) * 2);
      this.rear.fillStyle(0x8eab4d, opacity * 0.24).fillEllipse(this.centerX, this.groundY - 13, width, 58);
      this.front.lineStyle(4, 0xc8d78e, opacity * 0.9);
      this.front.lineBetween(this.centerX, this.groundY - 1, this.centerX, this.groundY - 40 * opacity);
      this.front.lineStyle(1.2, 0xebe5bb, opacity);
      this.front.lineBetween(this.centerX, this.groundY - 1, this.centerX, this.groundY - 29 * opacity);
    }
  }

  private plates(age: number): void {
    for (let plate = 0; plate < 12; plate++) {
      const side = plate % 2 ? 1 : -1;
      const band = Math.floor(plate / 2);
      const elapsed = age - band * 25;
      if (elapsed < 0 || elapsed > 570) continue;
      const pointX = this.centerX + side * (15 + band * 18);
      const width = 8 + band % 3 * 2;
      if (pointX - width < this.left || pointX + width > this.right) continue;
      const rise = Math.sin(Math.min(1, elapsed / 520) * Math.PI) ** 0.6;
      const height = (40 - band * 3) * rise;
      const opacity = Math.min(1, (570 - elapsed) / 160);
      const tipX = pointX + side * width * 0.4;
      const tipY = this.groundY - height;
      this.rear.fillStyle(plate % 3 ? 0x665f43 : 0x7b7950, opacity).beginPath();
      this.rear.moveTo(pointX - width, this.groundY + 1);
      this.rear.lineTo(pointX - width * 0.7, this.groundY - height * 0.6);
      this.rear.lineTo(tipX, tipY);
      this.rear.lineTo(pointX + width * 0.7, this.groundY - height * 0.65);
      this.rear.lineTo(pointX + width, this.groundY + 1);
      this.rear.closePath().fillPath();
      this.rear.lineStyle(2, 0x36412b, opacity).lineBetween(pointX, this.groundY, tipX, tipY);
      this.rear.lineStyle(1.2, 0xb4bc75, opacity * 0.9);
      this.rear.lineBetween(pointX + width * 0.7, this.groundY - height * 0.65, tipX, tipY);
    }
  }

  private debris(age: number): void {
    const seconds = age / 1000;
    for (let stone = 0; stone < 12; stone++) {
      const side = stone % 2 ? 1 : -1;
      const velocityX = side * (100 + stone % 6 * 23);
      const velocityY = -190 - stone % 4 * 36;
      const pointX = this.centerX + velocityX * seconds;
      const pointY = this.groundY - 3 + velocityY * seconds + 550 * seconds ** 2;
      const radius = 4 + stone % 3 * 1.6;
      const opacity = Math.max(0, 1 - age / 650);
      if (pointY > this.groundY + 3 || pointX - radius < this.left || pointX + radius > this.right || opacity <= 0) continue;
      const angle = stone * 1.6 + seconds * side * 8;
      this.front.fillStyle(stone % 2 ? 0x817454 : 0x5d6240, opacity).beginPath();
      for (let corner = 0; corner < 5; corner++) {
        const phase = angle + corner * Math.PI * 2 / 5;
        const extent = radius * (corner % 2 ? 0.65 : 1);
        const cornerX = pointX + Math.cos(phase) * extent;
        const cornerY = pointY + Math.sin(phase) * extent;
        if (corner === 0) this.front.moveTo(cornerX, cornerY);
        else this.front.lineTo(cornerX, cornerY);
      }
      this.front.closePath().fillPath();
      this.front.lineStyle(1.2, 0xc0c28c, opacity * 0.9);
      this.front.lineBetween(pointX - radius * 0.5, pointY, pointX + radius * 0.4, pointY - radius * 0.7);
    }
  }

  private dust(age: number): void {
    for (let puff = 0; puff < 12; puff++) {
      const elapsed = age - puff % 4 * 20;
      const progress = elapsed / 700;
      if (progress < 0 || progress >= 1) continue;
      const side = puff % 2 ? 1 : -1;
      const distance = (12 + puff % 6 * 11) + progress * 45;
      const pointX = this.centerX + side * distance;
      const radius = 7 + progress * (9 + puff % 3 * 3);
      const width = Math.min(radius, pointX - this.left, this.right - pointX);
      if (width <= 0) continue;
      const pointY = this.groundY - 5 - Math.sin(progress * Math.PI) * (9 + puff % 3 * 5);
      const opacity = Math.sin(progress * Math.PI) * (1 - progress) * 0.32;
      this.rear.fillStyle(puff % 3 ? 0x8b805d : 0x809151, opacity);
      this.rear.fillEllipse(pointX, pointY, width * 2, radius * 1.1);
    }
  }
}
