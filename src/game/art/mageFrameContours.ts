import type { MageFrame } from './mageAtlas';
import { getMageCombatContours } from './mageCombatContours';

type Point = readonly [number, number];
export type Contour = readonly Point[];

const RUN_BODY: Contour = [
  [22, -180], [63, -154], [77, -119], [55, -96], [70, -78], [52, -60],
  [66, -25], [60, 1], [20, 1], [0, -10], [-25, 1], [-72, -7], [-68, -36],
  [-112, -49], [-112, -90], [-48, -115], [-22, -140],
];
const WALK_BODY: Contour = [
  [-4, -188], [36, -174], [58, -140], [47, -108], [46, -76], [51, -17],
  [45, 1], [7, 1], [-6, -10], [-29, 1], [-93, -4], [-79, -41],
  [-120, -55], [-94, -105], [-38, -134],
];
const JUMP_BODY: Contour = [
  [-26, -194], [21, -184], [60, -144], [59, -105], [61, -73], [37, -47],
  [38, 1], [-65, 1], [-77, -30], [-136, -47],
  [-136, -94], [-72, -133],
];
const CAST_BODY: Contour = [
  [-35, -216], [37, -211], [60, -170], [38, -135], [64, -113], [61, -95],
  [35, -89], [51, -23], [47, 2], [10, 2], [-6, -10], [-32, 2], [-58, -2],
  [-54, -29], [-111, -43], [-107, -78], [-69, -119], [-38, -151],
];
const CAST_FOLLOW_BODY: Contour = [
  [-15, -205], [40, -200], [60, -165], [40, -135], [65, -115], [61, -95],
  [35, -89], [51, -23], [47, 2], [10, 2], [-6, -10], [-32, 2], [-58, -2],
  [-54, -29], [-111, -43], [-107, -78], [-45, -118], [-25, -142],
];
const LAND_BODY: Contour = [
  [-70, -200], [50, -200], [70, -90], [65, 2], [-82, 2], [-140, -60], [-120, -130],
];

function staffContours(frame: MageFrame): Contour[] {
  const orbX = frame.orb[0] - frame.anchor[0];
  const orbY = frame.orb[1] - frame.anchor[1];
  const casting = frame.name.startsWith('cast-');
  const uprightCast = frame.name === 'cast-0' || frame.name === 'cast-5';
  const running = frame.name.startsWith('run-');
  const footX = casting && !uprightCast ? 35 : uprightCast ? orbX - 16
    : running ? orbX - 45 : frame.name.includes('jump') || frame.name.startsWith('double-') ? orbX - 18 : orbX - 34;
  const footY = casting && !uprightCast ? -108 : -7;
  const length = Math.hypot(footX - orbX, footY - orbY);
  const normalX = -(footY - orbY) / Math.max(1, length) * 7;
  const normalY = (footX - orbX) / Math.max(1, length) * 7;
  const orb: Point[] = Array.from({ length: 16 }, (_, index) => {
    const angle = index * Math.PI / 8;
    return [orbX + Math.cos(angle) * 25, orbY + Math.sin(angle) * 25];
  });
  return [orb, [
    [orbX - normalX, orbY - normalY], [footX - normalX, footY - normalY],
    [footX + normalX, footY + normalY], [orbX + normalX, orbY + normalY],
  ]];
}

export function getMageFrameContours(frame: MageFrame): readonly Contour[] | undefined {
  const combat = getMageCombatContours(frame);
  if (combat) {
    const hasStaff = frame.name === 'block-0' || frame.name === 'block-1';
    return hasStaff ? [...combat, ...staffContours(frame)] : combat;
  }
  if (frame.name.startsWith('run-')) return [RUN_BODY, ...staffContours(frame)];
  if (frame.name.startsWith('walk-')) return [WALK_BODY, ...staffContours(frame)];
  if (frame.name.startsWith('cast-')) return [frame.name === 'cast-4' ? CAST_FOLLOW_BODY : CAST_BODY, ...staffContours(frame)];
  if (frame.name.startsWith('land-')) return [LAND_BODY, ...staffContours(frame)];
  if (frame.name.startsWith('jump-') || frame.name.startsWith('double-')) {
    const contours = [JUMP_BODY, ...staffContours(frame)];
    if (frame.name.startsWith('double-')) {
      contours.push([[-110, -45], [-28, -60], [25, -28], [24, 35], [-37, 52], [-109, 20]]);
    }
    return contours;
  }
  return undefined;
}
