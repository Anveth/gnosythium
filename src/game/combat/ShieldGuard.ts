import { BALANCE } from '../config';
import type { SoundEffects } from '../audio/SoundEffects';
import type { Player } from '../player/Player';

export class ShieldGuard {
  private brokenUntil = 0;
  private needsRelease = false;
  private holdUntil = 0;
  private nextRaiseAt = 0;

  constructor(private readonly player: Player, private readonly sounds: SoundEffects) {}

  update(held: boolean, available: boolean, now: number, seconds: number): void {
    if (!held) this.needsRelease = false;
    const { player } = this;
    const drain = BALANCE.shield.drainPerSecond * seconds;
    if (player.shielding && (!available || (!held && now >= this.holdUntil))) this.lower(now);
    if (!player.shielding && held && available && !this.needsRelease
      && now >= this.brokenUntil && now >= this.nextRaiseAt
      && player.essence >= BALANCE.shield.hitCost + drain) {
      player.shielding = true;
      this.holdUntil = now + BALANCE.shield.minimumHoldMs;
      this.nextRaiseAt = now + BALANCE.shield.raiseIntervalMs;
    }
    if (player.shielding && !player.spendEssence(drain, now)) this.break(now);
    this.sounds.setShield(player.shielding);
  }

  lower(now: number): void {
    this.player.shielding = false;
    this.holdUntil = 0;
    this.nextRaiseAt = Math.max(this.nextRaiseAt, now + BALANCE.shield.minimumRestMs);
    this.sounds.setShield(false);
  }

  break(now: number): void {
    this.lower(now);
    this.brokenUntil = now + BALANCE.shield.breakCooldownMs;
    this.needsRelease = true;
  }

  reset(): void {
    this.player.shielding = false;
    this.brokenUntil = 0;
    this.needsRelease = false;
    this.holdUntil = 0;
    this.nextRaiseAt = 0;
    this.sounds.setShield(false);
  }
}
