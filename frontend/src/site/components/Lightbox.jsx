import { useCallback, useRef, useState } from "react";
import { reduceMotion } from "../../motion/engine";
import { Icon } from "./Icon";

/** A photo popup that grows out of the thumbnail that was clicked.
 *  const { open, node } = useLightbox();  render {node} once, call open({ src, alt, caption }, thumbnailImg) on click. */
export function useLightbox() {
  const dialog = useRef(null);
  const bigImg = useRef(null);
  const [photo, setPhoto] = useState({ src: "", alt: "", caption: "" });

  const open = useCallback((next, thumb) => {
    setPhoto({ src: next.src, alt: next.alt || "", caption: next.caption || "" });
    const from = thumb?.getBoundingClientRect();
    dialog.current?.showModal();
    const big = bigImg.current;
    if (from && big && !reduceMotion && big.animate) {
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
  }, []);

  const node = (
    <dialog className="lightbox" ref={dialog} aria-label="Photo viewer" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
      <button className="lightbox__close" type="button" onClick={() => dialog.current?.close()} aria-label="Close photo">
        <Icon name="x" />
      </button>
      <img src={photo.src || undefined} alt={photo.alt} ref={bigImg} />
      {photo.caption && <p>{photo.caption}</p>}
    </dialog>
  );

  return { open, node };
}
