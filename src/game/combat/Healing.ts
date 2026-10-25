import { BALANCE } from '../config';
import type { SoundEffects } from '../audio/SoundEffects';
import type { ActionFrame } from '../input/actions';
import type { Player } from '../player/Player';

export class Healing {
  private damageVersion = 0;

  constructor(
    private readonly player: Player,
    private readonly sounds: SoundEffects,
  ) {}

  update(frame: ActionFrame, now: number, available: boolean): void {
    const { player } = this;
    const interrupted = frame.move !== 0 || frame.jumpPressed || frame.castHeld || frame.shieldHeld || frame.airBurstPressed
      || frame.groundSmashPressed || !player.grounded || player.damageVersion !== this.damageVersion;
    if (!player.healing && (frame.move !== 0 || frame.jumpPressed || frame.castHeld
      || frame.shieldHeld || frame.airBurstPressed || frame.groundSmashPressed)) {
      player.presentation.cancel('heal');
    }
    if (player.healing) {
      if (interrupted || player.health <= 0) {
        this.cancel();
      } else if (now >= player.healEndsAt) {
        player.health = Math.min(BALANCE.player.maxHealth, player.health + BALANCE.healing.health);
        player.healing = false;
      }
      return;
    }
    if (!frame.healPressed) return;
    if (!available || player.isHurt(now) || frame.move !== 0 || frame.jumpPressed || frame.castHeld
      || frame.shieldHeld || frame.airBurstPressed || frame.groundSmashPressed || !player.grounded) {
      return;
    }
    if (now < player.healReadyAt) {
      return;
    }
    if (player.health >= BALANCE.player.maxHealth) {
      return;
    }
    if (!player.spendEssence(BALANCE.healing.cost, now)) {
      return;
    }
    player.healing = true;
    player.healEndsAt = now + BALANCE.healing.channelMs;
    player.healReadyAt = now + BALANCE.healing.cooldownMs;
    this.damageVersion = player.damageVersion;
    player.setVelocityX(0);
    player.presentation.play('heal', now);
    this.sounds.play('heal');
  }

  cancel(): void {
    this.sounds.stop('heal');
    this.player.healing = false;
    this.player.healEndsAt = 0;
    this.player.presentation.cancel('heal');
  }
}
