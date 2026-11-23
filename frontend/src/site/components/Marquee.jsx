import { useEffect, useRef, useState } from "react";
import { BB, clamp, onFrame, onResize, reduceMotion } from "../../motion/engine";

/** Endless horizontal loop. It speeds up and skews with the scroll speed (same maths as the original). */
export function Marquee({ children, className, speed = 70, dir = "left", ariaHidden }) {
  const box = useRef(null);
  const track = useRef(null);
  const group = useRef(null);
  const [copies, setCopies] = useState(0);
  const state = useRef({ x: 0, gw: 0, visible: true });
  const d = dir === "right" ? 1 : -1;

  useEffect(() => {
    if (reduceMotion || !box.current || !group.current) return;
    const build = () => {
      const gw = group.current.getBoundingClientRect().width;
      state.current.gw = gw;
      if (!gw) return;
      setCopies(Math.ceil((box.current.clientWidth * 2) / gw) + 1);
      if (d > 0) state.current.x = -gw;
    };
    build();
    const offResize = onResize(build);
    const io = new IntersectionObserver((e) => (state.current.visible = e[0].isIntersecting));
    io.observe(box.current);
    const offFrame = onFrame((dt) => {
      const s = state.current;
      if (!s.visible || !s.gw || !track.current) return;
      const v = BB.vel;
      s.x += d * speed * (1 + Math.min(5, Math.abs(v) / 700)) * dt;
      if (d < 0 && s.x <= -s.gw) s.x += s.gw;
      if (d > 0 && s.x >= 0) s.x -= s.gw;
      track.current.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0) skewX(${clamp(-v / 160, -9, 9).toFixed(2)}deg)`;
    });
    return () => {
      offResize();
      offFrame();
      io.disconnect();
    };
  }, [d, speed]);

  return (
    <div ref={box} className={`${className} marquee`.trim()} aria-hidden={ariaHidden ? true : undefined}>
      <div ref={track} className="marquee__track">
        <div ref={group} className="marquee__group">
          {children}
        </div>
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} className="marquee__group" aria-hidden="true">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
