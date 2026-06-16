/*
 * gen-loading-indicator.mjs
 *
 * Self-contained, ZERO-dependency Node ESM port of Google's
 * `androidx.graphics.shapes` geometry library + the Compose
 * `LoadingIndicator` shape logic, generating EXACT SVG morph keyframe data
 * for the M3 Expressive indeterminate loading indicator.
 *
 * This is a FAITHFUL line-by-line port of the official Kotlin algorithm
 * (so the output is exact by construction), not a re-implementation or a
 * radial-profile approximation.
 *
 * Sources ported (read from /tmp/gshapes — the REAL AOSP source files,
 * version pairing androidx.graphics.shapes 1.0.x with compose-material3 1.4
 * expressive):
 *   - Point.kt, Utils.kt, CornerRounding.kt, Cubic.kt
 *   - RoundedPolygon.kt (the corner-rounding core), Shapes.kt (star/circle)
 *   - Features.kt + FeatureDetector.kt (Feature/Edge/Corner + detectFeatures)
 *   - FeatureMapping.kt, FloatMapping.kt, Morph.kt
 *   - PolygonMeasure.kt (Measurer/LengthMeasurer/MeasuredPolygon/cutAndShift)
 *   - MaterialShapes.kt (the 7 indeterminate shapes + customPolygon/doRepeat)
 *   - LoadingIndicator_compose.kt (morphSequence / calculateScaleFactor /
 *     ActiveIndicatorScale / IndeterminateIndicatorPolygons / draw transform)
 *
 * The feature-matching pipeline (Features.kt, FeatureDetector.kt,
 * PolygonMeasure.kt, and Morph.match / FeatureMapping) is ported 1:1 from
 * these downloaded files — NOT reconstructed from memory. The matching is what
 * makes a morph between two similarly-sized shapes interpolate smoothly without
 * collapsing through the center; the per-morph no-collapse check at the bottom
 * of this file asserts that property (no intermediate extent < 85% of the
 * smaller endpoint's extent).
 *
 * Run: `node scripts/gen-loading-indicator.mjs`
 * Writes: /tmp/loader-out.json and /tmp/shape-<name>.svg (sanity renders).
 */

import {writeFileSync} from "node:fs";

/* =========================================================================
 * Point.kt + Utils.kt  (a Point is a plain [x, y] tuple here)
 * ========================================================================= */

const DistanceEpsilon = 1e-4;
const AngleEpsilon = 1e-6;
// Utils.kt: relaxed epsilon for collinearity (people read collinearity loosely).
const RelaxedDistanceEpsilon = 5e-3;
const FloatPi = Math.PI; // Kotlin uses PI.toFloat(); JS doubles, see note at end
const TwoPi = 2 * Math.PI;

const Zero = [0, 0];

const pDistance = (p) => Math.sqrt(p[0] * p[0] + p[1] * p[1]);
const pDistanceSquared = (p) => p[0] * p[0] + p[1] * p[1];
const pDot = (a, b) => a[0] * b[0] + a[1] * b[1];
const pDotXY = (p, x, y) => p[0] * x + p[1] * y;
// Cross product z-sign: is `other` clockwise (>0) from `p`?
const pClockwise = (p, other) => p[0] * other[1] - p[1] * other[0] > 0;
const pMinus = (a, b) => [a[0] - b[0], a[1] - b[1]];
const pPlus = (a, b) => [a[0] + b[0], a[1] + b[1]];
const pTimes = (p, s) => [p[0] * s, p[1] * s];
const pDiv = (p, s) => [p[0] / s, p[1] / s];
const pRotate90 = (p) => [-p[1], p[0]];

function pGetDirection(p) {
  const d = pDistance(p);
  if (!(d > 0)) throw new Error("Can't get the direction of a 0-length vector");
  return pDiv(p, d);
}

const distance = (x, y) => Math.sqrt(x * x + y * y);
const distanceSquared = (x, y) => x * x + y * y;

function directionVectorXY(x, y) {
  const d = distance(x, y);
  if (!(d > 0)) throw new Error("Required distance greater than zero");
  return [x / d, y / d];
}
const directionVectorAngle = (a) => [Math.cos(a), Math.sin(a)];

function radialToCartesian(radius, angleRadians, center = Zero) {
  return pPlus(pTimes(directionVectorAngle(angleRadians), radius), center);
}

const square = (x) => x * x;
const interpolate = (start, stop, fraction) =>
  (1 - fraction) * start + fraction * stop;
function interpolatePoint(start, stop, fraction) {
  return [
    interpolate(start[0], stop[0], fraction),
    interpolate(start[1], stop[1], fraction),
  ];
}
const positiveModulo = (num, mod) => ((num % mod) + mod) % mod;

// convex(): approximates whether the corner at `current` is convex.
function convex(previous, current, next) {
  return pClockwise(pMinus(current, previous), pMinus(next, current));
}

// collinearIsh (Utils.kt): whether C is on the line AB, within tolerance.
function collinearIsh(aX, aY, bX, bY, cX, cY, tolerance = DistanceEpsilon) {
  // Dot product of a perpendicular angle is 0. Rotating one vector avoids the
  // dot->degrees conversion afterwards.
  const ab = pRotate90([bX - aX, bY - aY]);
  const ac = [cX - aX, cY - aY];
  const dotProduct = Math.abs(pDot(ab, ac));
  const relativeTolerance = tolerance * pDistance(ab) * pDistance(ac);
  return dotProduct < tolerance || dotProduct < relativeTolerance;
}

/* =========================================================================
 * Cubic.kt
 * ========================================================================= */

class Cubic {
  // points = [a0x,a0y,c0x,c0y,c1x,c1y,a1x,a1y]
  constructor(points) {
    if (points.length !== 8) throw new Error("Points array size should be 8");
    this.points = points;
  }
  static of(a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y) {
    return new Cubic([a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y]);
  }
  static fromPoints(anchor0, control0, control1, anchor1) {
    return new Cubic([
      anchor0[0],
      anchor0[1],
      control0[0],
      control0[1],
      control1[0],
      control1[1],
      anchor1[0],
      anchor1[1],
    ]);
  }
  get anchor0X() {
    return this.points[0];
  }
  get anchor0Y() {
    return this.points[1];
  }
  get control0X() {
    return this.points[2];
  }
  get control0Y() {
    return this.points[3];
  }
  get control1X() {
    return this.points[4];
  }
  get control1Y() {
    return this.points[5];
  }
  get anchor1X() {
    return this.points[6];
  }
  get anchor1Y() {
    return this.points[7];
  }

  pointOnCurve(t) {
    const u = 1 - t;
    const p = this.points;
    return [
      p[0] * (u * u * u) +
        p[2] * (3 * t * u * u) +
        p[4] * (3 * t * t * u) +
        p[6] * (t * t * t),
      p[1] * (u * u * u) +
        p[3] * (3 * t * u * u) +
        p[5] * (3 * t * t * u) +
        p[7] * (t * t * t),
    ];
  }

  zeroLength() {
    return (
      Math.abs(this.anchor0X - this.anchor1X) < DistanceEpsilon &&
      Math.abs(this.anchor0Y - this.anchor1Y) < DistanceEpsilon
    );
  }

  convexTo(next) {
    const prevVertex = [this.anchor0X, this.anchor0Y];
    const currVertex = [this.anchor1X, this.anchor1Y];
    const nextVertex = [next.anchor1X, next.anchor1Y];
    return convex(prevVertex, currVertex, nextVertex);
  }

  static _zeroIsh(value) {
    return Math.abs(value) < DistanceEpsilon;
  }

  // Faithful port of Cubic.calculateBounds (exact, not approximate path).
  calculateBounds(bounds = new Float64Array(4), approximate = false) {
    if (this.zeroLength()) {
      bounds[0] = this.anchor0X;
      bounds[1] = this.anchor0Y;
      bounds[2] = this.anchor0X;
      bounds[3] = this.anchor0Y;
      return bounds;
    }
    let minX = Math.min(this.anchor0X, this.anchor1X);
    let minY = Math.min(this.anchor0Y, this.anchor1Y);
    let maxX = Math.max(this.anchor0X, this.anchor1X);
    let maxY = Math.max(this.anchor0Y, this.anchor1Y);

    if (approximate) {
      bounds[0] = Math.min(minX, Math.min(this.control0X, this.control1X));
      bounds[1] = Math.min(minY, Math.min(this.control0Y, this.control1Y));
      bounds[2] = Math.max(maxX, Math.max(this.control0X, this.control1X));
      bounds[3] = Math.max(maxY, Math.max(this.control0Y, this.control1Y));
      return bounds;
    }

    const xa =
      -this.anchor0X + 3 * this.control0X - 3 * this.control1X + this.anchor1X;
    const xb = 2 * this.anchor0X - 4 * this.control0X + 2 * this.control1X;
    const xc = -this.anchor0X + this.control0X;

    if (Cubic._zeroIsh(xa)) {
      if (xb !== 0) {
        const t = (2 * xc) / (-2 * xb);
        if (t >= 0 && t <= 1) {
          const v = this.pointOnCurve(t)[0];
          if (v < minX) minX = v;
          if (v > maxX) maxX = v;
        }
      }
    } else {
      const xs = xb * xb - 4 * xa * xc;
      if (xs >= 0) {
        const t1 = (-xb + Math.sqrt(xs)) / (2 * xa);
        if (t1 >= 0 && t1 <= 1) {
          const v = this.pointOnCurve(t1)[0];
          if (v < minX) minX = v;
          if (v > maxX) maxX = v;
        }
        const t2 = (-xb - Math.sqrt(xs)) / (2 * xa);
        if (t2 >= 0 && t2 <= 1) {
          const v = this.pointOnCurve(t2)[0];
          if (v < minX) minX = v;
          if (v > maxX) maxX = v;
        }
      }
    }

    const ya =
      -this.anchor0Y + 3 * this.control0Y - 3 * this.control1Y + this.anchor1Y;
    const yb = 2 * this.anchor0Y - 4 * this.control0Y + 2 * this.control1Y;
    const yc = -this.anchor0Y + this.control0Y;

    if (Cubic._zeroIsh(ya)) {
      if (yb !== 0) {
        const t = (2 * yc) / (-2 * yb);
        if (t >= 0 && t <= 1) {
          const v = this.pointOnCurve(t)[1];
          if (v < minY) minY = v;
          if (v > maxY) maxY = v;
        }
      }
    } else {
      const ys = yb * yb - 4 * ya * yc;
      if (ys >= 0) {
        const t1 = (-yb + Math.sqrt(ys)) / (2 * ya);
        if (t1 >= 0 && t1 <= 1) {
          const v = this.pointOnCurve(t1)[1];
          if (v < minY) minY = v;
          if (v > maxY) maxY = v;
        }
        const t2 = (-yb - Math.sqrt(ys)) / (2 * ya);
        if (t2 >= 0 && t2 <= 1) {
          const v = this.pointOnCurve(t2)[1];
          if (v < minY) minY = v;
          if (v > maxY) maxY = v;
        }
      }
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  // Cubic.split(t) — De Casteljau split into two cubics (geometry preserving).
  split(t) {
    const u = 1 - t;
    const p = this.points;
    const onCurve = this.pointOnCurve(t);
    return [
      Cubic.of(
        p[0],
        p[1],
        p[0] * u + p[2] * t,
        p[1] * u + p[3] * t,
        p[0] * (u * u) + p[2] * (2 * u * t) + p[4] * (t * t),
        p[1] * (u * u) + p[3] * (2 * u * t) + p[5] * (t * t),
        onCurve[0],
        onCurve[1],
      ),
      Cubic.of(
        onCurve[0],
        onCurve[1],
        p[2] * (u * u) + p[4] * (2 * u * t) + p[6] * (t * t),
        p[3] * (u * u) + p[5] * (2 * u * t) + p[7] * (t * t),
        p[4] * u + p[6] * t,
        p[5] * u + p[7] * t,
        p[6],
        p[7],
      ),
    ];
  }

  reverse() {
    return Cubic.of(
      this.anchor1X,
      this.anchor1Y,
      this.control1X,
      this.control1Y,
      this.control0X,
      this.control0Y,
      this.anchor0X,
      this.anchor0Y,
    );
  }

  plus(o) {
    const r = new Array(8);
    for (let i = 0; i < 8; i++) r[i] = this.points[i] + o.points[i];
    return new Cubic(r);
  }
  times(x) {
    const r = new Array(8);
    for (let i = 0; i < 8; i++) r[i] = this.points[i] * x;
    return new Cubic(r);
  }
  div(x) {
    return this.times(1 / x);
  }

  transformed(f) {
    const r = this.points.slice();
    for (let ix = 0; ix < 8; ix += 2) {
      const res = f(r[ix], r[ix + 1]);
      r[ix] = res[0];
      r[ix + 1] = res[1];
    }
    return new Cubic(r);
  }

  static straightLine(x0, y0, x1, y1) {
    return Cubic.of(
      x0,
      y0,
      interpolate(x0, x1, 1 / 3),
      interpolate(y0, y1, 1 / 3),
      interpolate(x0, x1, 2 / 3),
      interpolate(y0, y1, 2 / 3),
      x1,
      y1,
    );
  }

  static circularArc(centerX, centerY, x0, y0, x1, y1) {
    const p0d = directionVectorXY(x0 - centerX, y0 - centerY);
    const p1d = directionVectorXY(x1 - centerX, y1 - centerY);
    const rotatedP0 = pRotate90(p0d);
    const rotatedP1 = pRotate90(p1d);
    const clockwise = pDotXY(rotatedP0, x1 - centerX, y1 - centerY) >= 0;
    const cosa = pDot(p0d, p1d);
    if (cosa > 0.999) return Cubic.straightLine(x0, y0, x1, y1);
    const k =
      distance(x0 - centerX, y0 - centerY) *
      (4 / 3) *
      ((Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa)) / (1 - cosa)) *
      (clockwise ? 1 : -1);
    return Cubic.of(
      x0,
      y0,
      x0 + rotatedP0[0] * k,
      y0 + rotatedP0[1] * k,
      x1 - rotatedP1[0] * k,
      y1 - rotatedP1[1] * k,
      x1,
      y1,
    );
  }

  static empty(x0, y0) {
    return Cubic.of(x0, y0, x0, y0, x0, y0, x0, y0);
  }
}

// MutableCubic.interpolate is inlined where needed (Morph.asCubics builds new Cubics).

/* =========================================================================
 * Features.kt  (faithful 1:1 port of /tmp/gshapes/Features.kt — the real
 * source, NOT a from-memory reconstruction). Feature is the abstract base;
 * Edge / Corner are the two concrete subclasses. The convexity flag, the
 * reversed()-negates-convexity behaviour, the isEdge/isConvexCorner/
 * isConcaveCorner/isIgnorableFeature flags, and the buildXxx continuity
 * validation all match the Kotlin verbatim. `isCorner` is a JS convenience
 * (Kotlin uses `is Feature.Corner`) equal to `feature instanceof Corner`.
 * ========================================================================= */

class Feature {
  constructor(cubics) {
    this.cubics = cubics;
  }

