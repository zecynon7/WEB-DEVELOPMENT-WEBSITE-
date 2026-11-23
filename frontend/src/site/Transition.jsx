import { createContext, useCallback, useContext, useRef } from "react";
import { useNavigate } from "react-router";
import { reduceMotion, setReady } from "../motion/engine";

const Ctx = createContext({ go: () => {}, curtain: { current: null } });

/** Page changes sweep a curtain across the screen (same animation as the multi-page site). */
export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const curtain = useRef(null);
  const busy = useRef(false);

  const go = useCallback(
    (to) => {
      const c = curtain.current;
      if (reduceMotion || !c || busy.current) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }
      busy.current = true;
      setReady(false);
      c.classList.remove("is-open");
      c.classList.add("is-below");
      void c.offsetWidth;
      c.classList.remove("is-below");
      c.classList.add("is-closing");
      window.setTimeout(() => {
        navigate(to);
        window.scrollTo(0, 0);
        busy.current = false;
      }, 780);
    },
    [navigate]
  );

  return <Ctx.Provider value={{ go, curtain }}>{children}</Ctx.Provider>;
}

export const useTransition = () => useContext(Ctx);

/** Internal link: sweeps the curtain, then changes route. Ctrl/Cmd/middle-click still open a new tab. */
export function SiteLink({ to, children, className, onClick, ...rest }) {
  const { go } = useTransition();
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    go(to);
  };
  return (
    <a href={to} className={className} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
