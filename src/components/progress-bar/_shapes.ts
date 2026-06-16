// Internal radial-shape helpers shared by LoadingIndicator (morph
// polygons) and Circle (wavy ring). Not exported from public barrels.

/** Radial profile: returns the radius for a given angle. */
export type Profile = (theta: number) => number;

/** Sample a profile into points around `center`. */
export function sampleProfile(
  profile: Profile,
  points: number,
  center = 0,
): [number, number][] {
  return Array.from({length: points}, (_, i) => {
    const theta = (2 * Math.PI * i) / points;
    const r = profile(theta);
    return [center + r * Math.cos(theta), center + r * Math.sin(theta)] as [
      number,
      number,
    ];
  });
}

/** Closed smooth path (Catmull-Rom → cubic Bézier). Paths built from the
 * same number of points share command structure, so SMIL interpolates
 * between them. */
export function toPath(points: [number, number][]): string {
  const d = [`M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d.push(
      `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`,
    );
  }
  return d.join("") + "Z";
}

/** Perimeter of a sampled closed outline. */
export function outlineLength(points: [number, number][]): number {
  let length = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    length += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return length;
}