  // Factory (companion object Factory in Kotlin).
  static buildIgnorableFeature(cubics) {
    return Feature._validated(new Edge(cubics));
  }
  static buildEdge(cubic) {
    return new Edge([cubic]);
  }
  static buildConvexCorner(cubics) {
    return Feature._validated(new Corner(cubics, true));
  }
  static buildConcaveCorner(cubics) {
    return Feature._validated(new Corner(cubics, false));
  }

  static _validated(feature) {
    if (feature.cubics.length === 0)
      throw new Error("Features need at least one cubic.");
    if (!Feature._isContinuous(feature))
      throw new Error(
        "Feature must be continuous, with the anchor points of all cubics " +
          "matching the anchor points of the preceding and succeeding cubics",
      );
    return feature;
  }

  static _isContinuous(feature) {
    let prevCubic = feature.cubics[0];
    for (let index = 1; index < feature.cubics.length; index++) {
      const cubic = feature.cubics[index];
      if (
        Math.abs(cubic.anchor0X - prevCubic.anchor1X) > DistanceEpsilon ||
        Math.abs(cubic.anchor0Y - prevCubic.anchor1Y) > DistanceEpsilon
      ) {
        return false;
      }
      prevCubic = cubic;
    }
    return true;
  }

  // `feature is Feature.Corner` convenience.
  get isCorner() {
    return this instanceof Corner;
  }
}

class Edge extends Feature {
  constructor(cubics) {
    super(cubics);
  }
  transformed(f) {
    const out = [];
    for (let i = 0; i < this.cubics.length; i++)
      out.push(this.cubics[i].transformed(f));
    return new Edge(out);
  }
  reversed() {
    const reversedCubics = [];
    for (let i = this.cubics.length - 1; i >= 0; i--)
      reversedCubics.push(this.cubics[i].reverse());
    return new Edge(reversedCubics);
  }
  get isIgnorableFeature() {
    return true;
  }
  get isEdge() {
    return true;
  }
  get isConvexCorner() {
    return false;
  }
  get isConcaveCorner() {
    return false;
  }
}

class Corner extends Feature {
  constructor(cubics, convex = true) {
    super(cubics);
    this.convex = convex;
  }
  transformed(f) {
    const out = [];
    for (let i = 0; i < this.cubics.length; i++)
      out.push(this.cubics[i].transformed(f));
    return new Corner(out, this.convex);
  }
  reversed() {
    const reversedCubics = [];
    for (let i = this.cubics.length - 1; i >= 0; i--)
      reversedCubics.push(this.cubics[i].reverse());
    // TODO(AOSP) b/369320447: Revert flag negation when RoundedPolygon ignores
    // orientation for setting the flag. Reversing a convex corner yields a concave
    // one and vice versa (verbatim from Features.kt — the previous from-memory copy
    // wrongly kept `convex` unchanged here).
    return new Corner(reversedCubics, !this.convex);
  }
  get isIgnorableFeature() {
    return false;
  }
  get isEdge() {
    return false;
  }
  get isConvexCorner() {
    return this.convex;
  }
  get isConcaveCorner() {
    return !this.convex;
  }
}

/* =========================================================================
 * FeatureDetector.kt  (faithful 1:1 port of /tmp/gshapes/FeatureDetector.kt)
 *
 * detectFeatures converts a list of Cubics into Features. NOTE: in the
 * executed path the 7 MaterialShapes are built by RoundedPolygon(vertices, …),
 * which assembles Corner/Edge features directly (see roundedPolygonFromVertices
 * below), so detectFeatures is NOT on the morph path here — it is ported for
 * completeness/fidelity and used only by the features-list RoundedPolygon
 * constructor. Helpers (straightIsh / smoothesIntoIsh / alignsIshWith /
 * Cubic.extend / asFeature) are ported verbatim.
 * ========================================================================= */

// Ported verbatim from FeatureDetector.kt for completeness; the 7
// MaterialShapes build their features directly (customPolygon/star/circle), so
// this entry point isn't exercised by the generated sequence.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectFeatures(cubics) {
  if (cubics.length === 0) return [];
  const out = [];
  let current = cubics[0];
  for (let i = 0; i < cubics.length; i++) {
    const next = cubics[(i + 1) % cubics.length];
    if (i < cubics.length - 1 && cubicAlignsIshWith(current, next)) {
      current = cubicExtend(current, next);
      continue;
    }
    out.push(cubicAsFeature(current, next));
    if (!cubicSmoothesIntoIsh(current, next)) {
      out.push(
        cubicAsFeature(Cubic.empty(current.anchor1X, current.anchor1Y), next),
      );
    }
    current = next;
  }
  return out;
}

// Cubic.asFeature(next): Edge for a straight line, else a (convex/concave) Corner.
function cubicAsFeature(cubic, next) {
  return cubicStraightIsh(cubic)
    ? new Edge([cubic])
    : new Corner([cubic], cubic.convexTo(next));
}

// Cubic.straightIsh(): close to a straight line (empty cubics don't count).
function cubicStraightIsh(c) {
  return (
    !c.zeroLength() &&
    collinearIsh(
      c.anchor0X,
      c.anchor0Y,
      c.anchor1X,
      c.anchor1Y,
      c.control0X,
      c.control0Y,
      RelaxedDistanceEpsilon,
    ) &&
    collinearIsh(
      c.anchor0X,
      c.anchor0Y,
      c.anchor1X,
      c.anchor1Y,
      c.control1X,
      c.control1Y,
      RelaxedDistanceEpsilon,
    )
  );
}

// Cubic.smoothesIntoIsh(next): next's first control reflects this' second control.
function cubicSmoothesIntoIsh(c, next) {
  return collinearIsh(
    c.control1X,
    c.control1Y,
    next.control0X,
    next.control0Y,
    c.anchor1X,
    c.anchor1Y,
    RelaxedDistanceEpsilon,
  );
}

// Cubic.alignsIshWith(next): all of this' points align with next's points.
function cubicAlignsIshWith(c, next) {
  return (
    (cubicStraightIsh(c) &&
      cubicStraightIsh(next) &&
      cubicSmoothesIntoIsh(c, next)) ||
    c.zeroLength() ||
    next.zeroLength()
  );
}

// Cubic.Companion.extend(a, b): new cubic extending a to b's second anchor.
function cubicExtend(a, b) {
  return a.zeroLength()
    ? Cubic.of(
        a.anchor0X,
        a.anchor0Y,
        b.control0X,
        b.control0Y,
        b.control1X,
        b.control1Y,
        b.anchor1X,
        b.anchor1Y,
      )
    : Cubic.of(
        a.anchor0X,
        a.anchor0Y,
        a.control0X,
        a.control0Y,
        a.control1X,
        a.control1Y,
        b.anchor1X,
        b.anchor1Y,
      );
}

/* =========================================================================
 * RoundedPolygon.kt
 * ========================================================================= */

class RoundedPolygon {
  constructor(features, center) {
    this.features = features;
    this.center = center;
    this.cubics = this._buildCubics();
    this._validateContiguous();
  }

  get centerX() {
    return this.center[0];
  }
  get centerY() {
    return this.center[1];
  }

  _buildCubics() {
    const out = [];
    let firstCubic = null;
    let lastCubic = null;
    let firstFeatureSplitStart = null;
    let firstFeatureSplitEnd = null;
    const features = this.features;
    if (features.length > 0 && features[0].cubics.length === 3) {
      const centerCubic = features[0].cubics[1];
      const [start, end] = centerCubic.split(0.5);
      firstFeatureSplitStart = [features[0].cubics[0], start];
      firstFeatureSplitEnd = [end, features[0].cubics[2]];
    }
    for (let i = 0; i <= features.length; i++) {
      let featureCubics;
      if (i === 0 && firstFeatureSplitEnd != null) {
        featureCubics = firstFeatureSplitEnd;
      } else if (i === features.length) {
        if (firstFeatureSplitStart != null)
          featureCubics = firstFeatureSplitStart;
        else break;
      } else {
        featureCubics = features[i].cubics;
      }
      for (let j = 0; j < featureCubics.length; j++) {
        const cubic = featureCubics[j];
        if (!cubic.zeroLength()) {
          if (lastCubic != null) out.push(lastCubic);
          lastCubic = cubic;
          if (firstCubic == null) firstCubic = cubic;
        } else {
          if (lastCubic != null) {
            lastCubic = new Cubic(lastCubic.points.slice());
            lastCubic.points[6] = cubic.anchor1X;
            lastCubic.points[7] = cubic.anchor1Y;
          }
        }
      }
    }
    if (lastCubic != null && firstCubic != null) {
      out.push(
        Cubic.of(
          lastCubic.anchor0X,
          lastCubic.anchor0Y,
          lastCubic.control0X,
          lastCubic.control0Y,
          lastCubic.control1X,
          lastCubic.control1Y,
          firstCubic.anchor0X,
          firstCubic.anchor0Y,
        ),
      );
    } else {
      out.push(
        Cubic.of(
          this.centerX,
          this.centerY,
          this.centerX,
          this.centerY,
          this.centerX,
          this.centerY,
          this.centerX,
          this.centerY,
        ),
      );
    }
    return out;
  }

  _validateContiguous() {
    let prevCubic = this.cubics[this.cubics.length - 1];
    for (let index = 0; index < this.cubics.length; index++) {
      const cubic = this.cubics[index];
      if (
        Math.abs(cubic.anchor0X - prevCubic.anchor1X) > DistanceEpsilon ||
        Math.abs(cubic.anchor0Y - prevCubic.anchor1Y) > DistanceEpsilon
      ) {
        throw new Error(
          "RoundedPolygon must be contiguous, with the anchor points of all curves " +
            "matching the anchor points of the preceding and succeeding cubics",
        );
      }
      prevCubic = cubic;
    }
  }

  transformed(f) {
    const center = transformPoint(this.center, f);
    const newFeatures = [];
    for (let i = 0; i < this.features.length; i++)
      newFeatures.push(this.features[i].transformed(f));
    return new RoundedPolygon(newFeatures, center);
  }

  normalized() {
    const bounds = this.calculateBounds();
    const width = bounds[2] - bounds[0];
    const height = bounds[3] - bounds[1];
    const side = Math.max(width, height);
    const offsetX = (side - width) / 2 - bounds[0];
    const offsetY = (side - height) / 2 - bounds[1];
    return this.transformed((x, y) => [
      (x + offsetX) / side,
      (y + offsetY) / side,
    ]);
  }

  calculateMaxBounds(bounds = new Float64Array(4)) {
    let maxDistSquared = 0;
    for (let i = 0; i < this.cubics.length; i++) {
      const cubic = this.cubics[i];
      const anchorDistance = distanceSquared(
        cubic.anchor0X - this.centerX,
        cubic.anchor0Y - this.centerY,
      );
      const middlePoint = cubic.pointOnCurve(0.5);
      const middleDistance = distanceSquared(
        middlePoint[0] - this.centerX,
        middlePoint[1] - this.centerY,
      );
      maxDistSquared = Math.max(
        maxDistSquared,
        Math.max(anchorDistance, middleDistance),
      );
    }
    const dist = Math.sqrt(maxDistSquared);
    bounds[0] = this.centerX - dist;
    bounds[1] = this.centerY - dist;
    bounds[2] = this.centerX + dist;
    bounds[3] = this.centerY + dist;
    return bounds;
  }

