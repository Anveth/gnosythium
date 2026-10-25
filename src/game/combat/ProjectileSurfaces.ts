import Phaser from 'phaser';

export function createProjectileSurfaces(
  scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup,
): Phaser.Physics.Arcade.StaticGroup {
  const surfaces = scene.physics.add.staticGroup();
  for (const platform of platforms.getChildren()) {
    const body = platform.body;
    if (!(body instanceof Phaser.Physics.Arcade.StaticBody)) continue;
    const surface = scene.add.zone(body.center.x, body.center.y, body.width, body.height);
    scene.physics.add.existing(surface, true);
    surfaces.add(surface);
  }
  return surfaces;
}
