import Phaser from 'phaser';
import { BALANCE, COLORS } from '../config';
import { drawAimMark } from '../art/aimMark';
import type { SoundEffects } from '../audio/SoundEffects';
import type { Sentinel } from '../enemies/Sentinel';
import type { ActionFrame } from '../input/actions';
import type { Player } from '../player/Player';
import { ARENA } from '../world/arenaData';
import type { SealPuzzle } from '../world/SealPuzzle';
import { MagicBolt } from './MagicBolt';
import { HitEffects } from './HitEffects';
import { Healing } from './Healing';
import { EnemyProjectiles } from './EnemyProjectiles';
import { AirBurst } from './AirBurst';
import { ShieldGuard } from './ShieldGuard';
import { GroundSmash } from './GroundSmash';
import { createProjectileSurfaces } from './ProjectileSurfaces';

export class Combat {
  readonly projectiles: Phaser.Physics.Arcade.Group;
  private readonly brush: Phaser.GameObjects.Graphics;
  private nextCastAt = 0;
  private now = 0;
  private readonly effects: HitEffects;
  private readonly healing: Healing;
  private readonly hostileBolts: EnemyProjectiles;
  private readonly airBurst: AirBurst;
  private readonly guard: ShieldGuard;
  private readonly groundSmash: GroundSmash;
  private castReleaseAt = 0;
  private castUntil = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    enemies: readonly Sentinel[],
    platforms: Phaser.Physics.Arcade.StaticGroup,
    puzzle: SealPuzzle,
    private readonly sounds: SoundEffects,
  ) {
    this.projectiles = scene.physics.add.group({ allowGravity: false, bounceX: 0, bounceY: 0 });
    const surfaces = createProjectileSurfaces(scene, platforms);
    this.brush = scene.add.graphics().setDepth(15);
    this.effects = new HitEffects(scene);
    this.healing = new Healing(player, sounds);
    this.airBurst = new AirBurst(scene, player, enemies, puzzle, sounds);
    this.guard = new ShieldGuard(player, sounds);
    this.groundSmash = new GroundSmash(scene, player, enemies, puzzle, sounds);
    this.hostileBolts = new EnemyProjectiles(scene, player, surfaces, puzzle, sounds, this.effects,
      (sourceX, sourceY, damage, now) => this.receiveHit(sourceX, sourceY, damage, now));
    const impact = (first: unknown, second: unknown): void => {
      const bolt = collisionBolt(first, second);
      if (bolt?.active) {
        this.effects.arcane(bolt.body.center.x, bolt.body.center.y);
        this.sounds.play('impact');
        bolt.destroy();
      }
    };
    scene.physics.add.collider(this.projectiles, surfaces, (first, second) => {
      const bolt = collisionBolt(first, second);
      if (!bolt?.active) return;
      this.effects.surfaceImpact(bolt.body.center.x, bolt.body.center.y, COLORS.magic);
      this.sounds.play('impact', 0.45);
      bolt.destroy();
    });
    scene.physics.add.collider(this.projectiles, puzzle.gate, impact);
    scene.physics.add.overlap(this.projectiles, puzzle.target, (first, second) => {
      const bolt = collisionBolt(first, second);
      if (!bolt?.active || puzzle.activated) return;
      puzzle.activate();
      impact(first, second);
    });
    for (const enemy of enemies) {
      scene.physics.add.overlap(this.projectiles, enemy, (first, second) => {
        const bolt = collisionBolt(first, second);
        if (!bolt?.active || !enemy.active) return;
        enemy.takeDamage(BALANCE.bolt.damage, bolt.x - bolt.body.velocity.x, this.now);
        impact(first, second);
      });
    }
  }

  update(frame: ActionFrame, now: number, seconds: number): void {
    this.now = now;
    const { player } = this;
    this.hostileBolts.update(now);
    if (player.isHurt(now)) {
      this.castReleaseAt = 0;
      this.castUntil = 0;
      player.presentation.cancel('cast');
    }
    this.groundSmash.update(frame, now, !player.healing && !player.isHurt(now)
      && !player.shielding && now >= this.castUntil && !this.airBurst.busy(now));
    const earthBusy = this.groundSmash.busy(now);
    this.healing.update(frame, now, now >= this.castUntil && !this.airBurst.busy(now) && !earthBusy);
    const canAct = !player.healing && !player.isHurt(now);
    this.airBurst.update(frame, now, canAct && !earthBusy && !player.shielding && now >= this.castUntil);
    const airBusy = this.airBurst.busy(now);
    this.guard.update(frame.shieldHeld, canAct && !airBusy && !earthBusy && now >= this.castUntil, now, seconds);
    if (canAct && !airBusy && !earthBusy && !player.shielding && !frame.healPressed && frame.castHeld
      && now >= this.nextCastAt && now >= this.castUntil) {
      this.nextCastAt = now + BALANCE.bolt.cooldownMs;
      this.castReleaseAt = now + BALANCE.bolt.windupMs;
      this.castUntil = now + BALANCE.bolt.animationMs;
      player.presentation.play('cast', now);
    }
    if (this.castReleaseAt > 0 && now >= this.castReleaseAt && canAct) {
      player.presentation.refresh(now);
      const staffTip = player.staffTip;
      const angle = Math.atan2(frame.aimY - staffTip.y, frame.aimX - staffTip.x);
      const bolt = new MagicBolt(this.scene, staffTip.x, staffTip.y, now + BALANCE.bolt.lifetimeMs);
      this.projectiles.add(bolt);
      bolt.launch(angle);
      this.sounds.play('cast');
      this.castReleaseAt = 0;
    }
    for (const object of [...this.projectiles.getChildren()]) {
      if (object instanceof MagicBolt
        && (now > object.expiresAt || object.x < 0 || object.x > ARENA.width || object.y > ARENA.height || object.y < 0)) {
        object.destroy();
      }
    }
    player.regenerateEssence(now, seconds);
    this.draw(frame);
  }

  receiveAttack(enemy: Sentinel, now: number): void {
    if (this.receiveHit(enemy.body.center.x, enemy.body.center.y, BALANCE.enemy.damage, now)) enemy.stopLunge();
  }

  fireEnemyBolt(enemy: Sentinel, now: number): void {
    this.hostileBolts.fire(enemy, now);
    this.sounds.play('cast', 0.6);
  }

  airImpact(enemy: Sentinel, now: number): void {
    this.airBurst.impact(enemy, now);
  }

  private receiveHit(sourceX: number, sourceY: number, damage: number, now: number): boolean {
    const { player } = this;
    if (player.shielding) {
      if (player.spendEssence(BALANCE.shield.hitCost, now)) {
        player.presentation.blockImpact(now, sourceX, sourceY);
        this.sounds.play('shield');
        return true;
      }
      this.guard.break(now);
    }
    if (player.takeDamage(damage, sourceX, now)) {
      this.guard.lower(now);
      this.healing.cancel();
      this.groundSmash.cancel();
      this.effects.blood(player.x, player.y - 38, sourceX);
      this.sounds.play('hurt');
      this.scene.cameras.main.shake(100, 0.003);
    }
    return false;
  }

  reset(): void {
    this.sounds.reset();
    this.projectiles.clear(true, true);
    this.nextCastAt = 0;
    this.castReleaseAt = 0;
    this.castUntil = 0;
    this.guard.reset();
    this.brush.clear();
    this.effects.clear();
    this.hostileBolts.clear();
    this.healing.cancel();
    this.airBurst.reset();
    this.groundSmash.reset();
  }

  suspend(): void {
    this.guard.lower(this.now);
    this.player.presentation.refresh(this.now);
    this.brush.clear();
  }

  private draw(frame: ActionFrame): void {
    const { brush } = this;
    brush.clear();
    if (frame.aimVisible) {
      drawAimMark(brush, frame.aimX, frame.aimY, COLORS.magic);
    }
    for (const object of this.projectiles.getChildren()) {
      if (!(object instanceof MagicBolt)) continue;
      brush.lineStyle(6, COLORS.magic, 0.12).lineBetween(object.x, object.y,
        object.x - object.body.velocity.x * 0.06, object.y - object.body.velocity.y * 0.06);
      brush.lineStyle(1.5, COLORS.magicLight, 0.65).lineBetween(object.x, object.y,
        object.x - object.body.velocity.x * 0.035, object.y - object.body.velocity.y * 0.035);
    }
  }
}

function collisionBolt(first: unknown, second: unknown): MagicBolt | undefined {
  if (first instanceof MagicBolt) return first;
  if (second instanceof MagicBolt) return second;
  return undefined;
}
