import Phaser from 'phaser';
import { BALANCE } from '../config';
import { ARENA, type PlatformSpec } from '../world/arenaData';

interface RouteStep {
  destination: PlatformSpec;
  launchX: number;
  landingX: number;
}

export interface PursuitPlan {
  targetX: number;
  jump: boolean;
  landingX: number;
}

export class PlatformNavigation {
  private readonly routes = new Map<PlatformSpec, RouteStep[]>();
  private readonly margin = 22;

  constructor() {
    for (const source of ARENA.platforms) {
      const connections: RouteStep[] = [];
      for (const destination of ARENA.platforms) {
        if (source === destination) continue;
        const connection = this.connect(source, destination);
        if (connection) connections.push(connection);
      }
      this.routes.set(source, connections);
    }
  }

  pursue(body: Phaser.Physics.Arcade.Body, target: Phaser.Physics.Arcade.Body, gateOpen: boolean): PursuitPlan {
    const source = this.surfaceAt(body.center.x, body.bottom);
    const destination = this.surfaceAt(target.center.x, target.bottom);
    let targetX = target.center.x;
    let landingX = targetX;
    let jump = false;
    if (source && destination && source !== destination) {
      const step = this.findStep(source, destination, gateOpen);
      if (step) {
        targetX = step.launchX;
        landingX = step.landingX;
        jump = Math.abs(body.center.x - targetX) <= 12;
      } else {
        targetX = Phaser.Math.Clamp(targetX, source.x + this.margin, source.x + source.width - this.margin);
      }
    } else if (source) {
      targetX = Phaser.Math.Clamp(targetX, source.x + this.margin, source.x + source.width - this.margin);
    }
    const barrierX = this.beforeGate(body.center.x, targetX, gateOpen);
    if (barrierX !== targetX) jump = false;
    return { targetX: barrierX, jump, landingX };
  }

  safeDirection(body: Phaser.Physics.Arcade.Body, direction: number, gateOpen: boolean): boolean {
    const aheadX = body.center.x + direction * 44;
    if (this.beforeGate(body.center.x, aheadX, gateOpen) !== aheadX) return false;
    return ARENA.platforms.some((platform) => aheadX >= platform.x && aheadX <= platform.x + platform.width
      && Math.abs(platform.y - body.bottom) <= 12);
  }

  clearOfGate(fromX: number, targetX: number, gateOpen: boolean): boolean {
    return this.beforeGate(fromX, targetX, gateOpen) === targetX;
  }

  canShoot(fromX: number, fromY: number, targetX: number, targetY: number, gateOpen: boolean): boolean {
    if (!this.clearOfGate(fromX, targetX, gateOpen)) return false;
    const sight = new Phaser.Geom.Line(fromX, fromY, targetX, targetY);
    return !ARENA.platforms.some((platform) => Phaser.Geom.Intersects.LineToRectangle(sight,
      new Phaser.Geom.Rectangle(platform.x - 5, platform.y - 5, platform.width + 10, platform.height + 10)));
  }

  private surfaceAt(positionX: number, feetY: number): PlatformSpec | undefined {
    return ARENA.platforms.filter((platform) => positionX >= platform.x - 8 && positionX <= platform.x + platform.width + 8
      && platform.y >= feetY - 12).sort((first, second) => first.y - second.y)[0];
  }

  private connect(source: PlatformSpec, destination: PlatformSpec): RouteStep | undefined {
    const sourceLeft = source.x + this.margin;
    const sourceRight = source.x + source.width - this.margin;
    const destinationLeft = destination.x + this.margin;
    const destinationRight = destination.x + destination.width - this.margin;
    let launchX = Phaser.Math.Clamp((destinationLeft + destinationRight) / 2, sourceLeft, sourceRight);
    let landingX = Phaser.Math.Clamp(launchX, destinationLeft, destinationRight);
    if (destination.y > source.y && destinationLeft < sourceRight && destinationRight > sourceLeft) {
      const exits = [
        { launchX: sourceLeft, landingX: source.x - 40 },
        { launchX: sourceRight, landingX: source.x + source.width + 40 },
      ].filter((exit) => exit.landingX >= destinationLeft && exit.landingX <= destinationRight);
      const exit = exits[0];
      if (!exit) return undefined;
      launchX = exit.launchX;
      landingX = exit.landingX;
    }
    const rise = source.y - destination.y;
    const discriminant = BALANCE.enemy.jumpSpeed ** 2 - 2 * BALANCE.gravity * rise;
    if (discriminant < 0) return undefined;
    const flightSeconds = (BALANCE.enemy.jumpSpeed + Math.sqrt(discriminant)) / BALANCE.gravity;
    if (Math.abs(landingX - launchX) > BALANCE.enemy.chaseSpeed * flightSeconds - 12) return undefined;
    return { destination, launchX, landingX };
  }

  private findStep(source: PlatformSpec, destination: PlatformSpec, gateOpen: boolean): RouteStep | undefined {
    const visited = new Set<PlatformSpec>([source]);
    const queue: { platform: PlatformSpec; first?: RouteStep }[] = [{ platform: source }];
    for (let index = 0; index < queue.length; index++) {
      const entry = queue[index];
      if (!entry) continue;
      for (const step of this.routes.get(entry.platform) ?? []) {
        if (visited.has(step.destination)
          || this.beforeGate(step.launchX, step.landingX, gateOpen) !== step.landingX) continue;
        const first = entry.first ?? step;
        if (step.destination === destination) return first;
        visited.add(step.destination);
        queue.push({ platform: step.destination, first });
      }
    }
    return undefined;
  }

  private beforeGate(fromX: number, targetX: number, gateOpen: boolean): number {
    if (gateOpen) return targetX;
    const left = ARENA.gate.x - ARENA.gate.width / 2 - this.margin;
    const right = ARENA.gate.x + ARENA.gate.width / 2 + this.margin;
    return fromX < ARENA.gate.x ? Math.min(targetX, left) : Math.max(targetX, right);
  }
}
