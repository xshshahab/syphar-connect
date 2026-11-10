import React from "react";

/* Small seeded random generator: the particles are the same on every render
   and every reload, instead of jumping around. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const random = seeded(20241);
const PARTICLES = Array.from({ length: 44 }, () => ({
  left: random() * 100,
  top: random() * 100,
  size: 1 + random() * 2.2,
  duration: 3 + random() * 4,
  delay: -random() * 6,
}));

const AMBIENT = (alpha: number) =>
  [
    `radial-gradient(40% 35% at 50% 8%, rgba(255,35,50,${alpha}), transparent 70%)`,
    `radial-gradient(35% 45% at 8% 55%, rgba(255,35,50,${alpha * 0.9}), transparent 70%)`,
    `radial-gradient(35% 45% at 92% 45%, rgba(255,35,50,${alpha}), transparent 70%)`,
  ].join(",");

/** Everything behind the content: base colour, red ambient light, grid,
 *  curved light trails and tiny particles. Light and dark versions. */
export const Backdrop: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden bg-[#FBF9F9] dark:bg-[#080808]"
  >
    {/* ambient red light */}
    <div
      className="absolute inset-0 dark:hidden"
      style={{ backgroundImage: AMBIENT(0.07) }}
    />
    <div
      className="absolute inset-0 hidden dark:block"
      style={{ backgroundImage: AMBIENT(0.1) }}
    />

    {/* very faint grid that fades towards the edges */}
    <div
      className="absolute inset-0 text-black opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:text-white dark:opacity-[0.045]"
      style={{
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    />

    {/* thin curved light trails */}
    <svg
      className="absolute inset-0 size-full"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="oc-trail" x1="0" x2="1">
          <stop offset="0" stopColor="#ff303b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff303b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff303b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M-40 760 C 380 600, 640 1040, 1060 860 S 1640 520, 1960 660"
        stroke="url(#oc-trail)"
        strokeWidth="1.1"
      />
      <path
        d="M-40 330 C 300 470, 560 150, 980 290 S 1540 480, 1960 200"
        stroke="url(#oc-trail)"
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M-40 980 C 420 900, 900 1080, 1400 960 S 1800 880, 1960 920"
        stroke="url(#oc-trail)"
        strokeWidth="0.9"
        opacity="0.5"
      />
    </svg>

    {/* tiny glowing particles */}
    {PARTICLES.map((p, i) => (
      <span
        key={i}
        className="oc-spark"
        style={
          {
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            "--dur": `${p.duration}s`,
            "--del": `${p.delay}s`,
          } as React.CSSProperties
        }
      />
    ))}

    {/* vignette keeps the corners calm */}
    <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_58%,rgba(225,210,212,0.55))] dark:[background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
  </div>
);

/** Thin red orbital rings and a soft glow, placed behind a window. */
export const Orbits: React.FC = () => (
  <>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-[14%] rounded-[3rem] bg-[radial-gradient(closest-side,rgba(255,35,50,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(255,35,50,0.26),transparent)]"
    />
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[80%] w-[190%] -translate-x-1/2"
      viewBox="0 0 800 240"
      fill="none"
    >
      <defs>
        <linearGradient id="oc-ring" x1="0" x2="1">
          <stop offset="0" stopColor="#ff303b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff303b" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff303b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse
        cx="400"
        cy="120"
        rx="390"
        ry="108"
        stroke="url(#oc-ring)"
        strokeWidth="1"
        opacity="0.35"
      />
      <ellipse
        cx="400"
        cy="120"
        rx="320"
        ry="86"
        stroke="url(#oc-ring)"
        strokeWidth="1.2"
        opacity="0.55"
      />
      <ellipse
        cx="400"
        cy="120"
        rx="240"
        ry="62"
        stroke="url(#oc-ring)"
        strokeWidth="1.6"
      />
      <ellipse
        cx="400"
        cy="120"
        rx="150"
        ry="36"
        stroke="#ff303b"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  </>
);
