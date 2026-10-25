import { BALANCE } from '../config';

export type Action = 'left' | 'right' | 'jump' | 'cast' | 'shield' | 'heal' | 'airBurst' | 'groundSmash' | 'interact';

export interface ActionFrame {
  move: number;
  jumpPressed: boolean;
  jumpHeld: boolean;
  castHeld: boolean;
  shieldHeld: boolean;
  healPressed: boolean;
  airBurstPressed: boolean;
  groundSmashPressed: boolean;
  interactPressed: boolean;
  aimX: number;
  aimY: number;
  aimVisible: boolean;
}

export const KEY_BINDINGS: Record<Action, readonly string[]> = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  jump: ['Space', 'KeyW', 'ArrowUp'],
  cast: ['KeyJ'],
  shield: ['ShiftLeft', 'ShiftRight', 'KeyK'],
  heal: ['KeyR'],
  airBurst: ['KeyF'],
  groundSmash: ['KeyS', 'ArrowDown'],
  interact: ['KeyE'],
};

export const CONTROL_HINTS = [
  { keys: ['A', 'D'], label: 'Move', detail: 'or ← / →' },
  { keys: ['Space'], label: 'Jump', detail: 'W / ↑ · again: air jump (2.5s)' },
  { keys: ['Mouse'], label: 'Aim', detail: 'follow the sigil' },
  { keys: ['LMB'], label: 'Spectral Bolt', detail: 'free · or J' },
  { keys: ['RMB'], label: 'Arcane Protection', detail: 'hold · Shift / K' },
  { keys: ['F'], label: 'Breath of Sylf', detail: `${BALANCE.airBurst.cost} essence · ${BALANCE.airBurst.cooldownMs / 1000}s` },
  { keys: ['S', '↓'], label: 'Terra Strike', detail: `${BALANCE.groundSmash.cost} essence · midair · ${BALANCE.groundSmash.cooldownMs / 1000}s` },
  { keys: ['R'], label: 'Blessing of Light', detail: `${BALANCE.healing.cost} essence · stand still` },
  { keys: ['E'], label: 'Interact', detail: 'attune / enter' },
  { keys: ['Esc', 'P'], label: 'Pause / resume', detail: 'P always available' },
] as const;