  calculateBounds(bounds = new Float64Array(4), approximate = true) {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    // Kotlin Float.MIN_VALUE is the smallest POSITIVE float (~1.4e-45), used as a
    // running max seed. JS Number.MIN_VALUE is analogous (smallest positive double).
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    const tmp = new Float64Array(4);
    for (let i = 0; i < this.cubics.length; i++) {
      this.cubics[i].calculateBounds(tmp, approximate);
      minX = Math.min(minX, tmp[0]);
      minY = Math.min(minY, tmp[1]);
      maxX = Math.max(maxX, tmp[2]);
      maxY = Math.max(maxY, tmp[3]);
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }
}

function transformPoint(p, f) {
  const r = f(p[0], p[1]);
  return [r[0], r[1]];
}

// ---- RoundedCorner (private class in RoundedPolygon.kt) ----
class RoundedCorner {
  constructor(p0, p1, p2, rounding = null) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.rounding = rounding;
    this.center = [0, 0];

    const v01 = pMinus(p0, p1);
    const v21 = pMinus(p2, p1);
    const d01 = pDistance(v01);
    const d21 = pDistance(v21);
    if (d01 > 0 && d21 > 0) {
      this.d1 = pDiv(v01, d01);
      this.d2 = pDiv(v21, d21);
      this.cornerRadius = rounding ? rounding.radius : 0;
      this.smoothing = rounding ? rounding.smoothing : 0;
      this.cosAngle = pDot(this.d1, this.d2);
      this.sinAngle = Math.sqrt(1 - square(this.cosAngle));
      this.expectedRoundCut =
        this.sinAngle > 1e-3
          ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle
          : 0;
    } else {
      this.d1 = [0, 0];
      this.d2 = [0, 0];
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
    }
  }

  get expectedCut() {
    return (1 + this.smoothing) * this.expectedRoundCut;
  }

  getCubics(allowedCut0, allowedCut1 = allowedCut0) {
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    if (
      this.expectedRoundCut < DistanceEpsilon ||
      allowedCut < DistanceEpsilon ||
      this.cornerRadius < DistanceEpsilon
    ) {
      this.center = this.p1;
      return [
        Cubic.straightLine(this.p1[0], this.p1[1], this.p1[0], this.p1[1]),
      ];
    }
    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const actualSmoothing0 = this._calculateActualSmoothingValue(allowedCut0);
    const actualSmoothing1 = this._calculateActualSmoothingValue(allowedCut1);
    const actualR =
      (this.cornerRadius * actualRoundCut) / this.expectedRoundCut;
    const centerDistance = Math.sqrt(square(actualR) + square(actualRoundCut));
    this.center = pPlus(
      this.p1,
      pTimes(pGetDirection(pDiv(pPlus(this.d1, this.d2), 2)), centerDistance),
    );
    const circleIntersection0 = pPlus(this.p1, pTimes(this.d1, actualRoundCut));
    const circleIntersection2 = pPlus(this.p1, pTimes(this.d2, actualRoundCut));
    const flanking0 = this._computeFlankingCurve(
      actualRoundCut,
      actualSmoothing0,
      this.p1,
      this.p0,
      circleIntersection0,
      circleIntersection2,
      this.center,
      actualR,
    );
    const flanking2 = this._computeFlankingCurve(
      actualRoundCut,
      actualSmoothing1,
      this.p1,
      this.p2,
      circleIntersection2,
      circleIntersection0,
      this.center,
      actualR,
    ).reverse();
    return [
      flanking0,
      Cubic.circularArc(
        this.center[0],
        this.center[1],
        flanking0.anchor1X,
        flanking0.anchor1Y,
        flanking2.anchor0X,
        flanking2.anchor0Y,
      ),
      flanking2,
    ];
  }

  _calculateActualSmoothingValue(allowedCut) {
    if (allowedCut > this.expectedCut) return this.smoothing;
    if (allowedCut > this.expectedRoundCut)
      return (
        (this.smoothing * (allowedCut - this.expectedRoundCut)) /
        (this.expectedCut - this.expectedRoundCut)
      );
    return 0;
  }

  _computeFlankingCurve(
    actualRoundCut,
    actualSmoothingValues,
    corner,
    sideStart,
    circleSegmentIntersection,
    otherCircleSegmentIntersection,
    circleCenter,
    actualR,
  ) {
    const sideDirection = pGetDirection(pMinus(sideStart, corner));
    const curveStart = pPlus(
      corner,
      pTimes(sideDirection, actualRoundCut * (1 + actualSmoothingValues)),
    );
    const p = interpolatePoint(
      circleSegmentIntersection,
      pDiv(pPlus(circleSegmentIntersection, otherCircleSegmentIntersection), 2),
      actualSmoothingValues,
    );
    const curveEnd = pPlus(
      circleCenter,
      pTimes(
        directionVectorXY(p[0] - circleCenter[0], p[1] - circleCenter[1]),
        actualR,
      ),
    );
    const circleTangent = pRotate90(pMinus(curveEnd, circleCenter));
    const anchorEnd =
      this._lineIntersection(
        sideStart,
        sideDirection,
        curveEnd,
        circleTangent,
      ) ?? circleSegmentIntersection;
    const anchorStart = pDiv(pPlus(curveStart, pTimes(anchorEnd, 2)), 3);
    return Cubic.fromPoints(curveStart, anchorStart, anchorEnd, curveEnd);
  }

  _lineIntersection(p0, d0, p1, d1) {
    const rotatedD1 = pRotate90(d1);
    const den = pDot(d0, rotatedD1);
    if (Math.abs(den) < DistanceEpsilon) return null;
    const num = pDot(pMinus(p1, p0), rotatedD1);
    if (Math.abs(den) < DistanceEpsilon * Math.abs(num)) return null;
    const k = num / den;
    return pPlus(p0, pTimes(d0, k));
  }
}

function calculateCenter(vertices) {
  let cumulativeX = 0;
  let cumulativeY = 0;
  let index = 0;
  while (index < vertices.length) {
    cumulativeX += vertices[index++];
    cumulativeY += vertices[index++];
  }
  return [
    cumulativeX / (vertices.length / 2),
    cumulativeY / (vertices.length / 2),
  ];
}

const FLOAT_MIN_VALUE = Number.MIN_VALUE; // sentinel matching Kotlin Float.MIN_VALUE default

// RoundedPolygon(vertices, rounding, perVertexRounding, centerX, centerY)
function roundedPolygonFromVertices(
  vertices,
  rounding = CornerRounding.Unrounded,
  perVertexRounding = null,
  centerX = FLOAT_MIN_VALUE,
  centerY = FLOAT_MIN_VALUE,
) {
  if (vertices.length < 6)
    throw new Error("Polygons must have at least 3 vertices");
  if (vertices.length % 2 === 1)
    throw new Error("The vertices array should have even size");
  if (
    perVertexRounding != null &&
    perVertexRounding.length * 2 !== vertices.length
  )
    throw new Error(
      "perVertexRounding list should be either null or the same size as the number of vertices",
    );

  const corners = [];
  const n = vertices.length / 2;
  const roundedCorners = [];
  for (let i = 0; i < n; i++) {
    const vtxRounding = perVertexRounding ? perVertexRounding[i] : rounding;
    const prevIndex = ((i + n - 1) % n) * 2;
    const nextIndex = ((i + 1) % n) * 2;
    roundedCorners.push(
      new RoundedCorner(
        [vertices[prevIndex], vertices[prevIndex + 1]],
        [vertices[i * 2], vertices[i * 2 + 1]],
        [vertices[nextIndex], vertices[nextIndex + 1]],
        vtxRounding,
      ),
    );
  }

  const cutAdjusts = [];
  for (let ix = 0; ix < n; ix++) {
    const expectedRoundCut =
      roundedCorners[ix].expectedRoundCut +
      roundedCorners[(ix + 1) % n].expectedRoundCut;
    const expectedCut =
      roundedCorners[ix].expectedCut + roundedCorners[(ix + 1) % n].expectedCut;
    const vtxX = vertices[ix * 2];
    const vtxY = vertices[ix * 2 + 1];
    const nextVtxX = vertices[((ix + 1) % n) * 2];
    const nextVtxY = vertices[((ix + 1) % n) * 2 + 1];
    const sideSize = distance(vtxX - nextVtxX, vtxY - nextVtxY);
    if (expectedRoundCut > sideSize) {
      cutAdjusts.push([sideSize / expectedRoundCut, 0]);
    } else if (expectedCut > sideSize) {
      cutAdjusts.push([
        1,
        (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut),
      ]);
    } else {
      cutAdjusts.push([1, 1]);
    }
  }

  for (let i = 0; i < n; i++) {
    const allowedCuts = [];
    for (let delta = 0; delta <= 1; delta++) {
      const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n];
      allowedCuts.push(
        roundedCorners[i].expectedRoundCut * roundCutRatio +
          (roundedCorners[i].expectedCut - roundedCorners[i].expectedRoundCut) *
            cutRatio,
      );
    }
    corners.push(roundedCorners[i].getCubics(allowedCuts[0], allowedCuts[1]));
  }

  const tempFeatures = [];
  for (let i = 0; i < n; i++) {
    const prevVtxIndex = (i + n - 1) % n;
    const nextVtxIndex = (i + 1) % n;
    const currVertex = [vertices[i * 2], vertices[i * 2 + 1]];
    const prevVertex = [
      vertices[prevVtxIndex * 2],
      vertices[prevVtxIndex * 2 + 1],
    ];
    const nextVertex = [
      vertices[nextVtxIndex * 2],
      vertices[nextVtxIndex * 2 + 1],
    ];
    const isConvex = convex(prevVertex, currVertex, nextVertex);
    tempFeatures.push(new Corner(corners[i], isConvex));
    tempFeatures.push(
      new Edge([
        Cubic.straightLine(
          corners[i][corners[i].length - 1].anchor1X,
          corners[i][corners[i].length - 1].anchor1Y,
          corners[(i + 1) % n][0].anchor0X,
          corners[(i + 1) % n][0].anchor0Y,
        ),
      ]),
    );
  }

  let cx, cy;
  if (centerX === FLOAT_MIN_VALUE || centerY === FLOAT_MIN_VALUE) {
    const c = calculateCenter(vertices);
    cx = c[0];
    cy = c[1];
  } else {
    cx = centerX;
    cy = centerY;
  }
  return new RoundedPolygon(tempFeatures, [cx, cy]);
}

function verticesFromNumVerts(numVertices, radius, centerX, centerY) {
  const result = new Array(numVertices * 2);
  let arrayIndex = 0;
  for (let i = 0; i < numVertices; i++) {
    const vertex = pPlus(
      radialToCartesian(radius, (FloatPi / numVertices) * 2 * i),
      [centerX, centerY],
    );
    result[arrayIndex++] = vertex[0];
    result[arrayIndex++] = vertex[1];
  }
  return result;
}

// RoundedPolygon(numVertices, radius, centerX, centerY, rounding, perVertexRounding)
function roundedPolygonFromNumVerts(
  numVertices,
  radius = 1,
  centerX = 0,
  centerY = 0,
  rounding = CornerRounding.Unrounded,
  perVertexRounding = null,
) {
  return roundedPolygonFromVertices(
    verticesFromNumVerts(numVertices, radius, centerX, centerY),
    rounding,
    perVertexRounding,
    centerX,
    centerY,
  );
}

/* =========================================================================
 * CornerRounding.kt
 * ========================================================================= */

class CornerRounding {
  constructor(radius = 0, smoothing = 0) {
    this.radius = radius;
    this.smoothing = smoothing;
  }
}
CornerRounding.Unrounded = new CornerRounding();

/* =========================================================================
 * Shapes.kt  (RoundedPolygon.Companion.circle / .star / .rectangle)
 * ========================================================================= */

function circle(numVertices = 8, radius = 1, centerX = 0, centerY = 0) {
  if (numVertices < 3)
    throw new Error("Circle must have at least three vertices");
  const theta = FloatPi / numVertices;
  const polygonRadius = radius / Math.cos(theta);
  return roundedPolygonFromNumVerts(
    numVertices,
    polygonRadius,
    centerX,
    centerY,
    new CornerRounding(radius),
    null,
  );
}

// NOTE: RoundedPolygon.Companion.rectangle (Shapes.kt) is part of the library but NOT used by
// any of the 7 IndeterminateIndicatorPolygons (none of softBurst/cookie9/pentagon/pill/sunny/
// cookie4/oval is a rectangle/square/semiCircle), so it is omitted here to keep the port to the
// executed path. circle()/star() (both used) are ported in full below.

