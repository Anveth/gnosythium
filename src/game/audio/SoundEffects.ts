import Phaser from 'phaser';
import castUrl from '../../assets/audio/sfx/01_arcane_projectile_cast.mp3';
import swingUrl from '../../assets/audio/sfx/02_sword_swing.mp3';
import bloodUrl from '../../assets/audio/sfx/03_sword_hit_blood.mp3';
import impactUrl from '../../assets/audio/sfx/04_arcane_projectile_impact.mp3';
import healUrl from '../../assets/audio/sfx/05_heavenly_heal.mp3';
import shieldUrl from '../../assets/audio/sfx/06_protective_shield.mp3';
import jumpUrl from '../../assets/audio/sfx/07_character_jump.mp3';
import footstepsUrl from '../../assets/audio/sfx/08_running_footsteps_loop.mp3';
import { refineMysticShield } from './mysticSpell';
import { createSylfGust } from './sylfGust';

const EFFECTS = {
  cast: { url: castUrl, volume: 0.35, voices: 3 },
  enemySwing: { url: swingUrl, volume: 0.5, voices: 2 },
  hurt: { url: bloodUrl, volume: 0.32, voices: 2 },
  impact: { url: impactUrl, volume: 0.28, voices: 4 },
  heal: { url: healUrl, volume: 1, voices: 1 },
  shield: { url: shieldUrl, volume: 0.62, voices: 1 },
  jump: { url: jumpUrl, volume: 0.52, voices: 2 },
  wind: { url: jumpUrl, volume: 0.7, voices: 1 },
  footsteps: { url: footstepsUrl, volume: 0.55, voices: 1 },
} as const;

type EffectName = keyof typeof EFFECTS;
interface Voice {
  sound: Phaser.Sound.BaseSound;
  startedAt: number;
}

export function preloadSoundEffects(scene: Phaser.Scene): void {
  for (const [name, effect] of Object.entries(EFFECTS)) {
    const key = `gnosythium-sfx-${name}`;
    if (!scene.cache.audio.exists(key)) scene.load.audio(key, effect.url);
  }
}

export class SoundEffects {
  private readonly pools = new Map<EffectName, Voice[]>();
  private enabled = false;
  private shielding = false;
  private footstepMode: 'walk' | 'run' | undefined;
  private sequence = 0;
  private refinedWind = false;

  private readonly onUnlocked = (): void => {
    if (this.canPlay) this.resumeVoices();
  };

  constructor(private readonly scene: Phaser.Scene) {
    scene.sound.pauseOnBlur = false;
    for (const name of Object.keys(EFFECTS) as EffectName[]) {
      let key = `gnosythium-sfx-${name}`;
      if (!scene.cache.audio.exists(key)) continue;
      if ((name === 'shield' || name === 'wind') && scene.sound instanceof Phaser.Sound.WebAudioSoundManager) {
        const refinedKey = `${key}-${name === 'wind' ? 'sylf-gust-v2' : 'mystic-v2'}`;
        if (!scene.cache.audio.exists(refinedKey)) {
          const source: unknown = scene.cache.audio.get(key);
          if (source instanceof AudioBuffer) {
            scene.cache.audio.add(refinedKey, name === 'wind'
              ? createSylfGust(scene.sound.context, source) : refineMysticShield(scene.sound.context, source));
          }
        }
        if (scene.cache.audio.exists(refinedKey)) {
          key = refinedKey;
          if (name === 'wind') this.refinedWind = true;
        }
      }
      this.pools.set(name, Array.from({ length: EFFECTS[name].voices }, () => ({
        sound: scene.sound.add(key), startedAt: 0,
      })));
    }
    scene.sound.on(Phaser.Sound.Events.UNLOCKED, this.onUnlocked);
  }

  play(name: Exclude<EffectName, 'footsteps'>, gain = 1): void {
    this.start(name, gain, false, 1);
  }

  playAirBurst(): void {
    this.start('wind', 1, false, this.refinedWind ? 1 : 0.76);
  }

  playGroundSmash(impact: boolean): void {
    if (impact) this.start('impact', 0.95, false, 0.65);
    else this.start('jump', 0.45, false, 0.65);
  }

  setMix(volume: number, muted: boolean): void {
    if (this.scene.sound instanceof Phaser.Sound.NoAudioSoundManager) return;
    this.scene.sound.setVolume(Math.max(0, Math.min(1, volume)));
    this.scene.sound.setMute(muted);
  }

  setShield(active: boolean): void {
    if (active && !this.shielding) this.play('shield');
    if (!active && this.shielding) this.stop('shield');
    this.shielding = active;
  }

  setFootsteps(moving: boolean, speed: number): void {
    const mode = moving ? speed > 190 ? 'run' : 'walk' : undefined;
    if (!mode || !this.canPlay) {
      this.stop('footsteps');
      this.footstepMode = undefined;
      return;
    }
    const voice = this.pools.get('footsteps')?.[0];
    if (voice?.sound.isPlaying && mode === this.footstepMode) return;
    this.start('footsteps', mode === 'run' ? 1 : 0.8, true, mode === 'run' ? 1 : 0.8);
    this.footstepMode = mode;
  }

  stop(name: EffectName): void {
    for (const voice of this.pools.get(name) ?? []) voice.sound.stop();
  }

  resume(): void {
    this.enabled = true;
    if (this.canPlay) this.resumeVoices();
  }

  pause(): void {
    this.enabled = false;
    this.stop('footsteps');
    this.stop('shield');
    this.footstepMode = undefined;
    this.shielding = false;
    for (const pool of this.pools.values()) {
      for (const voice of pool) {
        if (voice.sound.isPlaying) voice.sound.pause();
      }
    }
  }

  reset(): void {
    for (const name of this.pools.keys()) this.stop(name);
    this.footstepMode = undefined;
    this.shielding = false;
  }

  destroy(): void {
    this.enabled = false;
    this.scene.sound.off(Phaser.Sound.Events.UNLOCKED, this.onUnlocked);
    this.reset();
    for (const pool of this.pools.values()) {
      for (const voice of pool) voice.sound.destroy();
    }
    this.pools.clear();
  }

  private get canPlay(): boolean {
    return this.enabled && !this.scene.sound.locked && !document.hidden && document.hasFocus();
  }

  private start(name: EffectName, gain: number, loop: boolean, rate: number): void {
    if (!this.canPlay) return;
    const pool = this.pools.get(name);
    if (!pool?.length) return;
    const voice = pool.find(entry => !entry.sound.isPlaying && !entry.sound.isPaused)
      ?? pool.reduce((oldest, entry) => entry.startedAt < oldest.startedAt ? entry : oldest);
    voice.sound.stop();
    voice.startedAt = ++this.sequence;
    voice.sound.play({ volume: EFFECTS[name].volume * Math.max(0, Math.min(1, gain)), loop, rate, seek: 0 });
  }

  private resumeVoices(): void {
    for (const pool of this.pools.values()) {
      for (const voice of pool) {
        if (voice.sound.isPaused) voice.sound.resume();
      }
    }
  }
}
