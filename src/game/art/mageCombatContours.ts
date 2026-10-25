import type { MageFrame } from './mageAtlas';
import type { Contour } from './mageFrameContours';

const BODY: Readonly<Record<string, Contour>> = {
  'hurt-2': [
    [527, 1239], [548, 1215], [572, 1203], [592, 1173], [598, 1148],
    [621, 1131], [649, 1147], [674, 1123], [713, 1134], [731, 1157],
    [730, 1187], [712, 1204], [702, 1207], [710, 1220], [696, 1227],
    [692, 1238], [675, 1238], [677, 1256], [646, 1264], [624, 1257],
    [613, 1244], [594, 1257], [556, 1257], [545, 1244],
  ],
  'block-0': [
    [108, 610], [155, 638], [165, 670], [150, 691], [171, 699], [170, 719],
    [154, 733], [166, 766], [181, 797], [139, 799], [115, 773], [91, 773],
    [76, 800], [31, 800], [31, 778], [45, 751], [15, 763], [17, 721],
    [25, 683], [77, 660],
  ],
  'block-1': [
    [286, 611], [329, 635], [345, 667], [329, 688], [355, 698], [353, 721],
    [343, 743], [359, 773], [378, 799], [335, 800], [312, 775], [286, 774],
    [271, 800], [228, 800], [227, 779], [240, 753], [205, 765], [210, 723],
    [224, 690], [254, 664],
  ],
  'block-2': [
    [507, 625], [548, 644], [564, 674], [546, 695], [569, 701], [565, 725],
    [550, 746], [569, 775], [593, 799], [547, 801], [525, 777], [502, 777],
    [484, 801], [432, 801], [435, 778], [449, 751], [413, 766], [416, 726],
    [432, 697], [471, 672],
  ],
};

const SHIELDS: Readonly<Record<string, readonly [number, number, number, number, number]>> = {
  'block-1': [390, 700, 32, 80, 0],
  'block-2': [587, 705, 40, 83, 0],
};

export function getMageShieldBounds(frame: MageFrame): readonly [number, number, number, number, number] | undefined {
  return SHIELDS[frame.name];
}

export function getMageCombatContours(frame: MageFrame): readonly Contour[] | undefined {
  const body = BODY[frame.name];
  if (!body) return undefined;
  const contours = [body];
  const shield = getMageShieldBounds(frame);
  if (shield) {
    const [centerX, centerY, radiusX, radiusY, rotation] = shield;
    contours.push(Array.from({ length: 48 }, (_, index) => {
      const angle = index * Math.PI / 24;
      const offsetX = Math.cos(angle) * radiusX;
      const offsetY = Math.sin(angle) * radiusY;
      return [centerX + offsetX * Math.cos(rotation) - offsetY * Math.sin(rotation),
        centerY + offsetX * Math.sin(rotation) + offsetY * Math.cos(rotation)];
    }));
  }
  return contours.map(contour => contour.map(([sourceX, sourceY]) => [
    sourceX - frame.crop[0] - frame.anchor[0], sourceY - frame.crop[1] - frame.anchor[1],
  ]));
}
