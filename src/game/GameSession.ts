import type Phaser from 'phaser';
import type { GameShell, OverlayMode } from '../ui/GameShell';
import { BackgroundMusic } from './audio/BackgroundMusic';
import type { SoundEffects } from './audio/SoundEffects';
import type { Combat } from './combat/Combat';
import type { PlayerInput } from './input/PlayerInput';
import { FullscreenKeyboard } from './input/FullscreenKeyboard';
import type { Player } from './player/Player';

type SessionMode = OverlayMode | 'playing';

export class GameSession {
  private readonly music = new BackgroundMusic();
  private readonly fullscreenKeyboard = new FullscreenKeyboard();
  private mode: SessionMode = 'intro';
  private wasFullscreen = Boolean(document.fullscreenElement);
  private readonly unsubscribeAudio: () => void;
  private disposed = false;

  private readonly onBlur = (): void => this.pause();
  private readonly onVisibility = (): void => {
    if (document.hidden) this.pause();
  };
  private readonly onFullscreen = (): void => {
    const fullscreen = Boolean(document.fullscreenElement);
    if (fullscreen) this.captureEscape();
    else this.fullscreenKeyboard.release();
    if (this.wasFullscreen && !fullscreen) {
      if (this.mode === 'paused') this.shell.show('paused');
      else this.pause();
    }
    this.wasFullscreen = fullscreen;
  };
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey) return;
    if (event.repeat || (event.code !== 'KeyP' && event.code !== 'Escape')) return;
    event.preventDefault();
    if (this.mode === 'playing') this.pause();
    else if (this.mode === 'paused' && !document.hidden) this.resume();
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly shell: GameShell,
    private readonly input: PlayerInput,
    private readonly player: Player,
    private readonly combat: Combat,
    private readonly sounds: SoundEffects,
    respawn: () => void,
  ) {
    scene.physics.pause();
    this.unsubscribeAudio = shell.audio.subscribe((mix) => {
      this.music.setMix(mix.musicVolume, mix.musicMuted);
      this.sounds.setMix(mix.effectsVolume, mix.effectsMuted);
    });
    shell.bind({
      start: () => this.resume(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      respawn: () => { respawn(); this.resume(); },
      returnToCheckpoint: () => { respawn(); this.resume(); },
      restart: () => {
        scene.scene.resume();
        scene.scene.restart({ autostart: true });
      },
    });
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('visibilitychange', this.onVisibility);
    document.addEventListener('fullscreenchange', this.onFullscreen);
    if (this.wasFullscreen) this.captureEscape();
  }

  get playing(): boolean {
    return this.mode === 'playing';
  }

  resume(): void {
    if (document.hidden || !document.hasFocus()) {
      this.music.pause();
      this.sounds.pause();
      this.mode = 'paused';
      this.shell.show('paused');
      return;
    }
    this.input.reset();
    this.player.setVelocityX(0);
    this.shell.hide();
    this.mode = 'playing';
    this.scene.scene.resume();
    this.scene.physics.resume();
    this.music.resume();
    this.sounds.resume();
  }

  pause(): void {
    if (this.playing) this.stop('paused');
  }

  die(): void {
    if (this.playing) this.stop('dead');
  }

  complete(): void {
    if (this.playing) this.stop('complete');
  }

  destroy(): void {
    this.disposed = true;
    this.fullscreenKeyboard.destroy();
    this.unsubscribeAudio();
    this.music.destroy();
    this.sounds.destroy();
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('visibilitychange', this.onVisibility);
    document.removeEventListener('fullscreenchange', this.onFullscreen);
  }

  private captureEscape(): void {
    void this.fullscreenKeyboard.captureEscape().then((captured) => {
      if (!this.disposed && !captured && document.fullscreenElement) {
        this.shell.hud.notify('Esc may exit fullscreen · use P to pause');
      }
    });
  }

  private stop(mode: OverlayMode): void {
    this.music.pause();
    this.sounds.pause();
    if (mode !== 'paused') this.sounds.reset();
    this.mode = mode;
    this.input.reset();
    this.player.setVelocityX(0);
    this.combat.suspend();
    this.scene.physics.pause();
    this.scene.scene.pause();
    this.shell.show(mode);
  }
}
