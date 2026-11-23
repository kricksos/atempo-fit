export function extendedBrightEdges(thumbnail, info, width, height, canvasWidth, canvasHeight) {
  const flagged = [];
  for (const edge of ["left", "right", "top", "bottom"]) {
    if ((edge === "left" || edge === "right") && canvasWidth === width) continue;
    if ((edge === "top" || edge === "bottom") && canvasHeight === height) continue;
    const length = edge === "left" || edge === "right" ? info.height : info.width;
    let brightPixels = 0;
    for (let i = 0; i < length; i++) {
      const x = edge === "left" ? 0 : edge === "right" ? info.width - 1 : i;
      const y = edge === "top" ? 0 : edge === "bottom" ? info.height - 1 : i;
      const index = (y * info.width + x) * 3;
      if (Math.max(thumbnail[index], thumbnail[index + 1], thumbnail[index + 2]) >= 60) brightPixels++;
    }
    if (brightPixels >= 3 && brightPixels / length >= 0.015) flagged.push(edge);
  }
  return flagged;
}
