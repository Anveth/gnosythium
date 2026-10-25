import type Phaser from 'phaser';
import { KEY_BINDINGS } from './actions';
import type { Action, ActionFrame } from './actions';

export class PlayerInput {
  private readonly held = new Set<string>();
  private readonly blockedKeys = new Set<string>();
  private readonly heldButtons = new Set<number>();
  private readonly blockedButtons = new Set<number>();
  private readonly previous = new Set<Action>();
  private clientX = -1;
  private clientY = -1;
  private readonly bindings = Object.entries(KEY_BINDINGS) as [Action, readonly string[]][];

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    if (!this.bindings.some(([, codes]) => codes.includes(event.code))) return;
    if (event.target instanceof HTMLButtonElement && event.code === 'Space') return;
    event.preventDefault();
    if (!event.repeat) this.blockedKeys.delete(event.code);
    if (event.repeat && !this.held.has(event.code)) this.blockedKeys.add(event.code);
    this.held.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.held.delete(event.code);
    this.blockedKeys.delete(event.code);
  };

  private readonly onBlur = (): void => {
    this.held.forEach((code) => this.blockedKeys.add(code));
    this.held.clear();
    this.heldButtons.forEach((button) => this.blockedButtons.add(button));
    this.heldButtons.clear();
    this.reset();
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    this.heldButtons.add(event.button);
    this.blockedButtons.delete(event.button);
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    this.heldButtons.delete(event.button);
    this.blockedButtons.delete(event.button);
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  };

  constructor(private readonly scene: Phaser.Scene) {
    scene.input.mouse?.disableContextMenu();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  read(): ActionFrame {
    const down = new Set<Action>();
    for (const [action, codes] of this.bindings) {
      if (codes.some((code) => this.held.has(code) && !this.blockedKeys.has(code))) down.add(action);
    }
    const canvas = this.scene.game.canvas;
    const overCanvas = document.elementFromPoint(this.clientX, this.clientY) === canvas;
    if (overCanvas) {
      if (this.heldButtons.has(0) && !this.blockedButtons.has(0)) down.add('cast');
      if (this.heldButtons.has(2) && !this.blockedButtons.has(2)) down.add('shield');
    }
    const bounds = canvas.getBoundingClientRect();
    const pointerX = Math.max(0, Math.min(1, (this.clientX - bounds.left) / Math.max(1, bounds.width)));
    const pointerY = Math.max(0, Math.min(1, (this.clientY - bounds.top) / Math.max(1, bounds.height)));
    const aim = this.scene.cameras.main.getWorldPoint(pointerX * this.scene.scale.width, pointerY * this.scene.scale.height);
    const frame: ActionFrame = {
      move: Number(down.has('right')) - Number(down.has('left')),
      jumpPressed: down.has('jump') && !this.previous.has('jump'),
      jumpHeld: down.has('jump'),
      castHeld: down.has('cast'),
      shieldHeld: down.has('shield'),
      healPressed: down.has('heal') && !this.previous.has('heal'),
      airBurstPressed: down.has('airBurst') && !this.previous.has('airBurst'),
      groundSmashPressed: down.has('groundSmash') && !this.previous.has('groundSmash'),
      interactPressed: down.has('interact') && !this.previous.has('interact'),
      aimX: aim.x,
      aimY: aim.y,
      aimVisible: overCanvas,
    };
    this.previous.clear();
    down.forEach((action) => this.previous.add(action));
    return frame;
  }

  reset(): void {
    this.previous.clear();
    this.held.forEach((code) => this.blockedKeys.add(code));
    this.heldButtons.forEach((button) => this.blockedButtons.add(button));
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
