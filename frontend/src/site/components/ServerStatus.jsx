import { useEffect, useState } from "react";
import { retry } from "../../lib/boot";
import { useBoot } from "../SiteContext";
import { BrandMark } from "./BrandMark";

/**
 * Loading screen for visitors who do not get the animated intro
 * (a page other than the home page, a returning visitor, or "reduce motion").
 * The same logo spinner, shown only if the server is slow, so a fast start never shows it.
 */
export function ServerStatus() {
  const { phase } = useBoot();
  const [late, setLate] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setLate(true), 700);
    return () => clearTimeout(show);
  }, []);

  const failed = phase === "failed";
  if (!late && !failed) return null;
  return (
    <div className={`server-status${failed ? " is-failed" : ""}`} role="status" aria-live="polite">
      <BrandMark />
      {failed && (
        <>
          <p className="server-status__title">Server error</p>
          <button type="button" className="btn btn--primary btn--sm" onClick={retry}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}