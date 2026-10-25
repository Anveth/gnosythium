import { BALANCE } from '../game/config';
import { element } from './dom';

export class EssenceMeter {
  private readonly meter = element('essence-meter');
  private readonly value = element('essence-value');
  private previousEssence = -1;
  private previousDisplay = -1;
  private sparksUntil = 0;

  update(essence: number, now: number): void {
    const amount = Math.max(0, Math.min(BALANCE.player.maxEssence, essence));
    if (this.previousEssence >= 0 && amount < this.previousEssence) this.sparksUntil = now + 500;
    else if (amount > this.previousEssence) this.sparksUntil = 0;
    this.meter.classList.toggle('is-spending', now < this.sparksUntil);
    this.meter.classList.toggle('is-empty', amount === 0);
    const display = Math.ceil(amount);
    if (display !== this.previousDisplay) {
      this.meter.style.setProperty('--essence-level', `${display / BALANCE.player.maxEssence * 100}%`);
      this.value.textContent = `${display} / ${BALANCE.player.maxEssence}`;
      this.meter.setAttribute('aria-valuenow', `${display}`);
      this.previousDisplay = display;
    }
    this.previousEssence = amount;
  }

  reset(): void {
    this.previousEssence = -1;
    this.previousDisplay = -1;
    this.sparksUntil = 0;
    this.meter.classList.remove('is-spending', 'is-empty');
  }
}
