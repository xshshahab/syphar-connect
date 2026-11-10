import React, { type CSSProperties } from "react";
import { Bookmark, MapPin } from "lucide-react";
import type { CardSpec, Tone } from "./cardData";

// [light surface, dark surface]
const TONES: Record<Tone, [string, string]> = {
  pending: ["#B45309", "#F5B942"],
  accepted: ["#047857", "#10B981"],
  rejected: ["#DC2626", "#EF4444"],
  interview: ["#2563EB", "#60A5FA"],
  meeting: ["#7C3AED", "#A78BFA"],
  offer: ["#059669", "#34D399"],
  neutral: ["#52525B", "#A1A1AA"],
  red: ["#E11D2A", "#FF303B"],
};

const toneVars = (tone: Tone) =>
  ({ "--tl": TONES[tone][0], "--td": TONES[tone][1] }) as CSSProperties;

const OPACITY = { 0: 1, 1: 0.88, 2: 0.42 } as const;

const FloatCard: React.FC<CardSpec & { index: number }> = ({
  side,
  x,
  y,
  rot,
  w,
  depth = 1,
  glow,
  icon: Icon,
  iconTone = "red",
  avatar,
  label,
  tone = "neutral",
  title,
  sub,
  left,
  right,
  bookmark,
  progress,
  index,
}) => {
  const style = {
    [side === "l" ? "left" : "right"]: `${x}%`,
    top: `${y}%`,
    width: `${w}em`,
    zIndex: depth === 2 ? 0 : 1,
    "--r": `${rot}deg`,
    "--ry": `${side === "l" ? 9 : -9}deg`,
    "--o": OPACITY[depth],
    "--d": `${0.12 + index * 0.06}s`,
  } as CSSProperties;

  return (
    <div
      className="oc-card"
      data-glow={glow || undefined}
      data-depth={depth}
      style={style}
    >
      <div
        className="oc-bob"
        style={
          {
            "--bob": `${6 + (index % 4)}s`,
            "--bd": `${-index * 0.9}s`,
          } as CSSProperties
        }
      >
        <div className="flex items-start gap-[0.8em]">
          {avatar ? (
            <span className="flex size-[2.6em] shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[0.9em] font-semibold dark:border-white/10 dark:bg-white/5">
              {avatar}
            </span>
          ) : Icon ? (
            <span
              className="oc-tone-soft flex size-[2.6em] shrink-0 items-center justify-center rounded-[0.8em] border border-black/10 dark:border-white/10"
              style={toneVars(iconTone)}
            >
              <Icon className="size-[1.3em]" strokeWidth={1.8} />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            {label && (
              <p
                className="oc-tone flex items-center gap-[0.45em] text-[0.78em] font-semibold"
                style={toneVars(tone)}
              >
                <i className="oc-tone-bg size-[0.5em] shrink-0 rounded-full" />
                <span className="truncate">{label}</span>
              </p>
            )}
            <p className="line-clamp-2 text-[1em] font-semibold">{title}</p>
            {sub && (
              <p className="truncate text-[0.82em] text-zinc-500 dark:text-zinc-400">
                {sub}
              </p>
            )}
          </div>

          {bookmark && (
            <Bookmark
              className={
                bookmark === "saved"
                  ? "size-[1.2em] shrink-0 fill-[#FF303B] text-[#FF303B]"
                  : "size-[1.2em] shrink-0 text-zinc-400 dark:text-zinc-500"
              }
            />
          )}
        </div>

        {(left || right) && (
          <div className="mt-[0.75em] flex items-center justify-between gap-[0.6em] text-[0.85em]">
            <span className="truncate font-semibold">{left}</span>
            {right && (
              <span className="flex shrink-0 items-center gap-[0.3em] text-[0.92em] text-zinc-500 dark:text-zinc-400">
                <MapPin className="size-[1em]" /> {right}
              </span>
            )}
          </div>
        )}

        {progress !== undefined && (
          <div className="mt-[0.8em] h-[0.4em] overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#FF303B]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/** All the floating cards of one step. Hidden below the `lg` breakpoint. */
export const CardsLayer: React.FC<{ cards: CardSpec[]; active: boolean }> = ({
  cards,
  active,
}) => (
  <div
    aria-hidden="true"
    data-active={active || undefined}
    className="oc-layer pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
  >
    {cards.map((card, index) => (
      <FloatCard key={card.title + index} {...card} index={index} />
    ))}
  </div>
);
