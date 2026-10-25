interface KeyboardLock {
  lock(keyCodes: string[]): Promise<void>;
  unlock(): void;
}

export class FullscreenKeyboard {
  private static owner: FullscreenKeyboard | undefined;
  private readonly keyboard = (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard;
  private disposed = false;
  private requestVersion = 0;

  async captureEscape(): Promise<boolean> {
    if (this.disposed || !window.isSecureContext || !document.fullscreenElement || !this.keyboard?.lock) return false;
    const version = ++this.requestVersion;
    FullscreenKeyboard.owner = this;
    try {
      await this.keyboard.lock(['Escape']);
      if (version !== this.requestVersion) {
        if (!FullscreenKeyboard.owner) this.keyboard.unlock?.();
        return false;
      }
      if (this.disposed || !document.fullscreenElement) {
        this.release();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  release(): void {
    this.requestVersion++;
    if (FullscreenKeyboard.owner !== this) return;
    this.keyboard?.unlock?.();
    FullscreenKeyboard.owner = undefined;
  }

  destroy(): void {
    this.disposed = true;
    this.release();
  }
}