function starVerticesFromNumVerts(
  numVerticesPerRadius,
  radius,
  innerRadius,
  centerX,
  centerY,
) {
  const result = new Array(numVerticesPerRadius * 4);
  let arrayIndex = 0;
  for (let i = 0; i < numVerticesPerRadius; i++) {
    let vertex = radialToCartesian(
      radius,
      (FloatPi / numVerticesPerRadius) * 2 * i,
    );
    result[arrayIndex++] = vertex[0] + centerX;
    result[arrayIndex++] = vertex[1] + centerY;
    vertex = radialToCartesian(
      innerRadius,
      (FloatPi / numVerticesPerRadius) * (2 * i + 1),
    );
    result[arrayIndex++] = vertex[0] + centerX;
    result[arrayIndex++] = vertex[1] + centerY;
  }
  return result;
}

function star(
  numVerticesPerRadius,
  radius = 1,
  innerRadius = 0.5,
  rounding = CornerRounding.Unrounded,
  innerRounding = null,
  perVertexRounding = null,
  centerX = 0,
  centerY = 0,
) {
  if (radius <= 0 || innerRadius <= 0)
    throw new Error("Star radii must both be greater than 0");
  if (innerRadius >= radius)
    throw new Error("innerRadius must be less than radius");
  let pvRounding = perVertexRounding;
  if (pvRounding == null && innerRounding != null) {
    pvRounding = [];
    for (let i = 0; i < numVerticesPerRadius; i++) {
      pvRounding.push(rounding, innerRounding);
    }
  }
  return roundedPolygonFromVertices(
    starVerticesFromNumVerts(
      numVerticesPerRadius,
      radius,
      innerRadius,
      centerX,
      centerY,
    ),
    rounding,
    pvRounding,
    centerX,
    centerY,
  );
}

/* =========================================================================
 * FloatMapping.kt  (DoubleMapper + linearMap + validateProgress)
 * ========================================================================= */

function progressInRange(progress, progressFrom, progressTo) {
  if (progressTo >= progressFrom)
    return progress >= progressFrom && progress <= progressTo;
  return progress >= progressFrom || progress <= progressTo;
}

function linearMap(xValues, yValues, x) {
  if (!(x >= 0 && x <= 1)) throw new Error("Invalid progress: " + x);
  let segmentStartIndex = -1;
  for (let i = 0; i < xValues.length; i++) {
    if (progressInRange(x, xValues[i], xValues[(i + 1) % xValues.length])) {
      segmentStartIndex = i;
      break;
    }
  }
  const segmentEndIndex = (segmentStartIndex + 1) % xValues.length;
  const segmentSizeX = positiveModulo(
    xValues[segmentEndIndex] - xValues[segmentStartIndex],
    1,
  );
  const segmentSizeY = positiveModulo(
    yValues[segmentEndIndex] - yValues[segmentStartIndex],
    1,
  );
  let positionInSegment;
  if (segmentSizeX < 0.001) positionInSegment = 0.5;
  else
    positionInSegment =
      positiveModulo(x - xValues[segmentStartIndex], 1) / segmentSizeX;
  return positiveModulo(
    yValues[segmentStartIndex] + segmentSizeY * positionInSegment,
    1,
  );
}

function progressDistance(p1, p2) {
  const d = Math.abs(p1 - p2);
  return Math.min(d, 1 - d);
}

function validateProgress(p) {
  let prev = p[p.length - 1];
  let wraps = 0;
  for (let i = 0; i < p.length; i++) {
    const curr = p[i];
    if (!(curr >= 0 && curr < 1))
      throw new Error(
        "FloatMapping - Progress outside of range: " + p.join(", "),
      );
    if (!(progressDistance(curr, prev) > DistanceEpsilon))
      throw new Error(
        "FloatMapping - Progress repeats a value: " + p.join(", "),
      );
    if (curr < prev) {
      wraps++;
      if (wraps > 1)
        throw new Error(
          "FloatMapping - Progress wraps more than once: " + p.join(", "),
        );
    }
    prev = curr;
  }
}

class DoubleMapper {
  constructor(mappings) {
    this.sourceValues = [];
    this.targetValues = [];
    for (let i = 0; i < mappings.length; i++) {
      this.sourceValues.push(mappings[i][0]);
      this.targetValues.push(mappings[i][1]);
    }
    validateProgress(this.sourceValues);
    validateProgress(this.targetValues);
  }
  map(x) {
    return linearMap(this.sourceValues, this.targetValues, x);
  }
  mapBack(x) {
    return linearMap(this.targetValues, this.sourceValues, x);
  }
}
DoubleMapper.Identity = new DoubleMapper([
  [0, 0],
  [0.5, 0.5],
]);

/* =========================================================================
 * FeatureMapping.kt  (faithful 1:1 port of /tmp/gshapes/FeatureMapping.kt:
 * featureMapper / doMapping / MappingHelper / featureDistSquared /
 * featureRepresentativePoint). featureMapper creates the DoubleMapper between
 * the rounded corners of the two shapes; doMapping picks, greedily from the
 * smallest squared-distance pair upward, a crossing-free, same-concavity
 * correspondence — this is exactly the machinery that prevents matched points
 * from crossing through the center (the collapse defect).
 * ========================================================================= */

// ProgressableFeature is a {progress, feature} record. Each instance is a
// distinct object (Kotlin data class held in a Set, but progresses are unique
// per polygon so reference identity is the right key for usedF1/usedF2).

function featureMapper(features1, features2) {
  // We only use corners for this mapping (Feature.Corner).
  const filteredFeatures1 = [];
  for (let i = 0; i < features1.length; i++) {
    if (features1[i].feature instanceof Corner)
      filteredFeatures1.push(features1[i]);
  }
  const filteredFeatures2 = [];
  for (let i = 0; i < features2.length; i++) {
    if (features2[i].feature instanceof Corner)
      filteredFeatures2.push(features2[i]);
  }
  const featureProgressMapping = doMapping(
    filteredFeatures1,
    filteredFeatures2,
  );
  return new DoubleMapper(featureProgressMapping);
}

const IdentityMapping = [
  // Any 2 points on the (x, x) diagonal in [0, 1), spread to minimize float error.
  [0, 0],
  [0.5, 0.5],
];

function doMapping(features1, features2) {
  // 1) squared distance for all (features1 x features2) pairs (∞ ones dropped),
  // 2) ascending by distance (stable, like Kotlin sortedBy),
  // 3) greedily add non-used, non-crossing pairs.
  const distanceVertexList = [];
  for (const f1 of features1) {
    for (const f2 of features2) {
      const d = featureDistSquared(f1.feature, f2.feature);
      if (d !== Number.MAX_VALUE)
        distanceVertexList.push({distance: d, f1, f2});
    }
  }
  distanceVertexList.sort((a, b) => a.distance - b.distance);

  // Special cases.
  if (distanceVertexList.length === 0)
    return IdentityMapping.map((m) => m.slice());
  if (distanceVertexList.length === 1) {
    const it = distanceVertexList[0];
    const f1 = it.f1.progress;
    const f2 = it.f2.progress;
    return [
      [f1, f2],
      [(f1 + 0.5) % 1, (f2 + 0.5) % 1],
    ];
  }
  const helper = new MappingHelper();
  for (const dv of distanceVertexList) helper.addMapping(dv.f1, dv.f2);
  return helper.mapping;
}

// binarySearchBy emulating Kotlin's: returns index if found, else -(insertionPoint)-1.
function binarySearchByFirst(list, key) {
  let low = 0;
  let high = list.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midVal = list[mid][0];
    if (midVal < key) low = mid + 1;
    else if (midVal > key) high = mid - 1;
    else return mid;
  }
  return -(low + 1);
}

class MappingHelper {
  constructor() {
    this.mapping = [];
    this.usedF1 = new Set();
    this.usedF2 = new Set();
  }
  addMapping(f1, f2) {
    if (this.usedF1.has(f1) || this.usedF2.has(f2)) return;
    const index = binarySearchByFirst(this.mapping, f1.progress);
    if (!(index < 0))
      throw new Error("There can't be two features with the same progress");
    const insertionIndex = -index - 1;
    const n = this.mapping.length;
    if (n >= 1) {
      const before = this.mapping[(insertionIndex + n - 1) % n];
      const after = this.mapping[insertionIndex % n];
      const before1 = before[0];
      const before2 = before[1];
      const after1 = after[0];
      const after2 = after[1];
      if (
        progressDistance(f1.progress, before1) < DistanceEpsilon ||
        progressDistance(f1.progress, after1) < DistanceEpsilon ||
        progressDistance(f2.progress, before2) < DistanceEpsilon ||
        progressDistance(f2.progress, after2) < DistanceEpsilon
      ) {
        return;
      }
      if (n > 1 && !progressInRange(f2.progress, before2, after2)) return;
    }
    this.mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    this.usedF1.add(f1);
    this.usedF2.add(f2);
  }
}

// Squared distance along the overall shape between two Features. Forces same-
// concavity matching by returning ∞ for a convex-vs-concave corner pair.
function featureDistSquared(f1, f2) {
  if (f1 instanceof Corner && f2 instanceof Corner && f1.convex !== f2.convex) {
    return Number.MAX_VALUE;
  }
  return pDistanceSquared(
    pMinus(featureRepresentativePoint(f1), featureRepresentativePoint(f2)),
  );
}

function featureRepresentativePoint(feature) {
  const x =
    (feature.cubics[0].anchor0X +
      feature.cubics[feature.cubics.length - 1].anchor1X) /
    2;
  const y =
    (feature.cubics[0].anchor0Y +
      feature.cubics[feature.cubics.length - 1].anchor1Y) /
    2;
  return [x, y];
}

/* =========================================================================
 * Measurer / LengthMeasurer  (faithful 1:1 port of /tmp/gshapes/PolygonMeasure.kt,
 * the REAL source — Measurer interface + LengthMeasurer). LengthMeasurer
 * approximates a cubic's arc length by summing `segments` (=3) straight chord
 * lengths along the curve (NOT a quadrature); findCubicCutPoint walks the same
 * chords to find the t where the accumulated length reaches the threshold. The
 * 3-segment count gives >=98.5% accuracy on a circular arc (the worst case for
 * the standard shapes), per PolygonMeasureTest.measureCircle.
 * ========================================================================= */

// LengthMeasurer.measureCubic / .findCubicCutPoint
class LengthMeasurer {
  constructor() {
    // The minimum number needed for up to 98.5% accuracy from the true arc length.
    this.segments = 3;
  }
  // Returns the size (length) of the cubic.
  measureCubic(c) {
    return this._closestProgressTo(c, Number.POSITIVE_INFINITY)[1];
  }
  // Returns the t at which the accumulated length reaches `threshold` (capped).
  findCubicCutPoint(c, threshold) {
    return this._closestProgressTo(c, threshold)[0];
  }
  // FloatFloatPair(progress, length): mirrors closestProgressTo in PolygonMeasure.kt.
  _closestProgressTo(cubic, threshold) {
    let total = 0;
    let remainder = threshold;
    let prev = [cubic.anchor0X, cubic.anchor0Y];
    for (let i = 1; i <= this.segments; i++) {
      const progress = i / this.segments;
      const point = cubic.pointOnCurve(progress);
      const segment = pDistance(pMinus(point, prev));

      if (segment >= remainder) {
        return [
          progress - ((1.0 / this.segments) * (segment - remainder)) / segment,
          threshold,
        ];
      }

      remainder -= segment;
      total += segment;
      prev = point;
    }
    return [1.0, total];
  }
}

/* =========================================================================
 * PolygonMeasure.kt  (faithful 1:1 port of /tmp/gshapes/PolygonMeasure.kt, the
 * REAL source — MeasuredPolygon / MeasuredCubic / measurePolygon / cutAndShift).
 *
 * measurePolygon walks the polygon's FEATURES (not its flattened cubics),
 * accumulating each cubic's measured length so every cubic gets an
 * outline-progress span in [0,1], and records, for each Corner, the progress at
 * the MIDDLE cubic of that corner (its representative). cutAndShift cyclically
 * rotates the measured cubics so the polygon starts at `cuttingPoint` (the
 * point matched to progress 0 of the other shape), cutting the straddling cubic
 * and re-basing every outline progress. Empty (≈zero-length-span) cubics are
 * filtered in the constructor. This measure+rotate+match pipeline is what keeps
 * corresponding points near each other (no crossing through the center).
 * ========================================================================= */

class MeasuredCubic {
  // outer: the MeasuredPolygon (for measurer + total measure)
  constructor(outer, cubic, startOutlineProgress, endOutlineProgress) {
    if (!(endOutlineProgress >= startOutlineProgress))
      throw new Error(
        "endOutlineProgress is expected to be greater or equal to startOutlineProgress",
      );
    this.outer = outer;
    this.cubic = cubic;
    this.startOutlineProgress = startOutlineProgress;
    this.endOutlineProgress = endOutlineProgress;
    this.measuredSize = outer.measurer.measureCubic(cubic);
  }

