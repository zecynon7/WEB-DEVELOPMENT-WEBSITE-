import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { retry } from "../../lib/boot";
import { setReady } from "../../motion/engine";
import { useBoot } from "../SiteContext";
import { BrandMark } from "./BrandMark";

const MIN_MS = 2200; // even on a warm server the animation shows long enough to be seen

/**
 * Intro screen: the logo inside a spinning loader with the brand name underneath, for as long as the site really needs.
 * It opens only when the server has answered, the content is downloaded and the fonts + hero photo are ready
 * (see lib/boot.js), so a Render cold start simply keeps it spinning.
 * If the server never answers (GIVE_UP_MS in boot.js) it stops and says "Server error".
 */
export function Preloader({ assetsReady, heroSrc, onDone }) {
  // (a `brand` prop may still be passed by SiteLayout; it is not needed any more, BrandMark reads the brand itself)
  const box = useRef(null);
  const [done, setDone] = useState(false);
  const boot = useBoot();
  const bootRef = useRef(boot);
  bootRef.current = boot;
  const readyRef = useRef(false);
  const assets = useRef(false);

  useLayoutEffect(() => {
    document.documentElement.classList.add("is-loading");
  }, []);

  // once the content is here: wait for the fonts and the hero photo too
  useEffect(() => {
    if (!assetsReady) return;
    const img = heroSrc
      ? new Promise((r) => {
          const i = new Image();
          i.onload = i.onerror = () => r();
          i.src = heroSrc;
          setTimeout(r, 3500);
        })
      : Promise.resolve();
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), img]).then(() => {
      assets.current = true;
    });
  }, [assetsReady, heroSrc]);

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const finish = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      box.current?.classList.add("is-done");
      setTimeout(() => setReady(true), 520);
      setTimeout(() => {
        document.documentElement.classList.remove("is-loading");
        try {
          sessionStorage.setItem("bb-pre", "1");
        } catch {
          /* private mode */
        }
        setDone(true);
        onDone();
      }, 1300);
    };
    const step = (now) => {
      if (bootRef.current.phase === "ready" && assets.current && now - t0 >= MIN_MS) {
        finish();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  const failed = boot.phase === "failed";
  return (
    <div className="preloader" ref={box}>
      <div className="preloader__panel preloader__panel--top" aria-hidden="true" />
      <div className="preloader__panel preloader__panel--bot" aria-hidden="true" />
      <div className={`preloader__inner${failed ? " is-failed" : ""}`}>
        <BrandMark />
        <p className={`preloader__msg${failed ? " is-on" : ""}`} role="status" aria-live="polite">
          {failed ? "Server error" : ""}
        </p>
        {failed && (
          <button type="button" className="btn btn--primary btn--sm" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}