import { element } from './dom';

export interface AudioMix {
  musicVolume: number;
  effectsVolume: number;
  musicMuted: boolean;
  effectsMuted: boolean;
}

export class AudioSettings {
  private readonly mix: AudioMix = {
    musicVolume: 0.3, effectsVolume: 1, musicMuted: false, effectsMuted: false,
  };
  private readonly listeners = new Set<(mix: Readonly<AudioMix>) => void>();

  constructor() {
    this.bindChannel('music', 'musicVolume', 'musicMuted');
    this.bindChannel('effects', 'effectsVolume', 'effectsMuted');
  }

  subscribe(listener: (mix: Readonly<AudioMix>) => void): () => void {
    this.listeners.add(listener);
    listener(this.mix);
    return () => this.listeners.delete(listener);
  }

  private bindChannel(
    channel: 'music' | 'effects', volumeKey: 'musicVolume' | 'effectsVolume', muteKey: 'musicMuted' | 'effectsMuted',
  ): void {
    const slider = element<HTMLInputElement>(`${channel}-volume`);
    const mute = element<HTMLButtonElement>(`${channel}-mute`);
    const output = element<HTMLOutputElement>(`${channel}-level`);
    const update = (): void => {
      slider.value = `${Math.round(this.mix[volumeKey] * 100)}`;
      mute.setAttribute('aria-pressed', `${this.mix[muteKey]}`);
      mute.textContent = this.mix[muteKey] ? 'Unmute' : 'Mute';
      output.value = this.mix[muteKey] ? 'Off' : `${slider.value}%`;
      for (const listener of this.listeners) listener(this.mix);
    };
    slider.addEventListener('input', () => {
      this.mix[volumeKey] = Math.max(0, Math.min(1, Number(slider.value) / 100));
      this.mix[muteKey] = false;
      update();
    });
    mute.addEventListener('click', () => {
      this.mix[muteKey] = !this.mix[muteKey];
      update();
    });
    update();
  }
}