  updateProgressRange(
    startOutlineProgress = this.startOutlineProgress,
    endOutlineProgress = this.endOutlineProgress,
  ) {
    if (!(endOutlineProgress >= startOutlineProgress))
      throw new Error(
        "endOutlineProgress is expected to be greater or equal to startOutlineProgress",
      );
    this.startOutlineProgress = startOutlineProgress;
    this.endOutlineProgress = endOutlineProgress;
  }

  // Cuts this MeasuredCubic at the given outline progress, returning two MeasuredCubics.
  cutAtProgress(cutOutlineProgress) {
    // Floating point errors further up can cause cutOutlineProgress to land just slightly
    // outside of the start/end progress of this cubic; clamp to avoid a negative size.
    const boundedCutOutlineProgress = Math.max(
      this.startOutlineProgress,
      Math.min(this.endOutlineProgress, cutOutlineProgress),
    );
    const outlineProgressSize =
      this.endOutlineProgress - this.startOutlineProgress;
    const progressFromStart =
      boundedCutOutlineProgress - this.startOutlineProgress;
    // Note: empty (zero-progress) cubics are filtered out in the MeasuredPolygon constructor
    // before any cut happens, so outlineProgressSize is always > 0 here (matching canonical).
    const relativeProgress = progressFromStart / outlineProgressSize;
    const t = this.outer.measurer.findCubicCutPoint(
      this.cubic,
      relativeProgress * this.measuredSize,
    );
    if (!(t >= 0 && t <= 1))
      throw new Error("Cubic cut point is expected to be between 0 and 1");

    const [c1, c2] = this.cubic.split(t);
    return [
      new MeasuredCubic(
        this.outer,
        c1,
        this.startOutlineProgress,
        boundedCutOutlineProgress,
      ),
      new MeasuredCubic(
        this.outer,
        c2,
        boundedCutOutlineProgress,
        this.endOutlineProgress,
      ),
    ];
  }
}

class MeasuredPolygon {
  constructor(measurer, features, cubics, outlineProgress) {
    if (outlineProgress.length !== cubics.length + 1)
      throw new Error(
        "Outline progress size is expected to be the cubics size + 1",
      );
    if (outlineProgress[0] !== 0)
      throw new Error("First outline progress value is expected to be zero");
    if (outlineProgress[outlineProgress.length - 1] !== 1)
      throw new Error("Last outline progress value is expected to be one");
    this.measurer = measurer;
    this.features = features; // List<ProgressableFeature>
    // Faithful to canonical MeasuredPolygon.init: filter out "empty" cubics (those whose
    // outline-progress span is <= DistanceEpsilon), and chain each kept cubic to start exactly
    // where the previous kept one ended.
    this._cubics = [];
    let startOutlineProgress = 0;
    for (let i = 0; i < cubics.length; i++) {
      if (outlineProgress[i + 1] - outlineProgress[i] > DistanceEpsilon) {
        this._cubics.push(
          new MeasuredCubic(
            this,
            cubics[i],
            startOutlineProgress,
            outlineProgress[i + 1],
          ),
        );
        startOutlineProgress = outlineProgress[i + 1];
      }
    }
    // We could have removed empty cubics at the end; ensure the last measured cubic ends at 1.
    this._cubics[this._cubics.length - 1].updateProgressRange(undefined, 1);
  }

  get size() {
    return this._cubics.length;
  }
  getOrNull(index) {
    return index >= 0 && index < this._cubics.length
      ? this._cubics[index]
      : null;
  }
  get(index) {
    return this._cubics[index];
  }

  // cutAndShift: cut the polygon at `cuttingPoint` and rotate the cubics so the new
  // measured polygon starts at outlineProgress 0 there.
  cutAndShift(cuttingPoint) {
    if (!(cuttingPoint >= 0 && cuttingPoint < 1))
      throw new Error("Cutting point is expected to be between 0 and 1");
    if (cuttingPoint < 1e-7) return this;

    // Find the index of cubic we want to cut.
    const targetIndex = this._cubics.findIndex(
      (c) =>
        cuttingPoint >= c.startOutlineProgress &&
        cuttingPoint <= c.endOutlineProgress,
    );
    const target = this._cubics[targetIndex];

    // Cut the target cubic.
    const [b1, b2] = target.cutAtProgress(cuttingPoint);

    // Construct the list of the cubics we need:
    // * The second part of the target cubic (after the cut).
    // * All cubics after the target, until the end.
    // * All cubics from the start, before the target cubic.
    // * The first part of the target cubic (before the cut).
    const retCubics = [b2.cubic];
    for (let i = 1; i < this._cubics.length; i++) {
      retCubics.push(
        this._cubics[(i + targetIndex) % this._cubics.length].cubic,
      );
    }
    retCubics.push(b1.cubic);

    // Construct the array of outline progress.
    // For example, if we have 3 cubics with outline progress [0 .. 0.3], [0.3 .. 0.8] &
    // [0.8 .. 1.0], and we cut + shift at 0.6:
    // 0.6 is in the second cubic, so for the new cubics:
    // 0.0 .. 0.2 is the second part of the second cubic.
    // 0.2 .. 0.4 is the third cubic (was 0.8 .. 1.0).
    // 0.4 .. 0.7 is the first cubic (was 0.0 .. 0.3).
    // 0.7 .. 1.0 is the first part of the second cubic.
    const retOutlineProgress = new Array(this._cubics.length + 2);
    for (let index = 0; index < this._cubics.length + 2; index++) {
      if (index === 0) {
        retOutlineProgress[index] = 0;
      } else if (index === this._cubics.length + 1) {
        retOutlineProgress[index] = 1;
      } else {
        const cubicIndex = (targetIndex + index - 1) % this._cubics.length;
        retOutlineProgress[index] = positiveModulo(
          this._cubics[cubicIndex].endOutlineProgress - cuttingPoint,
          1,
        );
      }
    }

    // Shift the feature's progress too.
    const newFeatures = [];
    for (let i = 0; i < this.features.length; i++) {
      const f = this.features[i];
      newFeatures.push({
        progress: positiveModulo(f.progress - cuttingPoint, 1),
        feature: f.feature,
      });
    }

    return new MeasuredPolygon(
      this.measurer,
      newFeatures,
      retCubics,
      retOutlineProgress,
    );
  }

  static measurePolygon(measurer, polygon) {
    const cubics = [];
    const featureToCubic = []; // [Feature, indexIntoCubics]

    // Get the cubics from the polygon, at the same time create a map to know
    // which cubic belongs to each feature.
    for (
      let featureIndex = 0;
      featureIndex < polygon.features.length;
      featureIndex++
    ) {
      const feature = polygon.features[featureIndex];
      for (
        let cubicIndex = 0;
        cubicIndex < feature.cubics.length;
        cubicIndex++
      ) {
        if (
          feature instanceof Corner &&
          cubicIndex === ((feature.cubics.length / 2) | 0)
        ) {
          featureToCubic.push([feature, cubics.length]);
        }
        cubics.push(feature.cubics[cubicIndex]);
      }
    }

    const measures = new Array(cubics.length + 1);
    measures[0] = 0;
    let totalMeasure = 0;
    for (let i = 0; i < cubics.length; i++) {
      const measure = measurer.measureCubic(cubics[i]);
      if (!(measure >= 0))
        throw new Error(
          "Measured cubic is expected to be greater or equal to zero",
        );
      totalMeasure += measure;
      measures[i + 1] = totalMeasure;
    }

    const outlineProgress = new Array(measures.length);
    for (let i = 0; i < measures.length; i++) {
      outlineProgress[i] = measures[i] / totalMeasure;
    }

    const features = [];
    for (let i = 0; i < featureToCubic.length; i++) {
      const cubicIndex = featureToCubic[i][1];
      const progress = positiveModulo(
        (outlineProgress[cubicIndex] + outlineProgress[cubicIndex + 1]) / 2,
        1,
      );
      features.push({progress, feature: featureToCubic[i][0]});
    }

    return new MeasuredPolygon(measurer, features, cubics, outlineProgress);
  }
}

/* =========================================================================
 * Morph.kt
 * ========================================================================= */

class Morph {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    this._morphMatch = Morph.match(start, end);
  }

  // Returns the interpolated cubics at `progress`. Extrapolation (progress
  // outside [0,1]) is explicitly supported (lerp == extrapolation).
  asCubics(progress) {
    const out = [];
    let firstCubic = null;
    let lastCubic = null;
    for (let i = 0; i < this._morphMatch.length; i++) {
      const a = this._morphMatch[i][0];
      const b = this._morphMatch[i][1];
      const pts = new Array(8);
      for (let k = 0; k < 8; k++)
        pts[k] = interpolate(a.points[k], b.points[k], progress);
      const cubic = new Cubic(pts);
      if (firstCubic == null) firstCubic = cubic;
      if (lastCubic != null) out.push(lastCubic);
      lastCubic = cubic;
    }
    if (lastCubic != null && firstCubic != null) {
      out.push(
        Cubic.of(
          lastCubic.anchor0X,
          lastCubic.anchor0Y,
          lastCubic.control0X,
          lastCubic.control0Y,
          lastCubic.control1X,
          lastCubic.control1Y,
          firstCubic.anchor0X,
          firstCubic.anchor0Y,
        ),
      );
    }
    return out;
  }

  static match(p1, p2) {
    const measuredPolygon1 = MeasuredPolygon.measurePolygon(
      new LengthMeasurer(),
      p1,
    );
    const measuredPolygon2 = MeasuredPolygon.measurePolygon(
      new LengthMeasurer(),
      p2,
    );

    const features1 = measuredPolygon1.features;
    const features2 = measuredPolygon2.features;

    const doubleMapper = featureMapper(features1, features2);

    const polygon2CutPoint = doubleMapper.map(0);

    const bs1 = measuredPolygon1;
    const bs2 = measuredPolygon2.cutAndShift(polygon2CutPoint);

    const ret = [];
    let i1 = 0;
    let i2 = 0;
    let b1 = bs1.getOrNull(i1++);
    let b2 = bs2.getOrNull(i2++);
    while (b1 != null && b2 != null) {
      const b1a = i1 === bs1.size ? 1 : b1.endOutlineProgress;
      const b2a =
        i2 === bs2.size
          ? 1
          : doubleMapper.mapBack(
              positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1),
            );
      const minb = Math.min(b1a, b2a);

      let seg1, newb1;
      if (b1a > minb + AngleEpsilon) {
        [seg1, newb1] = b1.cutAtProgress(minb);
      } else {
        seg1 = b1;
        newb1 = bs1.getOrNull(i1++);
      }

      let seg2, newb2;
      if (b2a > minb + AngleEpsilon) {
        [seg2, newb2] = b2.cutAtProgress(
          positiveModulo(doubleMapper.map(minb) - polygon2CutPoint, 1),
        );
      } else {
        seg2 = b2;
        newb2 = bs2.getOrNull(i2++);
      }

      ret.push([seg1.cubic, seg2.cubic]);
      b1 = newb1;
      b2 = newb2;
    }

    // Canonical Morph.match ends here: both polygons' cubics must be fully matched. With the
    // empty-cubic filtering in MeasuredPolygon (faithful to canonical), there are no zero-length
    // leftovers, so this require holds exactly as on the JVM.
    if (!(b1 == null && b2 == null)) {
      throw new Error("Expected both Polygon's Cubic to be fully matched");
    }
    return ret;
  }
}

/* =========================================================================
 * Compose internal.transformed / .toPath  (androidx.compose.material3.internal)
 *
 * `transformed(Matrix)` maps a RoundedPolygon through a 4x4 Compose Matrix
 * (only the in-plane scale/rotate components matter here). `toPath` walks a
 * Morph's interpolated cubics into a path (M + C... + close).
 * ========================================================================= */

