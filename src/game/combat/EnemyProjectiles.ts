import Phaser from 'phaser';
import { ART_SCALE, BALANCE, COLORS } from '../config';
import type { SoundEffects } from '../audio/SoundEffects';
import type { Sentinel } from '../enemies/Sentinel';
import type { Player } from '../player/Player';
import { ARENA } from '../world/arenaData';
import type { SealPuzzle } from '../world/SealPuzzle';
import type { HitEffects } from './HitEffects';

class HostileBolt extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number, readonly expiresAt: number) {
    super(scene, worldX, worldY, 'hostile-bolt');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(24, 24).setDepth(11);
    this.body.setAllowGravity(false).setCircle(5 * ART_SCALE, 7 * ART_SCALE, 7 * ART_SCALE);
  }
}

export class EnemyProjectiles {
  private readonly projectiles: Phaser.Physics.Arcade.Group;
  private readonly trails: Phaser.GameObjects.Graphics;
  private now = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    player: Player,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    puzzle: SealPuzzle,
    sounds: SoundEffects,
    effects: HitEffects,
    onHit: (sourceX: number, sourceY: number, damage: number, now: number) => void,
  ) {
    this.projectiles = scene.physics.add.group({ allowGravity: false, bounceX: 0, bounceY: 0 });
    this.trails = scene.add.graphics().setDepth(10);
    const impact = (first: unknown, second: unknown): void => {
      const bolt = this.boltFrom(first, second);
      if (bolt?.active) {
        sounds.play('impact', 0.5);
        bolt.destroy();
      }
    };
    scene.physics.add.collider(this.projectiles, platforms, (first, second) => {
      const bolt = this.boltFrom(first, second);
      if (!bolt?.active) return;
      effects.surfaceImpact(bolt.body.center.x, bolt.body.center.y, COLORS.hostileMagic);
      sounds.play('impact', 0.35);
      bolt.destroy();
    });
    scene.physics.add.collider(this.projectiles, puzzle.gate, impact);
    scene.physics.add.overlap(this.projectiles, player, (first, second) => {
      const bolt = this.boltFrom(first, second);
      if (!bolt?.active || player.health <= 0) return;
      onHit(bolt.body.center.x - bolt.body.velocity.x * 0.2,
        bolt.body.center.y - bolt.body.velocity.y * 0.2, BALANCE.enemyBolt.damage, this.now);
      bolt.destroy();
    });
  }

  fire(enemy: Sentinel, now: number): void {
    const angle = enemy.shotAngle;
    const origin = enemy.shotOrigin;
    const bolt = new HostileBolt(this.scene, origin.x, origin.y, now + BALANCE.enemyBolt.lifetimeMs);
    this.projectiles.add(bolt);
    bolt.setVelocity(Math.cos(angle) * BALANCE.enemyBolt.speed, Math.sin(angle) * BALANCE.enemyBolt.speed);
  }

  update(now: number): void {
    this.now = now;
    this.trails.clear();
    for (const object of [...this.projectiles.getChildren()]) {
      if (!(object instanceof HostileBolt)) continue;
      if (now > object.expiresAt || object.x < 0 || object.x > ARENA.width || object.y < 0 || object.y > ARENA.height) {
        object.destroy();
      } else {
        this.trails.lineStyle(3, COLORS.hostileMagic, 0.35).lineBetween(object.x, object.y,
          object.x - object.body.velocity.x * 0.07, object.y - object.body.velocity.y * 0.07);
      }
    }
  }

  clear(): void {
    this.projectiles.clear(true, true);
    this.trails.clear();
  }

  private boltFrom(first: unknown, second: unknown): HostileBolt | undefined {
    if (first instanceof HostileBolt) return first;
    if (second instanceof HostileBolt) return second;
    return undefined;
  }
}
