import { SPRITE } from "./spriteString";

/** One inline SVG sprite for the whole site (so icons work offline and inherit colour). */
export function IconSprite() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" focusable="false"><defs>${SPRITE}</defs></svg>`,
      }}
    />
  );
}

export function Icon({ name, className = "" }) {
  return (
    <svg className={`icon ${className}`.trim()} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