// Compose Matrix is 4x4 column-major (Matrix.values, 16 floats). We only need
// rotateZ and scale, applied to 2D points as: x' = m00*x + m10*y + m30,
// y' = m01*x + m11*y + m31  (Matrix.map(Offset)).
class Matrix4 {
  constructor() {
    // identity, column-major like Compose Matrix
    this.v = new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  // index helper: column*4 + row (column-major)
  static idx(row, col) {
    return col * 4 + row;
  }
  rotateZ(degrees) {
    const r = (degrees / 180) * Math.PI;
    const c = Math.cos(r);
    const s = Math.sin(r);
    // Compose Matrix.rotateZ multiplies in the existing matrix; for our usage
    // we apply to identity (or after scale). Implement full multiply for safety.
    const m = this.v;
    const a00 = m[Matrix4.idx(0, 0)],
      a01 = m[Matrix4.idx(0, 1)];
    const a10 = m[Matrix4.idx(1, 0)],
      a11 = m[Matrix4.idx(1, 1)];
    const a20 = m[Matrix4.idx(2, 0)],
      a21 = m[Matrix4.idx(2, 1)];
    const a30 = m[Matrix4.idx(3, 0)],
      a31 = m[Matrix4.idx(3, 1)];
    // new = old * Rz  where Rz rotates the first two columns
    m[Matrix4.idx(0, 0)] = a00 * c + a01 * s;
    m[Matrix4.idx(0, 1)] = -a00 * s + a01 * c;
    m[Matrix4.idx(1, 0)] = a10 * c + a11 * s;
    m[Matrix4.idx(1, 1)] = -a10 * s + a11 * c;
    m[Matrix4.idx(2, 0)] = a20 * c + a21 * s;
    m[Matrix4.idx(2, 1)] = -a20 * s + a21 * c;
    m[Matrix4.idx(3, 0)] = a30 * c + a31 * s;
    m[Matrix4.idx(3, 1)] = -a30 * s + a31 * c;
    return this;
  }
  scale(sx = 1, sy = 1, sz = 1) {
    const m = this.v;
    for (let row = 0; row < 4; row++) {
      m[Matrix4.idx(row, 0)] *= sx;
      m[Matrix4.idx(row, 1)] *= sy;
      m[Matrix4.idx(row, 2)] *= sz;
    }
    return this;
  }
  // Matrix.map(Offset(x, y)) for a 2D point (z=0, w=1).
  mapPoint(x, y) {
    const m = this.v;
    const nx =
      m[Matrix4.idx(0, 0)] * x +
      m[Matrix4.idx(0, 1)] * y +
      m[Matrix4.idx(0, 3)];
    const ny =
      m[Matrix4.idx(1, 0)] * x +
      m[Matrix4.idx(1, 1)] * y +
      m[Matrix4.idx(1, 3)];
    const pz =
      m[Matrix4.idx(3, 0)] * x +
      m[Matrix4.idx(3, 1)] * y +
      m[Matrix4.idx(3, 3)];
    if (pz !== 0 && pz !== 1) return [nx / pz, ny / pz];
    return [nx, ny];
  }
}

// internal.transformed(RoundedPolygon, Matrix): RoundedPolygon
function transformedByMatrix(polygon, matrix) {
  return polygon.transformed((x, y) => matrix.mapPoint(x, y));
}

/* =========================================================================
 * MaterialShapes.kt  (the 7 indeterminate shapes + customPolygon/doRepeat)
 * ========================================================================= */

const cornerRound15 = new CornerRounding(0.15);
const cornerRound50 = new CornerRounding(0.5);

function rotateZMatrix(deg) {
  return new Matrix4().rotateZ(deg);
}
const rotateNeg45 = rotateZMatrix(-45);
const rotateNeg90 = rotateZMatrix(-90);

// PointNRound: {o: [x,y], r: CornerRounding}
function PointNRound(o, r = CornerRounding.Unrounded) {
  return {o, r};
}

const offMinus = (a, b) => [a[0] - b[0], a[1] - b[1]];
const offGetDistance = (o) => Math.sqrt(o[0] * o[0] + o[1] * o[1]);
const offAngleDegrees = (o) => (Math.atan2(o[1], o[0]) * 180) / Math.PI;
const degToRad = (d) => (d / 360) * 2 * Math.PI;

function offRotateDegrees(o, angle, center = [0, 0]) {
  const a = degToRad(angle);
  const off = offMinus(o, center);
  return [
    off[0] * Math.cos(a) - off[1] * Math.sin(a) + center[0],
    off[0] * Math.sin(a) + off[1] * Math.cos(a) + center[1],
  ];
}

function doRepeat(points, reps, center, mirroring) {
  if (mirroring) {
    const out = [];
    const angles = points.map((p) => offAngleDegrees(offMinus(p.o, center)));
    const distances = points.map((p) => offGetDistance(offMinus(p.o, center)));
    const actualReps = reps * 2;
    const sectionAngle = 360 / actualReps;
    for (let it = 0; it < actualReps; it++) {
      for (let index = 0; index < points.length; index++) {
        const i = it % 2 === 0 ? index : points.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const a = degToRad(
            sectionAngle * it +
              (it % 2 === 0
                ? angles[i]
                : sectionAngle - angles[i] + 2 * angles[0]),
          );
          const finalPoint = [
            Math.cos(a) * distances[i] + center[0],
            Math.sin(a) * distances[i] + center[1],
          ];
          out.push(PointNRound(finalPoint, points[i].r));
        }
      }
    }
    return out;
  } else {
    const np = points.length;
    const out = [];
    for (let it = 0; it < np * reps; it++) {
      const point = offRotateDegrees(
        points[it % np].o,
        ((it / np) | 0) * (360 / reps),
        center,
      );
      out.push(PointNRound(point, points[it % np].r));
    }
    return out;
  }
}

function customPolygon(pnr, reps, center = [0.5, 0.5], mirroring = false) {
  const actualPoints = doRepeat(pnr, reps, center, mirroring);
  const vertices = new Array(actualPoints.length * 2);
  for (let ix = 0; ix < actualPoints.length * 2; ix++) {
    const o = actualPoints[(ix / 2) | 0].o;
    vertices[ix] = ix % 2 === 0 ? o[0] : o[1];
  }
  const perVertexRounding = [];
  for (const p of actualPoints) perVertexRounding.push(p.r);
  return roundedPolygonFromVertices(
    vertices,
    CornerRounding.Unrounded,
    perVertexRounding,
    center[0],
    center[1],
  );
}

// ---- the seven shape builders (MaterialShapes.kt) ----
function build_softBurst() {
  return customPolygon(
    [
      PointNRound([0.193, 0.277], new CornerRounding(0.053)),
      PointNRound([0.176, 0.055], new CornerRounding(0.053)),
    ],
    10,
  );
}
function build_cookie9() {
  return transformedByMatrix(
    star(9, 1, 0.8, cornerRound50, null, null, 0, 0),
    rotateNeg90,
  );
}
function build_pentagon() {
  return customPolygon(
    [
      PointNRound([0.5, -0.009], new CornerRounding(0.172)),
      PointNRound([1.03, 0.365], new CornerRounding(0.164)),
      PointNRound([0.828, 0.97], new CornerRounding(0.169)),
    ],
    1,
    [0.5, 0.5],
    true,
  );
}
function build_pill() {
  return customPolygon(
    [
      PointNRound([0.961, 0.039], new CornerRounding(0.426)),
      PointNRound([1.001, 0.428]),
      PointNRound([1.0, 0.609], new CornerRounding(1.0)),
    ],
    2,
    [0.5, 0.5],
    true,
  );
}
function build_sunny() {
  return star(8, 1, 0.8, cornerRound15, null, null, 0, 0);
}
function build_cookie4() {
  return customPolygon(
    [
      PointNRound([1.237, 1.236], new CornerRounding(0.258)),
      PointNRound([0.5, 0.918], new CornerRounding(0.233)),
    ],
    4,
  );
}
function build_oval() {
  const m = new Matrix4().scale(1, 0.64);
  return transformedByMatrix(transformedByMatrix(circle(), m), rotateNeg45);
}

// Each MaterialShapes.X is `<builder>().normalized()`.
const MaterialShapes = {
  SoftBurst: build_softBurst().normalized(),
  Cookie9Sided: build_cookie9().normalized(),
  Pentagon: build_pentagon().normalized(),
  Pill: build_pill().normalized(),
  Sunny: build_sunny().normalized(),
  Cookie4Sided: build_cookie4().normalized(),
  Oval: build_oval().normalized(),
};

/* =========================================================================
 * LoadingIndicator (Compose)  — sequence + scaling
 * ========================================================================= */

// LoadingIndicatorDefaults.IndeterminateIndicatorPolygons
const IndeterminateIndicatorPolygons = [
  MaterialShapes.SoftBurst,
  MaterialShapes.Cookie9Sided,
  MaterialShapes.Pentagon,
  MaterialShapes.Pill,
  MaterialShapes.Sunny,
  MaterialShapes.Cookie4Sided,
  MaterialShapes.Oval,
];

// morphSequence(polygons, circularSequence = true)
function morphSequence(polygons, circularSequence) {
  const out = [];
  for (let i = 0; i < polygons.length; i++) {
    if (i + 1 < polygons.length) {
      out.push(
        new Morph(polygons[i].normalized(), polygons[i + 1].normalized()),
      );
    } else if (circularSequence) {
      out.push(new Morph(polygons[i].normalized(), polygons[0].normalized()));
    }
  }
  return out;
}

const boundsWidth = (b) => b[2] - b[0];
const boundsHeight = (b) => b[3] - b[1];

// calculateScaleFactor(indicatorPolygons)
function calculateScaleFactor(indicatorPolygons) {
  let scaleFactor = 1;
  const bounds = new Float64Array(4);
  const maxBounds = new Float64Array(4);
  for (const polygon of indicatorPolygons) {
    polygon.calculateBounds(bounds);
    polygon.calculateMaxBounds(maxBounds);
    const scaleX = boundsWidth(bounds) / boundsWidth(maxBounds);
    const scaleY = boundsHeight(bounds) / boundsHeight(maxBounds);
    scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY));
  }
  return scaleFactor;
}

// LoadingIndicatorDefaults.ActiveIndicatorScale = IndicatorSize / min(ContainerWidth, ContainerHeight)
// Tokens: container 48dp, active size 38dp (md.comp.loading-indicator).
const CONTAINER_DP = 48;
const ACTIVE_DP = 38;
const ActiveIndicatorScale = ACTIVE_DP / CONTAINER_DP;

/* =========================================================================
 * Path generation: toPath of a Morph at a progress, then scale/center into
 * the 48x48 draw surface centered at origin (replicating processPath, but in
 * a box centered at (0,0) so it drops into <g transform="translate(24 24)">).
 * ========================================================================= */

// Convert a list of cubics to anchors/controls; the path is M a0 then C per cubic.
function cubicsToPathData(cubics) {
  // returns {start:[x,y], segs:[[c0x,c0y,c1x,c1y,a1x,a1y], ...]}
  const start = [cubics[0].anchor0X, cubics[0].anchor0Y];
  const segs = cubics.map((c) => [
    c.control0X,
    c.control0Y,
    c.control1X,
    c.control1Y,
    c.anchor1X,
    c.anchor1Y,
  ]);
  return {start, segs};
}

// Compute the axis-aligned bounds of a set of cubics (true bounds, like
// Path.getBounds()). Compose Path.getBounds returns the geometric bounds of
// the actual curves.
function cubicsBounds(cubics) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const tmp = new Float64Array(4);
  for (const c of cubics) {
    c.calculateBounds(tmp, false); // exact bounds (curve extrema)
    if (tmp[0] < minX) minX = tmp[0];
    if (tmp[1] < minY) minY = tmp[1];
    if (tmp[2] > maxX) maxX = tmp[2];
    if (tmp[3] > maxY) maxY = tmp[3];
  }
  return [minX, minY, maxX, maxY];
}

/*
 * processPath replication (Compose LoadingIndicator):
 *   scale = size.width * scaleFactor          // size = the DRAW size, which
 *   path.transform(scale about (0,0))         //        is the 48dp CONTAINER
 *   path.translate(size.center - bounds.center)
 * with scaleFactor = calculateScaleFactor(polygons) * ActiveIndicatorScale and
 * ActiveIndicatorScale = ActiveSize / ContainerSize (38/48). So the effective
 * scale of the normalized [0,1] morph is CONTAINER_DP * cSF * (38/48) =
 * 38 * cSF — the active-size nominal, trimmed by cSF so the morph never clips
 * during rotation. size = CONTAINER_DP, NOT ACTIVE_DP: the draw size IS the
 * container and ActiveIndicatorScale already steps it down to the active size;
 * using 38 here applied the 38/48 twice and rendered the shape ~0.79x too
 * small. We recenter on the ORIGIN (not size.center) for the
 * <g translate(24 24)> consumer (a 48px box = the draw surface).
 */
function morphToCenteredPath(morph, progress) {
  const cubics = morph.asCubics(progress);
  const size = CONTAINER_DP;
  const s =
    size *
    (calculateScaleFactor(IndeterminateIndicatorPolygons) *
      ActiveIndicatorScale);
  // scale about origin
  const scaled = cubics.map((c) => c.transformed((x, y) => [x * s, y * s]));
  // recenter so the bounds center is at (0,0)
  const b = cubicsBounds(scaled);
  const cx = (b[0] + b[2]) / 2;
  const cy = (b[1] + b[3]) / 2;
  const centered = scaled.map((c) => c.transformed((x, y) => [x - cx, y - cy]));
  return centered;
}

const fmt = (n) => {
  // 2 decimals; avoid "-0.00"
  let v = Math.round(n * 100) / 100;
  if (Object.is(v, -0)) v = 0;
  return v.toFixed(2);
};

function cubicsToSvg(cubics) {
  const {start, segs} = cubicsToPathData(cubics);
  let d = `M${fmt(start[0])} ${fmt(start[1])}`;
  for (const sg of segs) {
    d += `C${fmt(sg[0])} ${fmt(sg[1])} ${fmt(sg[2])} ${fmt(sg[3])} ${fmt(sg[4])} ${fmt(sg[5])}`;
  }
  d += "Z";
  return d;
}

/* =========================================================================
 * Unify cubic counts across all keyframes via even subdivision (De Casteljau).
 * Splitting a cubic into N pieces is geometry-preserving (Cubic.split).
 * ========================================================================= */

