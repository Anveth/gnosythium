import Phaser from 'phaser';
import { ART_SCALE, BALANCE, COLORS } from '../config';
import type { SoundEffects } from '../audio/SoundEffects';
import type { Player } from '../player/Player';
import { ARENA, type EnemySpawn } from '../world/arenaData';
import { PlatformNavigation } from './PlatformNavigation';
import { AirDisplacement } from './AirDisplacement';

type EnemyState = 'patrol' | 'windup' | 'strike' | 'shooting' | 'recovery' | 'stunned';
export type EnemyAction = 'melee' | 'shoot' | 'airImpact' | undefined;

export class Sentinel extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  health: number = BALANCE.enemy.health;
  private facing = -1;
  private behavior: EnemyState = 'patrol';
  private stateUntil = 0;
  private windupDuration: number = BALANCE.enemy.attackWindupMs;
  private alerted = false;
  private strikeSpent = false;
  private lungeBlocked = false;
  private combo = 0;
  private nextStaggerAt = 0;
  private nextJumpAt = 0;
  private nextShotAt = 0;
  shotAngle = 0;
  private landingX: number | undefined;
  private readonly indicator: Phaser.GameObjects.Graphics;
  private readonly displacement: AirDisplacement;

  constructor(
    scene: Phaser.Scene, readonly spawn: EnemySpawn,
    private readonly navigation: PlatformNavigation, private readonly sounds: SoundEffects,
  ) {
    super(scene, spawn.x, spawn.y, 'sentinel');
    this.setOrigin(0.5, 1).setDisplaySize(60, 78).setDepth(9);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(30 * ART_SCALE, 57 * ART_SCALE).setOffset(15 * ART_SCALE, 19 * ART_SCALE);
    this.body.setMaxVelocity(600, 950).setCollideWorldBounds(true);
    this.displacement = new AirDisplacement(this.body);
    this.indicator = scene.add.graphics().setDepth(12);
  }

  updateBehavior(now: number, player: Player, gateOpen: boolean, allies: readonly Sentinel[]): EnemyAction {
    this.indicator.clear();
    if (!this.active) return undefined;
    if (this.y > ARENA.deathY) {
      this.displacement.reset();
      this.health = 0;
      this.disableBody(true, true);
      return undefined;
    }
    const displacement = this.displacement.update(now);
    if (displacement) {
      if (displacement === 'impact') this.takeDamage(BALANCE.airBurst.impactDamage, this.x, now);
      if (this.active) this.drawStatus(now);
      return displacement === 'impact' ? 'airImpact' : undefined;
    }
    let action: EnemyAction;
    const distanceX = player.body.center.x - this.body.center.x;
    const nearHeight = Math.abs(player.body.center.y - this.body.center.y) < 62
      && this.navigation.clearOfGate(this.body.center.x, player.body.center.x, gateOpen);
    const grounded = (this.body.blocked.down || this.body.touching.down) && this.body.velocity.y >= 0;
    if ((Math.abs(distanceX) < BALANCE.enemy.detectionRange && Math.abs(player.y - this.y) < 320)
      || allies.some((ally) => ally !== this && ally.active && ally.alerted && Math.abs(ally.x - this.x) < 520)) {
      this.alerted = true;
    }
    if (this.behavior === 'shooting') {
      this.setVelocityX(0);
      const origin = this.shotOrigin;
      const progress = 1 - Math.max(0, this.stateUntil - now) / BALANCE.enemyBolt.windupMs;
      this.indicator.lineStyle(1, COLORS.hostileMagic, 0.35 + progress * 0.5);
      this.indicator.lineBetween(origin.x, origin.y,
        origin.x + Math.cos(this.shotAngle) * 110, origin.y + Math.sin(this.shotAngle) * 110);
      this.indicator.lineStyle(2, COLORS.hostileMagic, 0.9).strokeCircle(origin.x, origin.y, 5 + progress * 9);
      if (now >= this.stateUntil) {
        if (this.navigation.canShoot(origin.x, origin.y,
          origin.x + Math.cos(this.shotAngle) * Math.abs(distanceX),
          origin.y + Math.sin(this.shotAngle) * Math.abs(distanceX), gateOpen)) action = 'shoot';
        this.behavior = 'recovery';
        this.stateUntil = now + 280;
      }
    } else if (this.behavior === 'windup') {
      this.setVelocityX(0);
      const progress = 1 - Math.max(0, this.stateUntil - now) / this.windupDuration;
      this.indicator.lineStyle(2, COLORS.danger, 0.4 + progress * 0.6);
      this.indicator.strokeCircle(this.x, this.y - 36, 39 + progress * 9);
      this.indicator.lineBetween(this.x, this.y - 34, this.x + this.facing * (35 + progress * 120), this.y - 34);
      this.indicator.fillStyle(COLORS.danger).fillTriangle(
        this.x - 5, this.y - 91, this.x + 5, this.y - 91, this.x, this.y - 80,
      );
      if (now >= this.stateUntil) {
        this.behavior = 'strike';
        this.stateUntil = now + BALANCE.enemy.attackActiveMs;
        this.strikeSpent = false;
        this.lungeBlocked = false;
        this.sounds.play('enemySwing', 0.7);
      }
    } else if (this.behavior === 'strike') {
      const safeLunge = !this.lungeBlocked && grounded && this.navigation.safeDirection(this.body, this.facing, gateOpen);
      this.setVelocityX(safeLunge ? this.facing * BALANCE.enemy.lungeSpeed : 0);
      this.indicator.lineStyle(5, COLORS.danger, 0.85);
      this.indicator.lineBetween(this.x + this.facing * 10, this.y - 42,
        this.x + this.facing * 77, this.y - 27);
      if (!this.strikeSpent && nearHeight && Math.abs(distanceX) <= 84 && distanceX * this.facing >= -12) {
        action = 'melee';
        this.strikeSpent = true;
      }
      if (now >= this.stateUntil) {
        this.setVelocityX(0);
        if (this.combo === 0 && grounded && nearHeight && Math.abs(distanceX) < 155 && player.vulnerable) {
          this.combo = 1;
          this.beginWindup(now, distanceX, BALANCE.enemy.comboWindupMs);
        } else {
          this.behavior = 'recovery';
          this.stateUntil = now + BALANCE.enemy.attackRecoveryMs;
        }
      }
    } else if (this.behavior === 'stunned' || this.behavior === 'recovery') {
      if (this.behavior === 'recovery') this.setVelocityX(0);
      if (now >= this.stateUntil) {
        this.behavior = 'patrol';
        this.setVelocityX(0);
        this.body.setDragX(0);
      }
    } else if (this.alerted) {
      if (grounded && nearHeight && Math.abs(distanceX) <= BALANCE.enemy.attackRange && player.vulnerable) {
        this.landingX = undefined;
        this.combo = 0;
        this.beginWindup(now, distanceX, BALANCE.enemy.attackWindupMs);
      } else if (grounded && now >= this.nextShotAt && Math.abs(distanceX) > 155
        && Math.abs(distanceX) < BALANCE.enemyBolt.range
        && this.navigation.canShoot(this.shotOrigin.x, this.shotOrigin.y,
          player.body.center.x, player.body.center.y, gateOpen)) {
        this.facing = distanceX >= 0 ? 1 : -1;
        const origin = this.shotOrigin;
        this.shotAngle = Math.atan2(player.body.center.y - origin.y, player.body.center.x - origin.x);
        this.behavior = 'shooting';
        this.stateUntil = now + BALANCE.enemyBolt.windupMs;
        this.nextShotAt = now + BALANCE.enemyBolt.cooldownMs;
        this.setVelocityX(0);
      } else {
        this.pursue(player, now, grounded, gateOpen);
      }
    } else {
      if (this.x <= this.spawn.left) this.facing = 1;
      if (this.x >= this.spawn.right) this.facing = -1;
      if (grounded && !this.navigation.safeDirection(this.body, this.facing, gateOpen)) this.facing *= -1;
      this.setVelocityX(this.facing * BALANCE.enemy.speed);
    }
    this.setFlipX(this.facing < 0);
    this.drawStatus(now);
    return action;
  }

  pushByAir(velocityX: number, velocityY: number, now: number): void {
    if (!this.active) return;
    this.alerted = true;
    this.behavior = 'recovery';
    this.stateUntil = now + BALANCE.airBurst.displacementMs + 150;
    this.landingX = undefined;
    this.combo = 0;
    this.strikeSpent = true;
    this.indicator.clear();
    this.displacement.launch(velocityX, velocityY, now);
  }

  private drawStatus(now: number): void {
    this.indicator.fillStyle(0x11191f).fillRect(this.x - 24, this.y - 86, 48, 4);
    this.indicator.fillStyle(COLORS.danger).fillRect(this.x - 24, this.y - 86,
      48 * this.health / BALANCE.enemy.health, 4);
    if (now < this.nextStaggerAt) {
      this.indicator.lineStyle(1, COLORS.gold, 0.7).lineBetween(this.x - 24, this.y - 88, this.x + 24, this.y - 88);
    }
  }

  stopLunge(): void {
    if (this.behavior !== 'strike') return;
    this.lungeBlocked = true;
    this.setVelocityX(0);
  }

  get shotOrigin(): { x: number; y: number } {
    return { x: this.body.center.x + this.facing * 20, y: this.body.bottom - 40 };
  }

  takeDamage(amount: number, sourceX: number, now: number): void {
    if (!this.active) return;
    this.alerted = true;
    this.health = Math.max(0, this.health - amount);
    if (now >= this.nextStaggerAt && !this.displacement.active) {
      this.behavior = 'stunned';
      this.stateUntil = now + BALANCE.enemy.stunMs;
      this.nextStaggerAt = now + BALANCE.enemy.staggerCooldownMs;
      this.setVelocityX(this.x >= sourceX ? 135 : -135);
      this.body.setDragX(1000);
    }
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);
    this.scene.tweens.add({ targets: this, alpha: 0.45, duration: 60, yoyo: true });
    if (this.health <= 0) {
      this.disableBody(true, true);
      this.indicator.clear();
    }
  }

  restore(): void {
    this.scene.tweens.killTweensOf(this);
    this.enableBody(true, this.spawn.x, this.spawn.y, true, true);
    this.setVelocity(0, 0).setAlpha(1);
    this.displacement.reset();
    this.body.setDragX(0);
    this.health = BALANCE.enemy.health;
    this.behavior = 'patrol';
    this.facing = -1;
    this.alerted = false;
    this.nextStaggerAt = 0;
    this.nextJumpAt = 0;
    this.nextShotAt = 0;
    this.landingX = undefined;
    this.combo = 0;
    this.strikeSpent = false;
    this.lungeBlocked = false;
    this.stateUntil = 0;
    this.indicator.clear();
  }

  private beginWindup(now: number, distanceX: number, duration: number): void {
    this.facing = distanceX >= 0 ? 1 : -1;
    this.behavior = 'windup';
    this.windupDuration = duration;
    this.stateUntil = now + duration;
    this.body.setDragX(0);
    this.setVelocityX(0);
  }

  private pursue(player: Player, now: number, grounded: boolean, gateOpen: boolean): void {
    let targetX = this.landingX ?? player.body.center.x;
    if (grounded) {
      this.landingX = undefined;
      const plan = this.navigation.pursue(this.body, player.body, gateOpen);
      targetX = plan.targetX;
      if (plan.jump && now >= this.nextJumpAt) {
        this.landingX = plan.landingX;
        targetX = plan.landingX;
        this.nextJumpAt = now + BALANCE.enemy.jumpCooldownMs;
        this.setVelocityY(-BALANCE.enemy.jumpSpeed);
      }
    }
    const remaining = targetX - this.body.center.x;
    if (Math.abs(remaining) > 10) this.facing = Math.sign(remaining);
    this.setVelocityX(Phaser.Math.Clamp(remaining * 9, -BALANCE.enemy.chaseSpeed, BALANCE.enemy.chaseSpeed));
  }
}
