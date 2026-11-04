import * as THREE from 'three';

export const BRAND = { ink: '#0e1116', mint: '#34d399', paper: '#f6f7fb', dot: '#2ba87c' };

// Capsule along +Y, 2 units tip to tip: radius R, straight part 2 * HALF.
const R = 0.5;
const HALF = 0.5;
const ARC = HALF + (Math.PI / 2) * R; // waist-to-tip length along the surface
const STEPS = 48;
const SEGMENTS = 64;
// Logo units (64-unit SVG, pill radius 13) to 3D units.
const K = R / 13;

/** One half of the capsule, waist (y = 0) to tip, sampled evenly by surface length so texture rows are even. */
function halfProfile(): THREE.Vector2[] {
  return Array.from({ length: STEPS + 1 }, (_, i) => {
    const s = (i / STEPS) * ARC;
    if (s <= HALF) return new THREE.Vector2(R, s);
    const a = (s - HALF) / R;
    return new THREE.Vector2(R * Math.cos(a), HALF + R * Math.sin(a));
  });
}

const TEX_W = 1024;
const TEX_H = Math.round((TEX_W * ARC) / (2 * Math.PI * R)); // same pixels per unit both ways
const PX = TEX_W / (2 * Math.PI * R);

/** Surface point on the front (+z) of a half, as (x, y) in 3D units, to texture pixels. */
function toTexture(x: number, y: number): [number, number] {
  let s = y;
  let rho = R;
  if (y > HALF) {
    const a = Math.asin(Math.min(1, (y - HALF) / R));
    s = HALF + a * R;
    rho = R * Math.cos(a);
  }
  const phi = Math.asin(Math.max(-1, Math.min(1, x / rho)));
  // The lathe starts at phi = -PI, so the front of the pill is the middle of the texture.
  return [(0.5 + phi / (2 * Math.PI)) * TEX_W, (1 - s / ARC) * TEX_H];
}

/** Logo coordinates (relative to the pill centre, u along the axis, v across) to 3D surface (x, y). */
const fromLogo = (u: number, v: number): [number, number] => [v * K, u * K];

function canvas(fill: string): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  return [c, ctx];
}

/** Draws a logo-space polyline onto the curved surface, subdividing so it follows the cap. */
function stroke(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.slice(1).forEach(([u1, v1], i) => {
    const [u0, v0] = pts[i];
    for (let t = 0; t <= 10; t++) {
      const [x, y] = toTexture(...fromLogo(u0 + ((u1 - u0) * t) / 10, v0 + ((v1 - v0) * t) / 10));
      if (i === 0 && t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function texture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** White half with the ">_" prompt, placed exactly as in the brand logo. */
function faceTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(BRAND.paper);
  ctx.strokeStyle = BRAND.ink;
  ctx.lineWidth = 1.9 * K * PX;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  stroke(ctx, [[3.3, -4.6], [9, -1.5], [3.3, 1.6]]);
  stroke(ctx, [[10.8, 4.2], [17.1, 4.2]]);
  return texture(c);
}

/** Mint half with its two darker dots. This half is the face texture's half turned upside down. */
function dotsTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(BRAND.mint);
  ctx.fillStyle = BRAND.dot;
  for (const [u, v, r] of [[-15, 1.5, 2.6], [-7.5, 4.5, 1.6]]) {
    const [x, y] = fromLogo(u, v);
    const [px, py] = toTexture(-x, -y); // rotated by PI around Z
    ctx.beginPath();
    ctx.arc(px, py, r * K * PX, 0, Math.PI * 2);
    ctx.fill();
  }
  return texture(c);
}

export interface PillKit {
  makePill(): THREE.Group;
  dispose(): void;
}

/** Shared geometry, textures and materials, so a scene can hold many pills cheaply. */
export function makePillKit(): PillKit {
  const half = new THREE.LatheGeometry(halfProfile(), SEGMENTS, -Math.PI, Math.PI * 2);
  const band = new THREE.CylinderGeometry(R * 1.012, R * 1.012, 0.05, SEGMENTS, 1, true);
  const face = faceTexture();
  const dots = dotsTexture();
  const glossy = { roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.28 };
  const paper = new THREE.MeshPhysicalMaterial({ map: face, ...glossy });
  const mint = new THREE.MeshPhysicalMaterial({ map: dots, ...glossy });
  const ink = new THREE.MeshStandardMaterial({ color: BRAND.ink, roughness: 0.6, side: THREE.DoubleSide });

  return {
    makePill() {
      const pill = new THREE.Group();
      pill.add(new THREE.Mesh(half, paper));
      const bottom = new THREE.Mesh(half, mint);
      bottom.rotation.z = Math.PI;
      pill.add(bottom, new THREE.Mesh(band, ink));
      return pill;
    },
    dispose() {
      [half, band, face, dots, paper, mint, ink].forEach((x) => x.dispose());
    },
  };
}

/** The logo's tilt: white end up and to the right, 40 degrees above horizontal. */
export const LOGO_TILT = -(50 * Math.PI) / 180;