function splitCubicEven(cubic, n) {
  if (n <= 1) return [cubic];
  const out = [];
  let remaining = cubic;
  for (let i = 0; i < n - 1; i++) {
    // we want to cut `remaining` at the point that leaves (n-1-i) equal pieces after.
    // The next piece should be 1/(n-i) of the remaining parameter span.
    const t = 1 / (n - i);
    const [a, b] = remaining.split(t);
    out.push(a);
    remaining = b;
  }
  out.push(remaining);
  return out;
}

// Upsample a list of `count` cubics to exactly `target` cubics by distributing
// the extra subdivisions as evenly as possible across the cubics. This keeps
// the path geometry identical while matching command structure for SMIL.
function resampleCubics(cubics, target) {
  const count = cubics.length;
  if (count === target) return cubics.slice();
  if (count > target)
    throw new Error(`cannot reduce cubic count (${count} -> ${target})`);
  // base splits per cubic + remainder distributed to the first `rem` cubics.
  const base = Math.floor(target / count);
  const rem = target - base * count;
  const out = [];
  for (let i = 0; i < count; i++) {
    const pieces = base + (i < rem ? 1 : 0);
    const split = splitCubicEven(cubics[i], pieces);
    for (const c of split) out.push(c);
  }
  if (out.length !== target)
    throw new Error(`resample produced ${out.length}, expected ${target}`);
  return out;
}

/* =========================================================================
 * Build the 7 morphs and sample at the four keyframe progresses.
 * Keyframe progresses: 0 (source), 1 (through-target), 1.14 (overshoot),
 * 1 (settle). Timing constants are given and kept verbatim.
 * ========================================================================= */

const OVERSHOOT_PROGRESS = 1.14;
const KEYFRAME_PROGRESSES = [0, 1, OVERSHOOT_PROGRESS, 1];

const morphs = morphSequence(IndeterminateIndicatorPolygons, true);
const COUNT = morphs.length; // 7

// First pass: collect the centered cubic lists for every keyframe so we can
// find the global max cubic count and unify.
const rawKeyframes = []; // [{morphIndex, step, cubics}]
for (let i = 0; i < COUNT; i++) {
  for (let s = 0; s < KEYFRAME_PROGRESSES.length; s++) {
    const cubics = morphToCenteredPath(morphs[i], KEYFRAME_PROGRESSES[s]);
    rawKeyframes.push({morphIndex: i, step: s, cubics});
  }
}

// The Morph already produces a matched, consistent cubic count between its
// start/end, so all four steps of a given morph share the same count. But
// different morphs differ — unify to the global max.
const targetCubicCount = rawKeyframes.reduce(
  (m, k) => Math.max(m, k.cubics.length),
  0,
);

// Second pass: resample each keyframe to the target count, build the SVG d.
//
// Per morph we emit 5 keyframes — source / through-target / overshoot / settle,
// then a HOLD that repeats the settle to the morph boundary. The hold matters:
// a morph's settle (shape N+1 in THIS morph's cubic ordering) and the next
// morph's source (shape N+1 in the NEXT morph's ordering) are the SAME shape
// but a DIFFERENT cubic ordering, so SMIL interpolating between them would
// collapse the shape through its center (measured: extent dips to ~68%). The
// dwell therefore holds the settle, and at the boundary the path JUMPS
// instantly to the next source (both keyframes share a keyTime → discrete, no
// interpolation) — invisible because both render the same shape. Compose
// sidesteps this by drawing each morph independently; SMIL needs the explicit
// hold + jump. Within a morph the orderings match, so those segments
// interpolate smoothly.
const STEP_TIMES = [0, 0.35, 0.52, 0.85, 1]; // source, target, over, settle, hold
const STEP_SPLINES = [
  "0.4 0 0.9 0.6", // source → target (fast through)
  "0.1 0.4 0.4 1", // target → overshoot (brake)
  "0.45 0 0.4 1", // overshoot → settle
  "0 0 1 1", // settle → hold (dwell, no change)
  "0 0 1 1", // hold → next source (instant jump at the boundary)
];
const morphValues = [];
const morphTimes = [];
const morphSplines = [];
const cubicCountsPerKeyframe = [];
const pushKeyframe = (cubics, time) => {
  const unified = resampleCubics(cubics, targetCubicCount);
  cubicCountsPerKeyframe.push(unified.length);
  morphValues.push(cubicsToSvg(unified));
  morphTimes.push(time);
};
for (let i = 0; i < COUNT; i++) {
  const stepCubics = (s) =>
    rawKeyframes[i * KEYFRAME_PROGRESSES.length + s].cubics;
  for (let s = 0; s < STEP_TIMES.length; s++) {
    // step 4 (the hold) reuses step 3 (the settle).
    pushKeyframe(stepCubics(Math.min(s, 3)), (i + STEP_TIMES[s]) / COUNT);
  }
  morphSplines.push(...STEP_SPLINES);
}

// Seamless close at keyTime 1: the last morph's hold (SoftBurst in morph 6's
// ordering) jumps to SHAPES[0] (SoftBurst in morph 0's ordering), and the loop
// restarts at keyTime 0 with that exact value, so value[0] === value[last].
pushKeyframe(morphToCenteredPath(morphs[0], 0), 1);

const MORPH_VALUES = morphValues.join(";");
const MORPH_TIMES = morphTimes.map((t) => +t.toFixed(4)).join(";");
const MORPH_SPLINES = morphSplines.join(";");

/* =========================================================================
 * VERIFICATION  (mandatory)
 * ========================================================================= */

const errors = [];
const assert = (cond, msg) => {
  if (!cond) errors.push(msg);
};

// Each morph contributes STEP_TIMES.length keyframes (source, target,
// overshoot, settle, hold) and STEP_SPLINES.length transitions; one extra
// closing keyframe makes the loop seamless. So keyframes = COUNT*5 + 1 (36)
// and splines = COUNT*5 = keyframes - 1 (35).
const EXPECTED_KEYFRAMES = COUNT * STEP_TIMES.length + 1;
const EXPECTED_SPLINES = COUNT * STEP_SPLINES.length;

// 1) No NaN/Infinity anywhere; all values M...Z; identical C count.
const valueList = MORPH_VALUES.split(";");
assert(
  valueList.length === EXPECTED_KEYFRAMES,
  `expected ${EXPECTED_KEYFRAMES} MORPH_VALUES, got ${valueList.length}`,
);
let cCount = null;
for (let i = 0; i < valueList.length; i++) {
  const v = valueList[i];
  assert(/^M/.test(v), `value ${i} does not start with M`);
  assert(/Z$/.test(v), `value ${i} does not end with Z`);
  assert(!/(NaN|Infinity)/.test(v), `value ${i} contains NaN/Infinity`);
  const n = (v.match(/C/g) || []).length;
  if (cCount === null) cCount = n;
  assert(n === cCount, `value ${i} has ${n} C commands, expected ${cCount}`);
}
// every C count entry equal
assert(
  new Set(cubicCountsPerKeyframe).size === 1,
  `cubic counts differ: ${[...new Set(cubicCountsPerKeyframe)].join(",")}`,
);
assert(
  cubicCountsPerKeyframe[0] === cCount,
  `path C count (${cCount}) != cubic count (${cubicCountsPerKeyframe[0]})`,
);
// Seamless loop: the closing keyframe must be byte-identical to the opening
// one (0) — both are SoftBurst at morph-0 progress 0, resampled identically.
assert(
  valueList[0] === valueList[valueList.length - 1],
  "value[0] != value[last] (loop is not seamless)",
);

// times: one per keyframe, last is 1, monotonic non-decreasing
const timeList = MORPH_TIMES.split(";").map(Number);
assert(
  timeList.length === EXPECTED_KEYFRAMES,
  `expected ${EXPECTED_KEYFRAMES} MORPH_TIMES, got ${timeList.length}`,
);
assert(
  Math.abs(timeList[0] - 0) < 1e-9,
  `first time should be 0, got ${timeList[0]}`,
);
assert(
  Math.abs(timeList[timeList.length - 1] - 1) < 1e-9,
  `last time should be 1`,
);
for (let i = 1; i < timeList.length; i++) {
  assert(
    timeList[i] >= timeList[i - 1] - 1e-9,
    `times not non-decreasing at ${i}: ${timeList[i - 1]} -> ${timeList[i]}`,
  );
}
// splines: one per transition (keyframes - 1)
const splineList = MORPH_SPLINES.split(";");
assert(
  splineList.length === EXPECTED_SPLINES,
  `expected ${EXPECTED_SPLINES} MORPH_SPLINES, got ${splineList.length}`,
);
assert(
  splineList.length === valueList.length - 1,
  `splines (${splineList.length}) must equal keyframes-1 (${valueList.length - 1})`,
);

// 2) Sanity-render each base shape into /tmp/shape-<name>.svg + report bbox,
//    cubic count and lobe count (local maxima of radius about the centroid).
function svgForShape(polygon) {
  // place the normalized [0,1] shape into a 0..38 box (scale by 38).
  const scaled = polygon.cubics.map((c) =>
    c.transformed((x, y) => [x * 38, y * 38]),
  );
  let d = cubicsToSvg(scaled);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" width="76" height="76"><path d="${d}" fill="#3b6ce4"/></svg>\n`;
}

// Sample r(theta) by walking the outline at ARC-LENGTH-uniform steps (so the
// many zero-length cubics in cookie/star shapes do not distort sampling). We
// build a dense polyline of the outline, then bin by angle about the centroid
// and take the max radius per angular bin, yielding a clean r(theta) curve.
function radiusByAngle(polygon, angleBins = 720) {
  const cubics = polygon.cubics;
  const cx = polygon.centerX;
  const cy = polygon.centerY;
  // dense sample each non-zero cubic proportionally to its (approx) length.
  const pts = [];
  for (const c of cubics) {
    if (c.zeroLength()) continue;
    const len =
      Math.hypot(c.anchor1X - c.anchor0X, c.anchor1Y - c.anchor0Y) +
      Math.hypot(c.control0X - c.anchor0X, c.control0Y - c.anchor0Y) +
      Math.hypot(c.control1X - c.control0X, c.control1Y - c.control0Y) +
      Math.hypot(c.anchor1X - c.control1X, c.anchor1Y - c.control1Y);
    const steps = Math.max(8, Math.ceil(len * 600));
    for (let i = 0; i < steps; i++) {
      const p = c.pointOnCurve(i / steps);
      pts.push(p);
    }
  }
  const maxR = new Float64Array(angleBins).fill(-1);
  for (const p of pts) {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const r = Math.hypot(dx, dy);
    let a = Math.atan2(dy, dx);
    if (a < 0) a += TwoPi;
    const bin = Math.min(angleBins - 1, Math.floor((a / TwoPi) * angleBins));
    if (r > maxR[bin]) maxR[bin] = r;
  }
  // fill empty bins by nearest-neighbour interpolation (robustness).
  for (let i = 0; i < angleBins; i++) {
    if (maxR[i] < 0) {
      let lo = i,
        hi = i;
      while (maxR[(lo + angleBins) % angleBins] < 0) lo--;
      while (maxR[hi % angleBins] < 0) hi++;
      const a = maxR[((lo % angleBins) + angleBins) % angleBins];
      const b = maxR[hi % angleBins];
      maxR[i] = (a + b) / 2;
    }
  }
  return maxR;
}

// Circular moving-average smooth (removes the per-bin jitter of the max-radius
// envelope so true lobes read cleanly).
function smoothCircular(arr, win) {
  const N = arr.length;
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    for (let k = -win; k <= win; k++) sum += arr[(i + k + N) % N];
    out[i] = sum / (2 * win + 1);
  }
  return out;
}

// Count distinct angular lobes via topographic prominence: for each local
// maximum of the smoothed r(theta), find the deeper of its two neighbouring
// valleys and keep the peak if (peak - valley) exceeds a fraction of the total
// radius range. Run-collapses flat tops. Works uniformly for cookie/star lobes,
// the 2 maxima of pill/oval, and the unevenly-spaced pentagon vertices; a true
// circle (range ~ 0) reports 0.
function countDistinctPeaks(polygon) {
  const N = 720;
  const r = smoothCircular(radiusByAngle(polygon, N), 4);
  const rmin = Math.min(...r);
  const rmax = Math.max(...r);
  const rng = rmax - rmin;
  if (rng < 1e-3) return 0; // a circle has no lobes in this sense
  const W = 10; // local-dominance window (~5 degrees)
  // collect local-maximum indices (flat tops collapse to their first index).
  const maxima = [];
  const isLocalMax = new Array(N).fill(false);
  for (let i = 0; i < N; i++) {
    const cur = r[i];
    let ok = true;
    for (let k = 1; k <= W; k++) {
      if (r[(i - k + N) % N] > cur + 1e-9 || r[(i + k) % N] > cur + 1e-9) {
        ok = false;
        break;
      }
    }
    isLocalMax[i] = ok;
  }
  // collapse adjacent local-max runs into a single representative index.
  let startOffset = 0;
  while (startOffset < N && isLocalMax[startOffset]) startOffset++;
  if (startOffset === N) return 1;
  for (let j = 0; j < N; j++) {
    const idx = (startOffset + j) % N;
    if (isLocalMax[idx] && !isLocalMax[(startOffset + j - 1 + N) % N])
      maxima.push(idx);
  }
  if (maxima.length <= 1) return maxima.length;
  // prominence: for each peak, the min radius along the arc to each adjacent
  // peak; take the shallower-side valley. Keep peaks with prominence > 12%.
  const minThresh = rng * 0.12;
  let peaks = 0;
  for (let m = 0; m < maxima.length; m++) {
    const here = maxima[m];
    const prevPeak = maxima[(m - 1 + maxima.length) % maxima.length];
    const nextPeak = maxima[(m + 1) % maxima.length];
    const valLeft = arcMin(r, prevPeak, here, N);
    const valRight = arcMin(r, here, nextPeak, N);
    const valley = Math.max(valLeft, valRight); // shallower neighbouring valley
    if (r[here] - valley > minThresh) peaks++;
  }
  return peaks;
}

