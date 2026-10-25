import { CONTROL_HINTS } from '../game/input/actions';
import { element } from './dom';
import { Hud } from './Hud';
import { AudioSettings } from './AudioSettings';
import tattooSigilUrl from '../assets/ui/tattoo-sigil.svg';

export interface ShellActions {
  start: () => void;
  resume: () => void;
  pause: () => void;
  respawn: () => void;
  restart: () => void;
  returnToCheckpoint: () => void;
}

export type OverlayMode = 'intro' | 'paused' | 'dead' | 'complete';

export class GameShell {
  readonly hud = new Hud();
  readonly audio = new AudioSettings();
  private readonly root = element('app');
  private readonly overlay = element('overlay');
  private readonly title = element('overlay-title');
  private readonly eyebrow = element('overlay-eyebrow');
  private readonly description = element('overlay-description');
  private readonly primary = element<HTMLButtonElement>('primary-action');
  private readonly secondary = element<HTMLButtonElement>('secondary-action');
  private readonly notice = element('menu-notice');
  private readonly checkpointAction = element<HTMLButtonElement>('checkpoint-action');
  private readonly exitFullscreen = element<HTMLButtonElement>('exit-fullscreen');
  private mode: OverlayMode = 'intro';
  private actions: ShellActions | undefined;

  constructor() {
    element<HTMLImageElement>('menu-sigil').src = tattooSigilUrl;
    const controls = element('controls');
    for (const hint of CONTROL_HINTS) {
      const wrapper = document.createElement('div');
      wrapper.className = 'control';
      const keyGroup = document.createElement('div');
      keyGroup.className = 'control-keys';
      for (const key of hint.keys) {
        const keycap = document.createElement('kbd');
        keycap.textContent = key;
        keyGroup.append(keycap);
      }
      const label = document.createElement('span');
      label.className = 'control-name';
      label.textContent = hint.label;
      const detail = document.createElement('span');
      detail.className = 'control-detail';
      detail.textContent = hint.detail;
      wrapper.append(keyGroup, label, detail);
      controls.append(wrapper);
    }
    this.primary.addEventListener('click', () => {
      if (this.mode === 'intro') this.withFullscreen(() => this.actions?.start());
      if (this.mode === 'paused') this.actions?.resume();
      if (this.mode === 'dead') this.actions?.respawn();
      if (this.mode === 'complete') this.actions?.restart();
    });
    this.secondary.addEventListener('click', () => {
      if (this.mode === 'intro') this.actions?.start();
      if (this.mode === 'paused') this.withFullscreen(() => this.actions?.resume());
    });
    element('pause').addEventListener('click', () => this.actions?.pause());
    this.checkpointAction.addEventListener('click', () => {
      if (this.mode === 'paused') this.actions?.returnToCheckpoint();
    });
    this.exitFullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => this.hud.notify('Unable to exit fullscreen · hold Esc'));
      }
    });
  }

  bind(actions: ShellActions): void {
    this.actions = actions;
    this.hud.reset();
    this.show('intro');
  }

  show(mode: OverlayMode): void {
    this.mode = mode;
    this.root.classList.remove('is-playing');
    this.overlay.hidden = false;
    this.overlay.classList.toggle('is-paused', mode === 'paused');
    this.overlay.classList.toggle('is-intro', mode === 'intro');
    this.eyebrow.hidden = mode === 'intro' || mode === 'paused';
    this.description.hidden = mode === 'intro' || mode === 'paused';
    this.hud.setVisible(mode !== 'intro');
    this.primary.disabled = false;
    this.checkpointAction.hidden = mode !== 'paused';
    this.exitFullscreen.hidden = mode !== 'paused' || !document.fullscreenElement;
    this.secondary.hidden = mode !== 'intro' && (mode !== 'paused' || Boolean(document.fullscreenElement));
    this.notice.textContent = '';
    if (mode === 'intro') {
      this.eyebrow.textContent = '';
      this.title.textContent = 'Gnosythium';
      this.description.textContent = '';
      this.primary.textContent = 'Enter in fullscreen';
      this.secondary.textContent = 'Play in window';
    } else if (mode === 'paused') {
      this.eyebrow.textContent = '';
      this.title.textContent = 'Stillness';
      this.description.textContent = '';
      this.primary.textContent = 'Resume';
      this.secondary.textContent = 'Resume in fullscreen';
    } else if (mode === 'dead') {
      this.eyebrow.textContent = 'THE THREAD IS NOT YET BROKEN';
      this.title.textContent = 'You have fallen';
      this.description.textContent = 'The ruins remember your last attunement.\nEnemies return. The seal follows your checkpoint.';
      this.primary.textContent = 'Revive';
    } else {
      this.eyebrow.textContent = 'FIRST ARENA / COMPLETE';
      this.title.textContent = 'Beyond the seal';
      this.description.textContent = 'You have crossed the first threshold.\nThis is where the current prototype ends.';
      this.primary.textContent = 'Begin a new run';
    }
    this.primary.focus({ preventScroll: true });
  }

  hide(): void {
    this.root.classList.add('is-playing');
    this.overlay.hidden = true;
    this.hud.setVisible(true);
    this.primary.blur();
    this.secondary.blur();
    this.checkpointAction.blur();
    this.exitFullscreen.blur();
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && this.overlay.contains(focused)) focused.blur();
    element('pause').blur();
  }

  fail(): void {
    this.root.classList.remove('is-playing');
    this.overlay.hidden = false;
    this.overlay.classList.remove('is-paused', 'is-intro');
    this.eyebrow.hidden = false;
    this.description.hidden = false;
    this.eyebrow.textContent = 'THE ARENA COULD NOT START';
    this.title.textContent = 'An interruption';
    this.description.textContent = 'Reload the page to try again. If this continues, check the browser console.';
    this.primary.disabled = true;
    this.primary.textContent = 'Unable to start';
    this.secondary.hidden = true;
    this.checkpointAction.hidden = true;
    this.exitFullscreen.hidden = true;
    element('audio-settings').hidden = true;
  }

  private withFullscreen(action: () => void): void {
    if (document.fullscreenElement || !this.root.requestFullscreen) {
      action();
      return;
    }
    this.primary.disabled = true;
    void this.root.requestFullscreen().then(() => {
      this.primary.disabled = false;
      action();
    }).catch(() => {
      this.primary.disabled = false;
      action();
      this.hud.notify('Fullscreen unavailable · playing in window');
    });
  }
}
