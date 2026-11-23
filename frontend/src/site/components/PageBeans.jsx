// The same floating beans as the home hero, placed behind the title block of every inner page.
// Columns: size, left, top, depth, blur, opacity, seconds, dx, dy, rotate from, rotate to, delay, colour
const BEANS = [
  [64, "72%", "14%", 0.9, 0, 1, 9, 26, -34, -25, 30, 0, "#7a4e2d"],
  [38, "90%", "50%", 0.5, 1, 0.9, 11, -18, 28, 40, -20, -2, "#4a2f1d"],
  [88, "58%", "62%", 1.4, 5, 0.55, 13, 30, -40, 10, 70, -4, "#b9824f"],
  [46, "4%", "66%", 0.7, 0, 1, 10, 22, -30, -50, 15, -1, "#261710"],
  [30, "82%", "8%", 0.4, 2, 0.8, 8, -14, 22, 60, 0, -5, "#e2c3a3"],
  [26, "40%", "80%", 0.3, 1, 0.9, 9, 12, 20, 20, 80, -6, "#b9824f"],
];

export function PageBeans() {
  return (
    <div className="beans" aria-hidden="true">
      {BEANS.map(([s, l, t, d, b, o, du, dx, dy, r0, r1, dl, col], i) => (
        <span
          key={i}
          className="bean"
          data-depth={d}
          style={{
            "--s": s + "px",
            left: l,
            top: t,
            "--b": b + "px",
            "--o": o,
            "--t": du + "s",
            "--dx": dx + "px",
            "--dy": dy + "px",
            "--r0": r0 + "deg",
            "--r1": r1 + "deg",
            "--dl": dl + "s",
            "--bc": col,
          }}
        >
          <svg viewBox="0 0 40 60">
            <use href="#i-bean" />
          </svg>
        </span>
      ))}
    </div>
  );
}