// Minimum of the circular array along the arc from index a to index b (exclusive
// endpoints), walking forward (a -> b modulo N).
function arcMin(r, a, b, N) {
  let lo = Infinity;
  let i = (a + 1) % N;
  while (i !== b) {
    if (r[i] < lo) lo = r[i];
    i = (i + 1) % N;
  }
  return lo === Infinity ? Math.min(r[a], r[b]) : lo;
}

const baseShapes = {
  softBurst: MaterialShapes.SoftBurst,
  cookie9: MaterialShapes.Cookie9Sided,
  pentagon: MaterialShapes.Pentagon,
  pill: MaterialShapes.Pill,
  sunny: MaterialShapes.Sunny,
  cookie4: MaterialShapes.Cookie4Sided,
  oval: MaterialShapes.Oval,
};
const expectedLobes = {
  softBurst: 10,
  cookie9: 9,
  pentagon: 5,
  pill: 2,
  sunny: 8,
  cookie4: 4,
  oval: 2,
};

const shapeReport = {};
for (const [name, poly] of Object.entries(baseShapes)) {
  writeFileSync(`/tmp/shape-${name}.svg`, svgForShape(poly));
  const b = poly.calculateBounds(new Float64Array(4), false);
  const peaks = countDistinctPeaks(poly);
  shapeReport[name] = {
    cubics: poly.cubics.length,
    bbox: [b[0], b[1], b[2], b[3]].map((x) => +x.toFixed(4)),
    peaks,
    expectedLobes: expectedLobes[name],
  };
}

// 3) Continuity: morph 0 (SoftBurst -> Cookie9) at 0, 0.5, 1; the matched
//    anchor points should move monotonically (no flips). Check that each
//    matched cubic's anchor0 at 0.5 lies between the anchors at 0 and 1.
function continuityCheck(morph) {
  const m = morph._morphMatch;
  let monotonic = true;
  let worstDeviation = 0;
  for (let i = 0; i < m.length; i++) {
    const a = m[i][0]; // start cubic
    const b = m[i][1]; // end cubic
    // anchor0 at progress 0, 0.5, 1
    const a0_0 = [a.anchor0X, a.anchor0Y];
    const a0_1 = [b.anchor0X, b.anchor0Y];
    const a0_half = [
      interpolate(a.anchor0X, b.anchor0X, 0.5),
      interpolate(a.anchor0Y, b.anchor0Y, 0.5),
    ];
    // midpoint of straight segment between endpoints
    const mid = [(a0_0[0] + a0_1[0]) / 2, (a0_0[1] + a0_1[1]) / 2];
    const dev = Math.hypot(a0_half[0] - mid[0], a0_half[1] - mid[1]);
    worstDeviation = Math.max(worstDeviation, dev);
    // For pure lerp, the half should EXACTLY equal the midpoint -> dev ~ 0.
    if (dev > 1e-6) monotonic = false;
  }
  return {matchedCubics: m.length, monotonic, worstDeviation};
}
const continuity = continuityCheck(morphs[0]);

// 4) NO-COLLAPSE CHECK (mandatory). The feature-matching bug we are guarding
//    against makes a morph between two similarly-sized shapes shrink toward the
//    center and re-expand mid-transition (matched points crossing through the
//    center). For EACH of the 7 morphs, sample the interpolated SHAPE at
//    progress 0.1/0.25/0.5/0.75/0.9, take the max-extent (max of bbox width and
//    height, true curve bounds) of the resulting path, and assert no intermediate
//    extent drops below 85% of the smaller of the two endpoint shapes' extents.
//    (The deliberate 14% overshoot lives only at the OVERSHOOT keyframe, which is
//    outside [0,1] and not sampled here, so this is a pure no-collapse bound.)
//    Measured on the Morph's own asCubics() in normalized units — SMIL's linear
//    blend between the stored progress-0 and progress-1 keyframes reproduces
//    exactly this interpolation (resampling cuts each matched cubic at the same t
//    regardless of progress), so this is the faithful in-between geometry.
const NO_COLLAPSE_PROGRESSES = [0.1, 0.25, 0.5, 0.75, 0.9];
const NO_COLLAPSE_FLOOR = 0.85;
const morphNames = [
  "SoftBurst->Cookie9",
  "Cookie9->Pentagon",
  "Pentagon->Pill",
  "Pill->Sunny",
  "Sunny->Cookie4",
  "Cookie4->Oval",
  "Oval->SoftBurst",
];
function morphMaxExtentAt(morph, progress) {
  const cubics = morph.asCubics(progress);
  const b = cubicsBounds(cubics); // true curve extrema bounds
  return Math.max(b[2] - b[0], b[3] - b[1]);
}
const noCollapseReport = [];
for (let i = 0; i < morphs.length; i++) {
  const e0 = morphMaxExtentAt(morphs[i], 0);
  const e1 = morphMaxExtentAt(morphs[i], 1);
  const smaller = Math.min(e0, e1);
  const samples = NO_COLLAPSE_PROGRESSES.map((p) => ({
    p,
    extent: morphMaxExtentAt(morphs[i], p),
  }));
  let minRatio = Infinity;
  let minAt = null;
  for (const s of samples) {
    const ratio = s.extent / smaller;
    if (ratio < minRatio) {
      minRatio = ratio;
      minAt = s.p;
    }
  }
  const entry = {
    morph: i,
    name: morphNames[i],
    endpointExtents: [+e0.toFixed(4), +e1.toFixed(4)],
    smallerEndpointExtent: +smaller.toFixed(4),
    samples: samples.map((s) => ({
      progress: s.p,
      extent: +s.extent.toFixed(4),
      ratioToSmaller: +(s.extent / smaller).toFixed(4),
    })),
    minRatioToSmaller: +minRatio.toFixed(4),
    minRatioAtProgress: minAt,
    ok: minRatio >= NO_COLLAPSE_FLOOR,
  };
  noCollapseReport.push(entry);
  assert(
    entry.ok,
    `morph ${i} (${morphNames[i]}) COLLAPSES: intermediate extent drops to ` +
      `${(minRatio * 100).toFixed(1)}% of the smaller endpoint extent at ` +
      `progress ${minAt} (must stay >= ${(NO_COLLAPSE_FLOOR * 100).toFixed(0)}%)`,
  );
}
const worstNoCollapseRatio = Math.min(
  ...noCollapseReport.map((e) => e.minRatioToSmaller),
);

// emit results
const out = {
  MORPH_VALUES,
  MORPH_TIMES,
  MORPH_SPLINES,
  valueCount: valueList.length,
  splineCount: splineList.length,
  unifiedCubicCount: cCount,
  cubicCountPerKeyframe: cubicCountsPerKeyframe,
  rawCubicCountsPerMorph: Array.from(
    {length: COUNT},
    (_, i) => rawKeyframes[i * 4].cubics.length,
  ),
  targetCubicCount,
  scaleFactor: calculateScaleFactor(IndeterminateIndicatorPolygons),
  activeIndicatorScale: ActiveIndicatorScale,
  shapeReport,
  continuity,
  noCollapse: {
    progressesSampled: NO_COLLAPSE_PROGRESSES,
    floor: NO_COLLAPSE_FLOOR,
    worstRatioToSmaller: +worstNoCollapseRatio.toFixed(4),
    perMorph: noCollapseReport,
  },
  morphValuesBytes: Buffer.byteLength(MORPH_VALUES, "utf8"),
  errors,
};

writeFileSync("/tmp/loader-out.json", JSON.stringify(out, null, 2));

// Emit the component data module (the only thing that ships — this script is
// dev-only). LoadingIndicator imports these three constants.
const dataFile = new URL(
  "../src/components/progress-bar/_loadingIndicatorShapes.ts",
  import.meta.url,
);
writeFileSync(
  dataFile,
  `// GENERATED by scripts/gen-loading-indicator.mjs — DO NOT EDIT BY HAND.
// Exact M3 Expressive loading-indicator morph, ported 1:1 from
// androidx.graphics.shapes (RoundedPolygon corner-rounding + Morph) over the
// official MaterialShapes sequence: SoftBurst → Cookie9 → Pentagon → Pill →
// Sunny → Cookie4 → Oval. ${MORPH_VALUES.split(";")[0].match(/C/g).length} cubics per keyframe, centered at the
// origin; the consumer drops them into a 48×48 box (the 48dp container =
// Compose's draw surface) via <g transform="translate(24 24)">. The nominal
// active size is 38dp, but the spring overshoot pulses the shape larger, so
// the box is the full container (a 38px box would clip the pulse peak).

/** 36 morph keyframe paths: 7 morphs × 5 steps (source / target / overshoot /
 * settle / boundary-hold) + a seamless close. The hold + a keyTime collision
 * make each morph boundary an instant jump (no cross-morph interpolation, which
 * would collapse the shape through its center). */
export const MORPH_VALUES =
    "${MORPH_VALUES}";

/** keyTimes for the morph: (i + step)/7 over steps [0, .35, .52, .85], + 1. */
export const MORPH_TIMES = "${MORPH_TIMES}";

/** keySplines replaying the Compose morph spring (through / brake / settle / dwell). */
export const MORPH_SPLINES =
    "${MORPH_SPLINES}";
`,
);

// stdout summary
console.log("=== gen-loading-indicator ===");
console.log(
  "scaleFactor =",
  out.scaleFactor.toFixed(6),
  "| ActiveIndicatorScale =",
  out.activeIndicatorScale.toFixed(6),
);
console.log(
  "raw cubic counts per morph:",
  out.rawCubicCountsPerMorph.join(", "),
);
console.log(
  "unified cubic count (per keyframe):",
  cCount,
  "| value count:",
  valueList.length,
  "| spline count:",
  splineList.length,
);
console.log("");
console.log("Base shapes (cubics | bbox | detected peaks vs expected lobes):");
for (const [name, r] of Object.entries(shapeReport)) {
  console.log(
    `  ${name.padEnd(9)} cubics=${String(r.cubics).padStart(3)}  bbox=[${r.bbox.join(", ")}]  peaks=${r.peaks} (expect ${r.expectedLobes})`,
  );
}
console.log("");
console.log(
  "Continuity (morph 0 SoftBurst->Cookie9):",
  JSON.stringify(continuity),
);
console.log("");
console.log(
  `No-collapse check (max-extent per morph at progress ${NO_COLLAPSE_PROGRESSES.join("/")}; ` +
    `must stay >= ${(NO_COLLAPSE_FLOOR * 100).toFixed(0)}% of the smaller endpoint extent):`,
);
{
  const head =
    "  morph                       smaller " +
    NO_COLLAPSE_PROGRESSES.map((p) => `p${p}`.padStart(8)).join("") +
    "    min%";
  console.log(head);
  for (const e of noCollapseReport) {
    const cells = e.samples
      .map((s) => s.extent.toFixed(4).padStart(8))
      .join("");
    const flag = e.ok ? " OK" : " !!COLLAPSE";
    console.log(
      `  ${e.name.padEnd(22)} ${e.smallerEndpointExtent
        .toFixed(4)
        .padStart(7)}${cells}  ${(e.minRatioToSmaller * 100)
        .toFixed(1)
        .padStart(6)}%${flag}`,
    );
  }
  console.log(
    `  worst intermediate ratio across all 7 morphs: ${(
      worstNoCollapseRatio * 100
    ).toFixed(1)}% (floor ${(NO_COLLAPSE_FLOOR * 100).toFixed(0)}%)`,
  );
}
console.log("");
console.log(
  `MORPH_VALUES: ${valueList.length} keyframes x ${cCount} cubics; ` +
    `${out.morphValuesBytes} bytes.`,
);
console.log("");
if (errors.length) {
  console.log("!!! VERIFICATION ERRORS:");
  for (const e of errors) console.log("  -", e);
} else {
  console.log("VERIFICATION: all assertions passed.");
}
console.log("");
console.log("---- MORPH_VALUES ----");
console.log(MORPH_VALUES);
console.log("---- MORPH_TIMES ----");
console.log(MORPH_TIMES);
console.log("---- MORPH_SPLINES ----");
console.log(MORPH_SPLINES);

if (errors.length) process.exitCode = 1;
