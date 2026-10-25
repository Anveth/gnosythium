import { BALANCE } from '../game/config';
import type { Player } from '../game/player/Player';
import { element } from './dom';
import { EssenceMeter } from './EssenceMeter';

export class Hud {
  private readonly root = element('hud');
  private readonly healthFill = element('health-fill');
  private readonly essence = new EssenceMeter();
  private readonly healthValue = element('health-value');
  private readonly healthMeter = element('health-meter');
  private readonly objective = element('objective');
  private readonly checkpointStatus = element('checkpoint-status');
  private readonly airJumpStatus = element('air-jump-status');
  private readonly healStatus = element('heal-status');
  private readonly airBurstStatus = element('air-burst-status');
  private readonly groundSmashStatus = element('ground-smash-status');
  private readonly interaction = element('interaction');
  private readonly toast = element('toast');
  private toastUntil = 0;
  private now = 0;
  private previousHealth = -1;

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
  }

  update(player: Player, sealActivated: boolean, checkpointActivated: boolean, prompt: string, now: number): void {
    this.now = now;
    const health = Math.ceil(player.health);
    if (health !== this.previousHealth) {
      this.healthFill.style.transform = `scaleX(${health / BALANCE.player.maxHealth})`;
      this.healthValue.textContent = `${health} / ${BALANCE.player.maxHealth}`;
      this.healthMeter.setAttribute('aria-valuenow', `${health}`);
      this.previousHealth = health;
    }
    this.essence.update(player.essence, now);
    const objective = sealActivated ? 'Cross the threshold beyond the gate' : 'Find the floating seal · break the binding';
    if (this.objective.textContent !== objective) this.objective.textContent = objective;
    this.checkpointStatus.textContent = checkpointActivated ? 'Attuned · this session' : 'Not attuned';
    const cooldown = player.airJumpCooldownMs(now);
    const airJumpStatus = cooldown > 0 ? `${(cooldown / 1000).toFixed(1)}s` : player.airJumpSpent ? 'Land to rearm' : 'Ready';
    if (this.airJumpStatus.textContent !== airJumpStatus) this.airJumpStatus.textContent = airJumpStatus;
    const healCooldown = Math.max(0, player.healReadyAt - now);
    this.healStatus.textContent = player.healing ? `${((player.healEndsAt - now) / 1000).toFixed(1)}s cast`
      : healCooldown > 0 ? `${(healCooldown / 1000).toFixed(1)}s`
        : player.essence < BALANCE.healing.cost ? `${BALANCE.healing.cost} essence` : 'Ready';
    const airBurstCooldown = Math.max(0, player.airBurstReadyAt - now);
    this.airBurstStatus.textContent = airBurstCooldown > 0 ? `${(airBurstCooldown / 1000).toFixed(1)}s`
      : player.essence < BALANCE.airBurst.cost ? `${BALANCE.airBurst.cost} essence` : 'Ready';
    const groundSmashCooldown = Math.max(0, player.groundSmashReadyAt - now);
    this.groundSmashStatus.textContent = player.groundSmashing ? 'Descending'
      : groundSmashCooldown > 0 ? `${(groundSmashCooldown / 1000).toFixed(1)}s`
        : player.essence < BALANCE.groundSmash.cost ? `${BALANCE.groundSmash.cost} essence`
          : player.grounded ? 'Jump to cast' : 'Ready';
    if (this.interaction.textContent !== prompt) this.interaction.textContent = prompt;
    this.interaction.hidden = prompt.length === 0;
    this.toast.hidden = now >= this.toastUntil;
  }

  notify(message: string): void {
    this.toast.textContent = message;
    this.toastUntil = this.now + 2800;
    this.toast.hidden = false;
  }

  reset(): void {
    this.now = 0;
    this.toastUntil = 0;
    this.toast.hidden = true;
    this.interaction.hidden = true;
    this.previousHealth = -1;
    this.essence.reset();
  }
}
