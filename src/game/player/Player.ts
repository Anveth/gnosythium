import Phaser from 'phaser';
import { ART_SCALE, BALANCE, MAGE_ART } from '../config';
import type { SoundEffects } from '../audio/SoundEffects';
import type { ActionFrame } from '../input/actions';
import type { SpawnPoint } from '../state/CheckpointState';
import { PlayerVisual } from './PlayerVisual';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  health: number = BALANCE.player.maxHealth;
  essence: number = BALANCE.player.maxEssence;
  facing = 1;
  shielding = false;
  healing = false;
  healEndsAt = 0;
  healReadyAt = 0;
  airBurstReadyAt = 0;
  groundSmashReadyAt = 0;
  groundSmashing = false;
  damageVersion = 0;
  readonly presentation: PlayerVisual;
  private wasGrounded = false;
  private lastGroundedAt = -Infinity;
  private jumpQueuedAt = -Infinity;
  private invulnerableUntil = 0;
  private hurtUntil = 0;
  private essenceSpentAt = -Infinity;
  private jumped = false;
  private airJumpUsed = false;
  private nextAirJumpAt = 0;
  private jumpStartedAt = -Infinity;

  constructor(scene: Phaser.Scene, spawn: SpawnPoint, private readonly sounds: SoundEffects) {
    super(scene, spawn.x, spawn.y, 'mage');
    this.setOrigin(0.5, 1).setDisplaySize(MAGE_ART.width, MAGE_ART.height).setDepth(10);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(28 * ART_SCALE, 58 * ART_SCALE).setOffset(18 * ART_SCALE, 20 * ART_SCALE);
    this.body.setMaxVelocity(600, 950);
    this.body.setCollideWorldBounds(true);
    this.setVisible(false);
    this.body.updateFromGameObject();
    this.presentation = new PlayerVisual(scene, this);
  }

  move(frame: ActionFrame, now: number): void {
    const horizontalAim = frame.aimX - this.body.center.x;
    const aiming = frame.castHeld;
    if (frame.move !== 0 && !aiming) this.facing = Math.sign(frame.move);
    else if (frame.aimVisible && Math.abs(horizontalAim) > 12) this.facing = Math.sign(horizontalAim);
    this.setFlipX(this.facing < 0);
    this.presentation.refresh(now);
    if (now >= this.hurtUntil && !this.groundSmashing) {
      this.setVelocityX(frame.move * (this.shielding ? BALANCE.player.shieldSpeed : BALANCE.player.speed));
    }
    const grounded = this.grounded;
    if (grounded) {
      if (!this.wasGrounded) this.presentation.play('land', now);
      this.lastGroundedAt = now;
      this.jumped = false;
      this.airJumpUsed = false;
    }
    if (frame.jumpPressed && !this.groundSmashing) this.jumpQueuedAt = now;
    if (!this.groundSmashing && !this.jumped && now - this.lastGroundedAt <= BALANCE.player.coyoteMs
      && now - this.jumpQueuedAt <= BALANCE.player.jumpBufferMs) {
      this.setVelocityY(-BALANCE.player.jumpSpeed);
      this.jumped = true;
      this.jumpStartedAt = now;
      this.jumpQueuedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
      this.presentation.play('jump', now);
      this.sounds.play('jump');
    } else if (!this.groundSmashing && frame.jumpPressed && !grounded
      && !this.airJumpUsed && this.airJumpCooldownMs(now) === 0) {
      this.setVelocityY(-BALANCE.player.airJumpSpeed);
      this.airJumpUsed = true;
      this.jumped = true;
      this.nextAirJumpAt = now + BALANCE.player.airJumpCooldownMs;
      this.jumpStartedAt = now;
      this.jumpQueuedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
      this.presentation.play('doubleJump', now);
      this.sounds.play('jump');
    }
    if (!frame.jumpHeld && now - this.jumpStartedAt >= BALANCE.player.minimumJumpMs
      && this.body.velocity.y < -BALANCE.player.jumpReleaseSpeed) {
      this.setVelocityY(-BALANCE.player.jumpReleaseSpeed);
    }
    this.setAlpha(now < this.invulnerableUntil && Math.floor(now / 75) % 2 === 0 ? 0.42 : 1);
    this.wasGrounded = grounded;
  }

  airJumpCooldownMs(now: number): number {
    return Math.max(0, this.nextAirJumpAt - now);
  }

  beginGroundSmash(): void {
    this.groundSmashing = true;
    this.jumpQueuedAt = -Infinity;
    this.lastGroundedAt = -Infinity;
    this.body.setMaxVelocity(600, BALANCE.groundSmash.fallSpeed);
    this.setVelocity(0, BALANCE.groundSmash.fallSpeed);
  }

  endGroundSmash(): void {
    this.groundSmashing = false;
    this.body.setMaxVelocity(600, 950);
  }

  get staffTip(): { x: number; y: number } {
    return this.presentation.staffTip;
  }

  get grounded(): boolean {
    return (this.body.blocked.down || this.body.touching.down) && this.body.velocity.y >= 0;
  }

  isHurt(now: number): boolean {
    return now < this.hurtUntil;
  }

  get airJumpSpent(): boolean {
    return this.airJumpUsed;
  }

  regenerateEssence(now: number, seconds: number): void {
    if (!this.shielding && !this.healing && now - this.essenceSpentAt >= BALANCE.player.essenceRegenDelayMs) {
      this.essence = Math.min(BALANCE.player.maxEssence, this.essence + BALANCE.player.essenceRegen * seconds);
    }
  }

  spendEssence(amount: number, now: number): boolean {
    if (this.essence < amount) return false;
    this.essence = Math.max(0, this.essence - amount);
    this.essenceSpentAt = now;
    return true;
  }

  takeDamage(amount: number, sourceX: number, now: number): boolean {
    if (now < this.invulnerableUntil || this.health <= 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.damageVersion++;
    this.presentation.play('hurt', now);
    this.invulnerableUntil = now + BALANCE.player.invulnerabilityMs;
    this.hurtUntil = now + 180;
    this.setVelocity(this.x >= sourceX ? 230 : -230, -170);
    return true;
  }

  get vulnerable(): boolean {
    return this.active && this.health > 0;
  }

  restore(spawn: SpawnPoint, now: number): void {
    this.body.reset(spawn.x, spawn.y);
    this.setVelocity(0, 0).setAlpha(1);
    this.facing = 1;
    this.setFlipX(false);
    this.health = BALANCE.player.maxHealth;
    this.essence = BALANCE.player.maxEssence;
    this.shielding = false;
    this.healing = false;
    this.healEndsAt = 0;
    this.healReadyAt = 0;
    this.airBurstReadyAt = 0;
    this.groundSmashReadyAt = 0;
    this.endGroundSmash();
    this.damageVersion++;
    this.wasGrounded = false;
    this.invulnerableUntil = now + 800;
    this.hurtUntil = 0;
    this.lastGroundedAt = -Infinity;
    this.jumpQueuedAt = -Infinity;
    this.jumped = false;
    this.airJumpUsed = false;
    this.nextAirJumpAt = 0;
    this.jumpStartedAt = -Infinity;
    this.essenceSpentAt = -Infinity;
    this.presentation.reset(now);
  }
}
