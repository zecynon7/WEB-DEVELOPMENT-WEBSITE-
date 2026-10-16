import { useState } from "react";
import { readBrand } from "../../lib/brand";
import { imgUrl } from "../../lib/format";
import { useSite } from "../SiteContext";
import "../../styles/loader.css";
import { Spinner } from "./Spinner";

/** The logo inside the spinner, with the brand name underneath. Used by both loading screens.
 *  Shows the remembered / default brand right away and switches to the live one as soon as the content arrives. */
export function BrandMark() {
  const { brand, logo } = useSite();
  const [saved] = useState(readBrand);
  const name = brand || saved.name;
  const logoSrc = (logo && imgUrl(logo, 240)) || saved.logo;
  const letters = name.replace(/\s+/g, "").toUpperCase().split("");
  return (
    <>
      <Spinner>
        <img className="loader__logo" src={logoSrc} alt="" width={160} height={160} />
      </Spinner>
      <p className="preloader__word" aria-label={name}>
        {letters.map((c, i) => (
          <span key={i} style={{ "--i": i }} aria-hidden="true">
            {c}
          </span>
        ))}
      </p>
    </>
  );
}