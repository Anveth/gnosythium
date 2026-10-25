import type Phaser from 'phaser';

type Point = readonly [number, number];

function curve(start: Point, firstControl: Point, secondControl: Point, end: Point): Point[] {
  return Array.from({ length: 13 }, (_, index) => {
    const progress = index / 12;
    const inverse = 1 - progress;
    return [
      inverse ** 3 * start[0] + 3 * inverse ** 2 * progress * firstControl[0]
        + 3 * inverse * progress ** 2 * secondControl[0] + progress ** 3 * end[0],
      inverse ** 3 * start[1] + 3 * inverse ** 2 * progress * firstControl[1]
        + 3 * inverse * progress ** 2 * secondControl[1] + progress ** 3 * end[1],
    ];
  });
}

const VERTICAL_FORKS = [
  curve([0, 5.3], [1.15, 5.9], [1.7, 6.5], [1.5, 7.3]),
];
const HORIZONTAL_FORKS = [
  curve([4.7, 0], [5.5, 0.85], [6.7, 1.1], [7.5, 0.85]),
];
const SIDE_SCROLL = [
  ...curve([4.65, -3], [5.9, -3.75], [5.1, -5.1], [3.6, -4.8]),
  ...curve([3.6, -4.8], [2, -4.6], [1.4, -3.95], [1.4, -2.9]),
  [1.4, 2.9] as const,
  ...curve([1.4, 2.9], [1.4, 3.95], [2, 4.6], [3.6, 4.8]),
  ...curve([3.6, 4.8], [5.1, 5.1], [5.9, 3.75], [4.65, 3]),
];

function strokeMirrored(
  brush: Phaser.GameObjects.Graphics, x: number, y: number,
  points: readonly Point[], mirrorX: number, mirrorY: number,
): void {
  const first = points[0];
  if (!first) return;
  brush.beginPath().moveTo(x + first[0] * mirrorX, y + first[1] * mirrorY);
  for (const [offsetX, offsetY] of points) {
    brush.lineTo(x + offsetX * mirrorX, y + offsetY * mirrorY);
  }
  brush.strokePath();
}

export function drawAimMark(brush: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
  brush.lineStyle(1.05, color, 0.95);
  for (const direction of [-1, 1]) {
    brush.lineBetween(x, y + direction * 1.2, x, y + direction * 10);
    brush.lineBetween(x + direction * 1.2, y, x + direction * 10, y);
    for (const points of VERTICAL_FORKS) {
      for (const side of [-1, 1]) {
        strokeMirrored(brush, x, y, points, side, direction);
      }
    }
    for (const points of HORIZONTAL_FORKS) {
      for (const side of [-1, 1]) {
        strokeMirrored(brush, x, y, points, direction, side);
      }
    }
  }
  brush.lineStyle(1, color, 0.88);
  for (const side of [-1, 1]) {
    strokeMirrored(brush, x, y, SIDE_SCROLL, side, 1);
  }
}
