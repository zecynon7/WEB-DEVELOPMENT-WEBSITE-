/** Line-art coffee cup: draws itself, fills and steams (CSS does the animating). */
export function Cup({ k }) {
  const wave = "M-50 0 q12.5 -7 25 0" + " t25 0".repeat(11);
  const body = "M44 84H152V128A42 42 0 0 1 110 170H86A42 42 0 0 1 44 128Z";
  return (
    <svg className="cup" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <clipPath id={`cc${k}`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`cg${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2c3a3" />
          <stop offset="1" stopColor="#7a4e2d" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#cc${k})`}>
        <g className="liquid">
          <g transform="translate(0 100)">
            <path className="wave" fill={`url(#cg${k})`} d={`${wave} V90 H-50Z`} />
          </g>
        </g>
      </g>
      <path className="stroke stroke-1" pathLength={1} d={body} />
      <path className="stroke stroke-2" pathLength={1} d="M152 98H162A20 20 0 0 1 162 138H149" />
      <path className="stroke stroke-3" pathLength={1} d="M28 182H168" />
      <path className="steam steam-a" d="M80 66C70 56 90 46 80 34" />
      <path className="steam steam-b" d="M98 66C88 56 108 46 98 34" />
      <path className="steam steam-c" d="M116 66C106 56 126 46 116 34" />
    </svg>
  );
}
