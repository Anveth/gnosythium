import musicUrl from '../../assets/audio/astral-ritual.mp3';

export class BackgroundMusic {
  private readonly audio = new Audio(musicUrl);
  private wanted = false;
  private pending = false;

  private readonly onInteraction = (event: Event): void => {
    if (event.isTrusted) this.play();
  };

  constructor() {
    this.audio.loop = true;
    this.audio.volume = 0.3;
    this.audio.preload = 'auto';
    window.addEventListener('pointerdown', this.onInteraction);
    window.addEventListener('keydown', this.onInteraction);
  }

  resume(): void {
    this.wanted = true;
    this.play();
  }

  setMix(volume: number, muted: boolean): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.audio.muted = muted;
  }

  pause(): void {
    this.wanted = false;
    this.audio.pause();
  }

  destroy(): void {
    this.pause();
    window.removeEventListener('pointerdown', this.onInteraction);
    window.removeEventListener('keydown', this.onInteraction);
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  private play(): void {
    if (!this.wanted || this.pending || !this.audio.paused || document.hidden || !document.hasFocus()) return;
    this.pending = true;
    void this.audio.play()
      .then(() => {
        if (!this.wanted) this.audio.pause();
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) return;
        console.warn('Unable to play background music.', error);
      })
      .finally(() => {
        this.pending = false;
      });
  }
}
