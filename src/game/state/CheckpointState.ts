export interface SpawnPoint {
  x: number;
  y: number;
}

export interface CheckpointSnapshot {
  spawn: SpawnPoint;
  sealActivated: boolean;
  checkpointActivated: boolean;
}

export class CheckpointState {
  private snapshot: CheckpointSnapshot = {
    spawn: { x: 160, y: 660 },
    sealActivated: false,
    checkpointActivated: false,
  };

  activate(spawn: SpawnPoint, sealActivated: boolean): void {
    this.snapshot = { spawn: { ...spawn }, sealActivated, checkpointActivated: true };
  }

  restore(): CheckpointSnapshot {
    return { ...this.snapshot, spawn: { ...this.snapshot.spawn } };
  }
}
