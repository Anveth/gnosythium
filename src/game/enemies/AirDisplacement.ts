import type Phaser from 'phaser';
import { BALANCE } from '../config';

export class AirDisplacement {
  private startedAt = -Infinity;
  private controlUntil = 0;
  private impulseUntil = 0;
  private expiresAt = 0;
  private incomingX = 0;
  private incomingY = 0;
  private impactSpent = true;
  private forcing = false;
  active = false;

  constructor(private readonly body: Phaser.Physics.Arcade.Body) {}

  launch(velocityX: number, velocityY: number, now: number): void {
    this.active = true;
    this.startedAt = now;
    this.controlUntil = now + BALANCE.airBurst.displacementMs;
    this.impulseUntil = this.controlUntil;
    this.expiresAt = now + BALANCE.airBurst.airborneMs;
    this.impactSpent = false;
    this.incomingX = velocityX;
    this.incomingY = velocityY;
    this.forcing = true;
    const duration = BALANCE.airBurst.displacementMs / 1000;
    this.body.setAllowGravity(false).setMaxVelocity(950, 950)
      .setDrag(Math.abs(velocityX) / duration, Math.abs(velocityY) / duration).setVelocity(velocityX, velocityY);
  }

  update(now: number): 'moving' | 'impact' | undefined {
    if (!this.active) return undefined;
    const { body } = this;
    const threshold = BALANCE.airBurst.impactSpeed;
    const collision = (body.blocked.left && this.incomingX < -threshold)
      || (body.blocked.right && this.incomingX > threshold)
      || (body.blocked.up && this.incomingY < -threshold)
      || ((body.blocked.down || body.touching.down) && this.incomingY > threshold);
    if (!this.impactSpent && now > this.startedAt && collision) {
      this.impactSpent = true;
      this.controlUntil = Math.max(this.controlUntil, now + 180);
      this.finishImpulse();
      body.setVelocityX(0);
      this.captureVelocity();
      return 'impact';
    }
    if (this.forcing && now >= this.impulseUntil) this.finishImpulse();
    const grounded = (body.blocked.down || body.touching.down) && body.velocity.y >= 0;
    if (now >= this.expiresAt || (now >= this.controlUntil && grounded)) {
      this.reset();
      return undefined;
    }
    this.captureVelocity();
    return 'moving';
  }

  reset(): void {
    this.active = false;
    this.impactSpent = true;
    this.finishImpulse();
    this.body.setMaxVelocity(600, 950);
  }

  private finishImpulse(): void {
    this.forcing = false;
    this.body.setAllowGravity(true).setDrag(0, 0);
  }

  private captureVelocity(): void {
    this.incomingX = this.body.velocity.x;
    this.incomingY = this.body.velocity.y;
  }
}
