import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { cdn } from "../../lib/format";
import { useOverview } from "../Shell";
import { uploadImage } from "../upload";
import { Empty, Modal, Spinner, useConfirm, useToast } from "../ui";

const CATS = [
  { v: "moments", l: "Café moments" },
  { v: "branches", l: "Branches" },
  { v: "drinks", l: "Drinks" },
  { v: "food", l: "Food" },
];

export default function GalleryAdmin() {
  const [items, setItems] = useState(null);
  const [cat, setCat] = useState("all");
  const [newCat, setNewCat] = useState("moments");
  const [newFeatured, setNewFeatured] = useState(false);
  const [progress, setProgress] = useState("");
  const [edit, setEdit] = useState(null);
  const input = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useOverview();

  const load = useCallback(async () => {
    try {
      setItems((await api.get("/admin/gallery")).data.items);
      refresh();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!items) return <Spinner />;
  const shown = cat === "all" ? items : items.filter((i) => i.category === cat);

  // upload several photos in a row; each one becomes its own gallery item
  const upload = async (files) => {
    if (!files?.length) return;
    const list = Array.from(files);
    let done = 0,
      failed = 0;
    for (const file of list) {
      setProgress(`Uploading ${done + failed + 1} of ${list.length}…`);
      try {
        const image = await uploadImage(file, "gallery");
        await api.post("/admin/gallery", { image, category: newCat, featured: newFeatured, caption: "", alt: "" });
        done++;
      } catch (err) {
        failed++;
        toast.bad(`${file.name}: ${err instanceof Error && !("response" in err) ? err.message : errorMessage(err)}`);
        if (String(errorMessage(err)).includes("Cloudinary is not set up")) break;
      }
    }
    setProgress("");
    if (input.current) input.current.value = "";
    if (done) toast.ok(`${done} photo${done === 1 ? "" : "s"} added.`);
    await load();
  };

  const move = async (id, dir) => {
    const ids = shown.map((i) => i.item_id);
    const i = ids.indexOf(id),
      j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    // keep photos of other categories in place: only reorder within the visible list
    const all = items.map((p) => p.item_id);
    const slots = all.map((a, idx) => (ids.includes(a) ? idx : -1)).filter((x) => x >= 0);
    slots.forEach((slot, k) => (all[slot] = ids[k]));
    try {
      await api.post("/admin/reorder/gallery", { ids: all });
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };
  const del = async (p) => {
    if (
      !(await confirm({
        title: "Delete this photo?",
        message: "It is removed from the website and from Cloudinary.",
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    try {
      await api.delete(`/admin/gallery/${p.item_id}`);
      toast.ok("Photo deleted.");
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };
  const save = async (e) => {
    e.preventDefault();
    if (!edit) return;
    try {
      await api.put(`/admin/gallery/${edit.item_id}`, edit);
      toast.ok("Photo saved.");
      setEdit(null);
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Gallery</h1>
          <p className="adm-muted">
            Photos shown on the Gallery page. Tick “Show on the home page” to put a photo in the scrolling strips on the home page.
          </p>
        </div>
      </div>

      <section className="adm-card adm-upload">
        <div className="adm-grid">
          <div className="field">
            <label className="field__label" htmlFor="nc">
              Add new photos to
            </label>
            <select id="nc" className="select" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
              {CATS.map((c) => (
                <option key={c.v} value={c.v}>
                  {c.l}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ justifyContent: "end" }}>
            <label className="adm-check">
              <input type="checkbox" checked={newFeatured} onChange={(e) => setNewFeatured(e.target.checked)} />
              <span>Also show on the home page</span>
            </label>
          </div>
        </div>
        <div className="adm-actions" style={{ justifyContent: "flex-start" }}>
          <button className="btn btn--primary" onClick={() => input.current?.click()} disabled={!!progress}>
            {progress || "Upload photos"}
          </button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <span className="adm-muted">You can pick many at once.</span>
        </div>
      </section>

      <div className="adm-chips">
        <button className={`adm-chip${cat === "all" ? " is-active" : ""}`} onClick={() => setCat("all")}>
          All <b>{items.length}</b>
        </button>
        {CATS.map((c) => (
          <button key={c.v} className={`adm-chip${cat === c.v ? " is-active" : ""}`} onClick={() => setCat(c.v)}>
            {c.l} <b>{items.filter((i) => i.category === c.v).length}</b>
          </button>
        ))}
      </div>

      {!shown.length ? (
        <Empty title="No photos here yet" text="Use “Upload photos” above." />
      ) : (
        <ul className="adm-photos">
          {shown.map((p) => (
            <li className="adm-photo" key={p.item_id}>
              <img src={cdn(p.image_url, 500)} alt={p.alt || ""} loading="lazy" />
              <div className="adm-photo__bar">
                <span>{p.caption || "No caption"}</span>
                {p.featured && <em>Home</em>}
              </div>
              <div className="adm-photo__tools">
                <button className="adm-icon-btn" onClick={() => move(p.item_id, -1)} aria-label="Move earlier">
                  ←
                </button>
                <button className="adm-icon-btn" onClick={() => move(p.item_id, 1)} aria-label="Move later">
                  →
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => setEdit(p)}>
                  Edit
                </button>
                <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => del(p)} aria-label="Delete">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {edit && (
        <Modal title="Edit photo" onClose={() => setEdit(null)} small>
          <form className="adm-form" onSubmit={save}>
            <img className="adm-photo-preview" src={cdn(edit.image_url, 600)} alt="" />
            <div className="field">
              <label className="field__label" htmlFor="gc">
                Caption <small>(shown on hover)</small>
              </label>
              <input id="gc" className="input" value={edit.caption || ""} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ga">
                Description <small>(for screen readers)</small>
              </label>
              <input id="ga" className="input" value={edit.alt || ""} onChange={(e) => setEdit({ ...edit, alt: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="gk">
                Category
              </label>
              <select id="gk" className="select" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                {CATS.map((c) => (
                  <option key={c.v} value={c.v}>
                    {c.l}
                  </option>
                ))}
              </select>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} />
              <span>Show on the home page</span>
            </label>
            <div className="adm-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn btn--primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
