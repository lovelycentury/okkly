"use client";

import { forwardRef, useId, type HTMLAttributes, type CSSProperties } from "react";
import "@okkly/design-system/components/Logo/Logo.scss";

export type LogoLayout = "compact" | "horizontal" | "stacked";
export type LogoTone = "multi" | "mint" | "indigo" | "dante" | "violet" | "ember";
export type LogoVariant = "filled" | "outlined" | "pure";

/**
 * The mark is authored at 72×72 in Figma; every number below is in that space,
 * so the geometry can be compared against the source export line for line.
 */
const VB = 72;
const STROKE = 3.375;

/** Ring inset by half a stroke so the outline sits flush inside the box. */
const RING_R = VB / 2 - STROKE / 2;

/**
 * The glyph's own bounds, stroke included, padded to a square on its narrow
 * axis: the ink spans x 20.8125–52.875 and y 20.8125–54.5625, which half a
 * stroke either side grows to 35.4375 × 37.125.
 */
const GLYPH_BOX = { x: 18.28125, y: 19.125, size: 37.125 };

/**
 * Cropping to the glyph magnifies everything by VB/size, so pre-shrink the
 * stroke by the same factor and `pure` carries the weight the others do.
 */
const PURE_STROKE = (STROKE * GLYPH_BOX.size) / VB;

/** The wand-and-spark glyph, exactly as exported from Figma. */
const Glyph = () => (
  <>
    <path d="M32.5235 39.4764L25.8747 46.1252L22.6685 42.9189C22.3547 42.6055 22.1058 42.2333 21.936 41.8236C21.7661 41.4139 21.6787 40.9747 21.6787 40.531C21.6787 40.0875 21.7661 39.6483 21.936 39.2386C22.1058 38.8289 22.3547 38.4567 22.6685 38.1433L35.9997 24.812C36.3131 24.4982 36.6855 24.2493 37.0952 24.0794C37.505 23.9096 37.9442 23.8223 38.3876 23.8223C38.8311 23.8223 39.2703 23.9096 39.68 24.0794C40.0898 24.2493 40.4619 24.4982 40.7753 24.812L46.1247 25.8752" />
    <path d="M36 20.8125V27.5625" />
    <path d="M20.8125 36H27.5625" />
    <path d="M46.125 41.0625L47.8125 46.125L52.875 47.8125L47.8125 49.5L46.125 54.5625L44.4375 49.5L39.375 47.8125L44.4375 46.125L46.125 41.0625Z" />
  </>
);

/**
 * Brand logo — the disc mark in three treatments.
 *
 * `filled` is the identity mark: a tone disc with the glyph knocked out in ink.
 * `outlined` reduces the disc to a ring and strokes the glyph in the tone, for
 * one-ink use — stamps, engraving, watermarks. `pure` drops the container
 * altogether and crops to the glyph, for favicons and dense chrome.
 *
 * `layout` controls arrangement: `compact` (nav bars), `horizontal` (headers),
 * `stacked` (mobile, centered emblem with the label below).
 */
export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lockup arrangement. Default: "horizontal"
   *
   * @default "horizontal"
   * @type {LogoLayout}
   */
  layout?: LogoLayout;
  /**
   * Container treatment. Default: "filled"
   *
   * @default "filled"
   * @type {LogoVariant}
   */
  variant?: LogoVariant;
  /**
   * Emblem colorway. Default: "multi" (the brand gradient)
   *
   * @default "multi"
   * @type {LogoTone}
   */
  tone?: LogoTone;
  /**
   * Wordmark text. Default: "okkly"
   *
   * @default "okkly"
   * @type {string}
   */
  label?: string;
  /**
   * Hide the wordmark. Default: true
   *
   * @default true
   * @type {boolean}
   */
  showLabel?: boolean;
  /**
   * Overrides emblem size. Defaults: compact 24px, others 48px
   *
   * @default undefined
   * @type {number | string}
   */
  size?: number | string;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(function Logo(
  {
    layout = "horizontal",
    variant = "filled",
    tone = "multi",
    label = "okkly",
    showLabel = true,
    size,
    className,
    style,
    ...rest
  },
  ref,
) {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `okkly-logo-gradient-${rawId}`;
  const isMulti = tone === "multi";

  const classes = [
    "okkly-component",
    "okkly-logo",
    layout !== "horizontal" && `okkly-logo--${layout}`,
    variant !== "filled" && `okkly-logo--${variant}`,
    !isMulti && `okkly-logo--tone-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CSSProperties | undefined = size
    ? ({
        "--okkly-logo-emblem-size": typeof size === "number" ? `${size}px` : size,
        ...style,
      } as CSSProperties)
    : style;

  // "multi" keeps the signature mint→dante sweep; every other tone is flat, so
  // it paints straight from the tone variable and needs no gradient at all.
  const ink = isMulti ? `url(#${gradientId})` : "var(--okkly-logo-tone)";

  const defs = isMulti ? (
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2={VB} y2={VB} gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--okkly-logo-gradient-start)" />
        <stop offset="1" stopColor="var(--okkly-logo-gradient-end)" />
      </linearGradient>
    </defs>
  ) : null;

  const stroked = {
    fill: "none",
    strokeWidth: STROKE,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  const renderEmblem = () => {
    if (variant === "pure") {
      const { x, y, size: s } = GLYPH_BOX;
      return (
        <svg
          className="okkly-logo__emblem"
          viewBox={`${x} ${y} ${s} ${s}`}
          fill="none"
          stroke={ink}
          strokeWidth={PURE_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {defs}
          <Glyph />
        </svg>
      );
    }

    if (variant === "outlined") {
      return (
        <svg
          className="okkly-logo__emblem"
          viewBox={`0 0 ${VB} ${VB}`}
          stroke={ink}
          {...stroked}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {defs}
          <circle cx={VB / 2} cy={VB / 2} r={RING_R} />
          <Glyph />
        </svg>
      );
    }

    return (
      <svg
        className="okkly-logo__emblem"
        viewBox={`0 0 ${VB} ${VB}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {defs}
        <circle cx={VB / 2} cy={VB / 2} r={VB / 2} fill={ink} />
        <g stroke="var(--okkly-logo-ink)" {...stroked}>
          <Glyph />
        </g>
      </svg>
    );
  };

  return (
    <div ref={ref} className={classes} style={mergedStyle} {...rest}>
      {renderEmblem()}
      {showLabel && <span className="okkly-logo__label">{label}</span>}
    </div>
  );
});
