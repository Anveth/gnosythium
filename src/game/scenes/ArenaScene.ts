import Phaser from 'phaser';
import type { GameShell } from '../../ui/GameShell';
import { createTextures } from '../art/textures';
import { createMageFrames, preloadMage } from '../art/mageAtlas';
import { preloadSoundEffects, SoundEffects } from '../audio/SoundEffects';
import { Combat } from '../combat/Combat';
import { BALANCE, VIEW } from '../config';
import { Sentinel } from '../enemies/Sentinel';
import { PlatformNavigation } from '../enemies/PlatformNavigation';
import { GameSession } from '../GameSession';
import { PlayerInput } from '../input/PlayerInput';
import { Player } from '../player/Player';
import { CheckpointState } from '../state/CheckpointState';
import { ARENA } from '../world/arenaData';
import { ArenaWorld } from '../world/ArenaWorld';
import { Interactions } from '../world/Interactions';
import { SealPuzzle } from '../world/SealPuzzle';

export class ArenaScene extends Phaser.Scene {
  private player!: Player;
  private controls!: PlayerInput;
  private combat!: Combat;
  private puzzle!: SealPuzzle;
  private interactions!: Interactions;
  private checkpoint!: CheckpointState;
  private enemies: Sentinel[] = [];
  private session!: GameSession;
  private sounds!: SoundEffects;
  private elapsed = 0;
  private autostart = false;

  constructor(private readonly shell: GameShell) {
    super('Arena');
  }

  init(data: { autostart?: boolean } = {}): void {
    this.autostart = data.autostart ?? false;
  }

  preload(): void {
    preloadMage(this);
    preloadSoundEffects(this);
  }

  create(): void {
    this.elapsed = 0;
    this.checkpoint = new CheckpointState();
    this.sounds = new SoundEffects(this);
    createTextures(this);
    createMageFrames(this);
    this.physics.world.setBounds(0, 0, ARENA.width, ARENA.height, true, true, true, false);
    this.physics.world.gravity.set(0, BALANCE.gravity);
    const world = new ArenaWorld(this);
    this.player = new Player(this, this.checkpoint.restore().spawn, this.sounds);
    this.controls = new PlayerInput(this);
    this.puzzle = new SealPuzzle(this, () => this.shell.hud.notify('The seal yields · the gate is open'));
    const navigation = new PlatformNavigation();
    this.enemies = ARENA.enemies.map((spawn) => new Sentinel(this, spawn, navigation, this.sounds));
    this.physics.add.collider(this.player, world.platforms);
    this.physics.add.collider(this.player, this.puzzle.gate);
    for (const enemy of this.enemies) {
      this.physics.add.collider(enemy, world.platforms);
      this.physics.add.collider(enemy, this.puzzle.gate);
    }
    this.combat = new Combat(this, this.player, this.enemies, world.platforms, this.puzzle, this.sounds);
    this.interactions = new Interactions(this, this.checkpoint,
      (message) => this.shell.hud.notify(message), () => this.session.complete());
    this.session = new GameSession(this, this.shell, this.controls, this.player, this.combat,
      this.sounds, () => this.respawn());
    this.cameras.main.setZoom(VIEW.renderScale);
    this.cameras.main.setBounds(0, 0, ARENA.width, 900);
    this.cameras.main.startFollow(this.player, false, 0.12, 0.12, 0, 65);
    this.cameras.main.setDeadzone(160, 70);
    this.cameras.main.centerOn(this.player.x, this.player.y - 65);
    this.puzzle.update(0);
    this.interactions.update(this.player, this.puzzle, false, 0);
    this.refreshHud('');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls.destroy();
      this.session.destroy();
    });
    if (this.autostart) this.session.resume();
  }

  update(_time: number, delta: number): void {
    if (!this.session?.playing) return;
    const seconds = Math.min(delta, 50) / 1000;
    const cameraSmoothing = 1 - Math.pow(1 - 0.12, seconds * 60);
    this.cameras.main.setLerp(cameraSmoothing, cameraSmoothing);
    this.elapsed += seconds * 1000;
    const frame = this.controls.read();
    this.player.move(frame, this.elapsed);
    this.combat.update(frame, this.elapsed, seconds);
    for (const enemy of this.enemies) {
      const action = enemy.updateBehavior(this.elapsed, this.player, this.puzzle.activated, this.enemies);
      if (action === 'melee') this.combat.receiveAttack(enemy, this.elapsed);
      if (action === 'shoot') this.combat.fireEnemyBolt(enemy, this.elapsed);
      if (action === 'airImpact') this.combat.airImpact(enemy, this.elapsed);
    }
    this.puzzle.update(this.elapsed);
    this.player.presentation.refresh(this.elapsed);
    if (this.player.health <= 0 || this.player.y > ARENA.deathY) {
      this.player.health = 0;
      this.player.presentation.refresh(this.elapsed);
      this.refreshHud('');
      this.session.die();
      return;
    }
    const prompt = this.interactions.update(this.player, this.puzzle, frame.interactPressed, this.elapsed);
    const body = this.player.body;
    const speed = Math.abs(body.velocity.x);
    const againstWall = (body.blocked.left && body.velocity.x < 0) || (body.blocked.right && body.velocity.x > 0);
    const moving = this.player.grounded && !this.player.healing && !this.player.isHurt(this.elapsed)
      && !againstWall && speed > 20 && Math.abs(body.deltaX()) > 0.2;
    this.sounds.setFootsteps(moving, speed);
    this.refreshHud(prompt);
  }

  private respawn(): void {
    const snapshot = this.checkpoint.restore();
    this.combat.reset();
    this.player.restore(snapshot.spawn, this.elapsed);
    this.puzzle.restore(snapshot.sealActivated);
    this.puzzle.update(this.elapsed);
    this.enemies.forEach((enemy) => enemy.restore());
    this.controls.reset();
    this.cameras.main.centerOn(this.player.x, this.player.y - 65);
    this.refreshHud('');
    this.shell.hud.notify('Returned to your last attunement');
  }

  private refreshHud(prompt: string): void {
    this.shell.hud.update(this.player, this.puzzle.activated,
      this.checkpoint.restore().checkpointActivated, prompt, this.elapsed);
  }
}
