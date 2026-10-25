import Phaser from 'phaser';
import { ART_SCALE, BALANCE } from '../config';

export class MagicBolt extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly expiresAt: number) {
    super(scene, x, y, 'bolt');
    this.setDisplaySize(36, 36).setDepth(11);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false).setCircle(8 * ART_SCALE, 10 * ART_SCALE, 10 * ART_SCALE);
  }

  launch(angle: number): void {
    this.setVelocity(Math.cos(angle) * BALANCE.bolt.speed, Math.sin(angle) * BALANCE.bolt.speed);
    this.setRotation(angle);
  }
}
