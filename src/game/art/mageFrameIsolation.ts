export function isolateMageArtwork(
  pixels: Uint8ClampedArray, width: number, height: number, orbX: number, orbY: number,
  anchor: readonly [number, number], preserveAura = false, preserveShield = false,
): void {
  const labels = new Uint32Array(width * height);
  const queue = new Uint32Array(labels.length);
  let nextLabel = 0;
  let bodyLabel = 0;
  let bodySize = 0;
  let bodyScore = 0;
  let orbLabel = 0;
  let orbDistance = Infinity;
  const auraLabels = new Set<number>();
  for (let pixel = 0; pixel < labels.length; pixel++) {
    if (labels[pixel] || pixels[pixel * 4 + 3]! < 12) continue;
    const label = ++nextLabel;
    let first = 0;
    let count = 1;
    queue[0] = pixel;
    labels[pixel] = label;
    let componentX = 0;
    let componentY = 0;
    let corePixels = 0;
    while (first < count) {
      const current = queue[first++]!;
      const column = current % width;
      const row = Math.floor(current / width);
      componentX += column;
      componentY += row;
      if (Math.abs(column - anchor[0]) <= 35 && row >= anchor[1] - 125 && row <= anchor[1] - 45) corePixels++;
      const distance = (column - orbX) ** 2 + (row - orbY) ** 2;
      if (distance < orbDistance && distance < 18 ** 2) {
        orbDistance = distance;
        orbLabel = label;
      }
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        const neighborY = row + offsetY;
        if (neighborY < 0 || neighborY >= height) continue;
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
          const neighborX = column + offsetX;
          if (neighborX < 0 || neighborX >= width) continue;
          const neighbor = neighborY * width + neighborX;
          if (!labels[neighbor] && pixels[neighbor * 4 + 3]! >= 12) {
            labels[neighbor] = label;
            queue[count++] = neighbor;
          }
        }
      }
    }
    if (corePixels > bodyScore || (corePixels === bodyScore && count > bodySize)) {
      bodySize = count;
      bodyLabel = label;
      bodyScore = corePixels;
    }
    if (preserveAura && count > 160 && componentY / count > anchor[1] - 45
      && Math.abs(componentX / count - anchor[0]) < 110) {
      auraLabels.add(label);
    }
    if (preserveShield && count > 80 && componentX / count > anchor[0] + 20
      && componentY / count > anchor[1] - 210) auraLabels.add(label);
  }
  for (let pixel = 0; pixel < labels.length; pixel++) {
    const label = labels[pixel]!;
    if (label === bodyLabel || (orbLabel > 0 && label === orbLabel) || auraLabels.has(label)) continue;
    let softEdge = false;
    if (label === 0 && pixels[pixel * 4 + 3]! > 0) {
      const column = pixel % width;
      const row = Math.floor(pixel / width);
      for (let offsetY = -1; offsetY <= 1 && !softEdge; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
          const neighborX = column + offsetX;
          const neighborY = row + offsetY;
          if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height) continue;
          const neighborLabel = labels[neighborY * width + neighborX]!;
          if (neighborLabel === bodyLabel || (orbLabel > 0 && neighborLabel === orbLabel)
            || auraLabels.has(neighborLabel)) softEdge = true;
        }
      }
    }
    if (!softEdge) pixels[pixel * 4 + 3] = 0;
  }
}
