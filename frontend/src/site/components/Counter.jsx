import { useEffect, useRef, useState } from "react";
import { reduceMotion, whenReady } from "../../motion/engine";

/** Counts up from 0 the first time it scrolls into view. */
export function Counter({ value, suffix = "", plain = false }) {
  const ref = useRef(null);
  const [n, setN] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion || !ref.current) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        whenReady(() => {
          const t0 = performance.now();
          const step = (now) => {
            const k = Math.min(1, (now - t0) / 1800);
            const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
            setN(Math.round(value * e));
            if (k < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{(plain ? String(n) : n.toLocaleString("en-US")) + suffix}</span>;
}
