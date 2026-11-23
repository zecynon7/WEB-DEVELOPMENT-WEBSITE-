import { useEffect, useLayoutEffect, useRef } from "react";

/** Filter tabs with a pill that glides under the active tab (same markup and classes as before). */
export function Tabs({ items, active, onChange, label, reveal }) {
  const box = useRef(null);
  const glide = useRef(null);

  const place = () => {
    const on = box.current?.querySelector(".tab.on");
    const g = glide.current;
    if (!on || !g || !on.offsetWidth) return;
    // offset sizes ignore transforms, so this also works while the bar is still animating in
    g.style.setProperty("--gx", on.offsetLeft + "px");
    g.style.setProperty("--gy", on.offsetTop - 8 + "px");
    g.style.setProperty("--gw", on.offsetWidth + "px");
  };

  useLayoutEffect(place, [active, items.length]);
  useEffect(() => {
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, []);

  // on phones the tab bar scrolls sideways: keep the active tab in view
  useEffect(() => {
    const bar = box.current?.parentElement;
    const on = box.current?.querySelector(".tab.on");
    if (bar && on && bar.scrollWidth > bar.clientWidth)
      bar.scrollTo({ left: on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="tabs" role="tablist" aria-label={label} ref={box} {...(reveal ? { "data-reveal": "rise" } : {})}>
      <span className="tabs__glide" ref={glide} />
      {items.map((t) => (
        <button
          key={t.key}
          className={`tab${t.key === active ? " on" : ""}`}
          type="button"
          role="tab"
          aria-selected={t.key === active}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
