import type Phaser from 'phaser';
import { AirBurstEffect } from '../art/AirBurstEffect';
import type { SoundEffects } from '../audio/SoundEffects';
import { BALANCE } from '../config';
import { PlatformNavigation } from '../enemies/PlatformNavigation';
import type { Sentinel } from '../enemies/Sentinel';
import type { ActionFrame } from '../input/actions';
import type { Player } from '../player/Player';
import type { SealPuzzle } from '../world/SealPuzzle';

export class AirBurst {
  private readonly effect: AirBurstEffect;
  private readonly sight = new PlatformNavigation();
  private releaseAt = 0;
  private activeUntil = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemies: readonly Sentinel[],
    private readonly puzzle: SealPuzzle,
    private readonly sounds: SoundEffects,
  ) {
    this.effect = new AirBurstEffect(scene);
  }

  update(frame: ActionFrame, now: number, available: boolean): void {
    const { player } = this;
    if (player.isHurt(now) || !player.vulnerable) {
      this.releaseAt = 0;
      this.activeUntil = 0;
      player.presentation.cancel('airBurst');
    }
    if (frame.airBurstPressed && available && !frame.shieldHeld && !frame.healPressed
      && now >= this.activeUntil && now >= player.airBurstReadyAt
      && player.spendEssence(BALANCE.airBurst.cost, now)) {
      player.airBurstReadyAt = now + BALANCE.airBurst.cooldownMs;
      this.releaseAt = now + BALANCE.airBurst.windupMs;
      this.activeUntil = now + BALANCE.airBurst.animationMs;
      player.presentation.play('airBurst', now);
    }
    if (this.releaseAt > 0 && now >= this.releaseAt) {
      this.releaseAt = 0;
      this.release(now);
    }
    this.effect.update(now);
  }

  busy(now: number): boolean {
    return now < this.activeUntil;
  }

  impact(enemy: Sentinel, now: number): void {
    this.effect.impact(enemy.body.center.x, enemy.body.center.y, now);
    this.sounds.play('impact', 0.7);
  }

  reset(): void {
    this.releaseAt = 0;
    this.activeUntil = 0;
    this.effect.clear();
    this.player.presentation.cancel('airBurst');
  }

  private release(now: number): void {
    const origin = this.player.body.center;
    this.effect.release(origin.x, origin.y, now);
    this.sounds.playAirBurst();
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const offsetX = enemy.body.center.x - origin.x;
      const offsetY = enemy.body.center.y - origin.y;
      const distance = Math.hypot(offsetX, offsetY);
      if (distance > BALANCE.airBurst.radius || !this.sight.canShoot(origin.x, origin.y,
        enemy.body.center.x, enemy.body.center.y, this.puzzle.activated)) continue;
      const directionX = distance > 0.01 ? offsetX / distance : this.player.facing;
      const directionY = distance > 0.01 ? offsetY / distance : 0;
      const airborne = !(enemy.body.blocked.down || enemy.body.touching.down) || enemy.body.velocity.y < 0;
      const force = BALANCE.airBurst.impulse * (airborne ? BALANCE.airBurst.airborneMultiplier : 1);
      enemy.pushByAir(directionX * force, directionY * force, now);
    }
  }
}
