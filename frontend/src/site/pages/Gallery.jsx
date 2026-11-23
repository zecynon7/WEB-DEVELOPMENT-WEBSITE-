import { useRef, useState } from "react";
import { cdn } from "../../lib/format";
import { reduceMotion } from "../../motion/engine";
import { Icon } from "../components/Icon";
import { CtaBand, PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { Tabs } from "../components/Tabs";
import { usePage, useSiteData } from "../SiteContext";
import { SiteLink } from "../Transition";

const LABELS = { moments: "Café moments", branches: "Branches", drinks: "Drinks", food: "Food" };

export default function Gallery() {
  const c = usePage("gallery");
  const { gallery } = useSiteData();
  const [cat, setCat] = useState("all");
  const dialog = useRef(null);
  const bigImg = useRef(null);
  const [photo, setPhoto] = useState({ src: "", alt: "", caption: "" });
  usePageMeta("Gallery");

  const cats = ["moments", "branches", "drinks", "food"].filter((k) => gallery.some((g) => g.category === k));
  const shown = cat === "all" ? gallery : gallery.filter((g) => g.category === cat);

  // the big photo grows out of the thumbnail that was clicked
  const open = (g, thumb) => {
    setPhoto({ src: cdn(g.image_url, 1600), alt: g.alt || g.caption || "", caption: g.caption || "" });
    const from = thumb.getBoundingClientRect();
    dialog.current?.showModal();
    const big = bigImg.current;
    if (big && !reduceMotion && big.animate) {
      requestAnimationFrame(() => {
        const to = big.getBoundingClientRect();
        if (!to.width) return;
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        big.animate(
          [
            { transform: `translate(${dx}px,${dy}px) scale(${from.width / to.width})`, borderRadius: "28px" },
            { transform: "none", borderRadius: "20px" },
          ],
          { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
      });
    }
  };

  return (
    <>
      <PageIntro c={c} />
      {gallery.length > 0 && (
        <section className="container section--tight">
          {cats.length > 1 && (
            <Tabs
              reveal
              label="Gallery filter"
              active={cat}
              onChange={setCat}
              items={[{ key: "all", label: "All" }, ...cats.map((k) => ({ key: k, label: LABELS[k] }))]}
            />
          )}
          <div className="gallery">
            {shown.map((g) => (
              <div className="gallery__item" key={cat + g.item_id} data-reveal="clip" style={{ "--r": "20px" }}>
                <button className="gallery__btn" type="button" onClick={(e) => open(g, e.currentTarget.querySelector("img"))}>
                  <span className="gallery__frame">
                    <img src={cdn(g.image_url, 800)} alt={g.alt || g.caption || ""} loading="lazy" />
                  </span>
                  {g.caption && <span className="gallery__caption">{g.caption}</span>}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <dialog className="lightbox" ref={dialog} aria-label="Photo viewer" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <button className="lightbox__close" type="button" onClick={() => dialog.current?.close()} aria-label="Close photo">
          <Icon name="x" />
        </button>
        <img src={photo.src || undefined} alt={photo.alt} ref={bigImg} />
        <p>{photo.caption}</p>
      </dialog>
      <CtaBand c={c}>
        <SiteLink className="btn btn--primary btn--lg" to="/reserve">
          Reserve a table <Icon name="arrow-right" />
        </SiteLink>
        <SiteLink className="btn btn--secondary btn--lg" to="/branches">
          Find a branch
        </SiteLink>
      </CtaBand>
    </>
  );
}
