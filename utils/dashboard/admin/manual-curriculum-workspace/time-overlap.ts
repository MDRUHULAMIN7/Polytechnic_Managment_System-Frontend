/** Shared time overlap for adjacent-safe contiguous period blocks (string HH:MM). */
export function doTimeRangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((x) => Number(x));
    return h * 60 + m;
  };
  const a0 = toMin(firstStart);
  const a1 = toMin(firstEnd);
  const b0 = toMin(secondStart);
  const b1 = toMin(secondEnd);
  return a0 < b1 && a1 > b0;
}
