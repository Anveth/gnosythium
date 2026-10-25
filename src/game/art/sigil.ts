import type Phaser from 'phaser';

export function drawSigil(
  brush: Phaser.GameObjects.Graphics,
  centerX: number,
  centerY: number,
  radius: number,
  color: number,
  rotation = 0,
): void {
  brush.lineStyle(1.5, color, 0.85);
  brush.strokeCircle(centerX, centerY, radius);
  brush.strokeCircle(centerX, centerY, radius * 0.77);
  const vertices = Array.from({ length: 5 }, (_, index) => {
    const angle = rotation - Math.PI / 2 + index * Math.PI * 2 / 5;
    return { x: centerX + Math.cos(angle) * radius * 0.64, y: centerY + Math.sin(angle) * radius * 0.64 };
  });
  vertices.forEach((vertex, index) => {
    const next = vertices[(index + 2) % vertices.length];
    if (next) brush.lineBetween(vertex.x, vertex.y, next.x, next.y);
  });
  for (let index = 0; index < 12; index++) {
    const angle = index * Math.PI / 6 + rotation;
    brush.lineBetween(
      centerX + Math.cos(angle) * radius * 0.88, centerY + Math.sin(angle) * radius * 0.88,
      centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius,
    );
  }
}
