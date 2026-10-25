import Phaser from 'phaser';
import { COLORS } from '../config';
import { drawSigil } from '../art/sigil';
import type { Player } from '../player/Player';
import type { CheckpointState } from '../state/CheckpointState';
import { ARENA } from './arenaData';
import type { SealPuzzle } from './SealPuzzle';

export class Interactions {
  private readonly brush: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly checkpoint: CheckpointState,
    private readonly onMessage: (message: string) => void,
    private readonly onComplete: () => void,
  ) {
    this.brush = scene.add.graphics().setDepth(4);
  }

  update(player: Player, puzzle: SealPuzzle, pressed: boolean, now: number): string {
    this.draw(now, this.checkpoint.restore().checkpointActivated, puzzle.activated);
    if (Phaser.Math.Distance.Between(player.x, player.y - 25, ARENA.checkpoint.x, ARENA.checkpoint.y) < 90) {
      if (pressed && (player.body.blocked.down || player.body.touching.down)) {
        const spawn = { x: ARENA.checkpoint.x, y: ARENA.floorY - 3 };
        this.checkpoint.activate(spawn, puzzle.activated);
        player.restore(spawn, now);
        this.onMessage('Checkpoint attuned · health and essence restored');
      }
      return '[E] Attune checkpoint · restore health & essence';
    }
    if (Phaser.Math.Distance.Between(player.x, player.y - 30, ARENA.exit.x, ARENA.exit.y) < 100) {
      if (puzzle.activated) {
        if (pressed) this.onComplete();
        return '[E] Cross the threshold';
      }
      return 'The threshold is sealed. Find the floating sigil.';
    }
    if (!puzzle.activated && Math.abs(player.x - ARENA.seal.x) < 190 && player.y < 650) {
      return 'Aim at the floating seal · cast Spectral Bolt';
    }
    if (!puzzle.activated && Math.abs(player.x - ARENA.gate.x) < 150) {
      return 'A distant seal binds this gate. Search the upper platforms.';
    }
    return '';
  }

  private draw(now: number, checkpointActive: boolean, exitActive: boolean): void {
    const { checkpoint, exit } = ARENA;
    this.brush.clear();
    this.brush.fillStyle(0x35464a).fillRect(checkpoint.x - 32, 724, 64, 16);
    this.brush.fillStyle(0x51625f).fillRect(checkpoint.x - 23, 715, 46, 9);
    this.brush.fillStyle(COLORS.magic, checkpointActive ? 0.12 : 0.045);
    this.brush.fillCircle(checkpoint.x, checkpoint.y, 48 + Math.sin(now / 700) * 3);
    drawSigil(this.brush, checkpoint.x, checkpoint.y, 24, checkpointActive ? COLORS.magic : COLORS.gold, now / 14000);
    this.brush.lineStyle(8, 0x4a5d59).beginPath().arc(exit.x, exit.y - 5, 50, Math.PI, 0).strokePath();
    this.brush.lineBetween(exit.x - 50, exit.y - 5, exit.x - 50, 740);
    this.brush.lineBetween(exit.x + 50, exit.y - 5, exit.x + 50, 740);
    this.brush.fillStyle(exitActive ? COLORS.magic : 0x486662, exitActive ? 0.13 : 0.04);
    this.brush.fillEllipse(exit.x, exit.y, 80, 114);
    if (exitActive) drawSigil(this.brush, exit.x, exit.y - 2, 27, COLORS.magic, -now / 11000);
  }
}
