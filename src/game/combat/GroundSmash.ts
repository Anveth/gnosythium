import type Phaser from 'phaser';
import { GroundSmashEffect } from '../art/GroundSmashEffect';
import type { SoundEffects } from '../audio/SoundEffects';
import { BALANCE } from '../config';
import { PlatformNavigation } from '../enemies/PlatformNavigation';
import type { Sentinel } from '../enemies/Sentinel';
import type { ActionFrame } from '../input/actions';
import type { Player } from '../player/Player';
import { ARENA, type PlatformSpec } from '../world/arenaData';
import type { SealPuzzle } from '../world/SealPuzzle';

export class GroundSmash {
  private readonly effect: GroundSmashEffect;
  private readonly sight = new PlatformNavigation();
  private startedAt = -Infinity;
  private recoveryUntil = 0;
  private previousBottom = 0;
  private damageVersion = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemies: readonly Sentinel[],
    private readonly puzzle: SealPuzzle,
    private readonly sounds: SoundEffects,
  ) {
    this.effect = new GroundSmashEffect(scene);
  }

  update(frame: ActionFrame, now: number, available: boolean): void {
    const { player } = this;
    if (this.busy(now) && (player.isHurt(now) || !player.vulnerable
      || player.damageVersion !== this.damageVersion || player.body.bottom > ARENA.deathY
      || now - this.startedAt >= BALANCE.groundSmash.maximumDiveMs)) {
      this.cancel();
    }
    if (player.groundSmashing) {
      const surface = this.crossedSurface();
      if (surface) this.land(surface, now);
      else {
        player.setVelocity(0, BALANCE.groundSmash.fallSpeed);
        this.previousBottom = player.body.bottom;
      }
    } else if (frame.groundSmashPressed && available && player.vulnerable
      && player.body.bottom < ARENA.deathY && now >= this.recoveryUntil
      && !frame.shieldHeld && !frame.healPressed && !player.body.blocked.down && !player.body.touching.down
      && now >= player.groundSmashReadyAt && player.spendEssence(BALANCE.groundSmash.cost, now)) {
      this.startedAt = now;
      this.damageVersion = player.damageVersion;
      this.previousBottom = player.body.bottom;
      player.groundSmashReadyAt = now + BALANCE.groundSmash.cooldownMs;
      player.beginGroundSmash();
      player.presentation.play('groundSmash', now);
      this.sounds.playGroundSmash(false);
    }
    this.effect.update(now, player.body.center.x, player.body.bottom, player.groundSmashing);
  }

  busy(now: number): boolean {
    return this.player.groundSmashing || now < this.recoveryUntil;
  }

  cancel(): void {
    this.player.endGroundSmash();
    this.player.presentation.cancel('groundSmash');
    this.player.presentation.cancel('groundSmashImpact');
    this.recoveryUntil = 0;
  }

  reset(): void {
    this.cancel();
    this.startedAt = -Infinity;
    this.effect.clear();
  }

  private crossedSurface(): PlatformSpec | undefined {
    const { body } = this.player;
    return ARENA.platforms.filter(surface => body.right > surface.x && body.left < surface.x + surface.width
      && this.previousBottom <= surface.y + 0.5 && body.bottom >= surface.y - 0.5)
      .sort((first, second) => first.y - second.y)[0];
  }

  private land(surface: PlatformSpec, now: number): void {
    const { player } = this;
    const { body } = player;
    body.position.y = surface.y - body.height;
    body.updateCenter();
    body.blocked.none = false;
    body.blocked.down = true;
    body.touching.none = false;
    body.touching.down = true;
    player.endGroundSmash();
    player.setVelocity(0, 0);
    player.presentation.play('groundSmashImpact', now);
    this.recoveryUntil = now + BALANCE.groundSmash.recoveryMs;
    const centerX = Math.max(surface.x, Math.min(surface.x + surface.width, body.center.x));
    this.effect.impact(centerX, surface, now);
    this.sounds.playGroundSmash(true);
    this.scene.cameras.main.shake(90, 0.0012);
    for (const enemy of this.enemies) {
      if (!enemy.active || Math.abs(enemy.body.bottom - surface.y) > BALANCE.groundSmash.heightTolerance) continue;
      const distance = Math.max(0, enemy.body.left - centerX, centerX - enemy.body.right);
      if (distance > BALANCE.groundSmash.radius || !this.sight.canShoot(centerX, surface.y - 8,
        enemy.body.center.x, enemy.body.center.y, this.puzzle.activated)) continue;
      const bonus = distance <= BALANCE.groundSmash.centerRadius ? BALANCE.groundSmash.centerBonus : 0;
      enemy.takeDamage(BALANCE.groundSmash.damage + bonus, centerX, now);
    }
  }
}
