import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { cdn, peso } from "../../lib/format";

import { ImageField } from "../fields";
import { useOverview } from "../Shell";
import { Empty, Modal, Spinner, useConfirm, useToast } from "../ui";

export default function MenuAdmin() {
  const [cats, setCats] = useState(null);
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState("all");
  const [draft, setDraft] = useState(null);
  const [catName, setCatName] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useOverview();

  const load = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([api.get("/admin/menu/categories"), api.get("/admin/menu/items")]);
      setCats(c.data.categories);
      setItems(i.data.items);
      refresh();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      if (ok) toast.ok(ok);
      await load();
      return true;
    } catch (err) {
      toast.bad(errorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!cats) return <Spinner />;
  const shown = sel === "all" ? items : items.filter((i) => i.category_id === sel);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (await act(() => api.post("/admin/menu/categories", { label: catName }), "Category added.")) setCatName("");
  };
  const moveCat = (i, to) => {
    const ids = cats.map((c) => c.category_id);
    const [x] = ids.splice(i, 1);
    ids.splice(to, 0, x);
    act(() => api.post("/admin/reorder/categories", { ids }));
  };
  const moveItem = (id, dir) => {
    const ids = shown.map((i) => i.item_id);
    const i = ids.indexOf(id),
      j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    act(() => api.post("/admin/reorder/items", { ids }));
  };
  const delCat = async (c) => {
    if (
      await confirm({
        title: `Delete “${c.label}”?`,
        message: `This also deletes its ${c.item_count} item${c.item_count === 1 ? "" : "s"} and their photos.`,
        confirmLabel: "Delete",
        danger: true,
      })
    ) {
      if (sel === c.category_id) setSel("all");
      act(() => api.delete(`/admin/menu/categories/${c.category_id}`), "Category deleted.");
    }
  };
  const delItem = async (i) => {
    if (await confirm({ title: `Delete “${i.name}”?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))
      act(() => api.delete(`/admin/menu/items/${i.item_id}`), "Item deleted.");
  };

  const openNew = () =>
    setDraft({
      category_id: sel !== "all" ? sel : cats[0]?.category_id || "",
      name: "",
      price: "",
      note: "",
      badge: "",
      featured: false,
      feature_order: "0",
      active: true,
      image: null,
    });
  const openEdit = (i) =>
    setDraft({
      item_id: i.item_id,
      category_id: i.category_id,
      name: i.name,
      price: String(i.price),
      note: i.note || "",
      badge: i.badge || "",
      featured: i.featured,
      feature_order: String(i.feature_order || 0),
      active: i.active,
      image: i.image_url ? { url: i.image_url, public_id: i.image_public_id || "" } : null,
    });

  const saveItem = async (e) => {
    e.preventDefault();
    if (!draft) return;
    const body = { ...draft, price: Number(draft.price), feature_order: Number(draft.feature_order || 0) };
    const ok = await act(
      () => (draft.item_id ? api.put(`/admin/menu/items/${draft.item_id}`, body) : api.post("/admin/menu/items", body)),
      draft.item_id ? "Item saved." : "Item added."
    );
    if (ok) setDraft(null);
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Menu</h1>
          <p className="adm-muted">
            Categories become the menu tabs. Items show on the Menu page; tick “Show on the home page” to feature an item in the home page showcase.
          </p>
        </div>
        <div className="adm-page__actions">
          <button className="btn btn--primary" onClick={openNew} disabled={!cats.length}>
            + Add item
          </button>
        </div>
      </div>

      <div className="adm-split">
        <aside className="adm-card adm-cats">
          <h3>Categories</h3>
          <button className={`adm-cat${sel === "all" ? " is-active" : ""}`} onClick={() => setSel("all")}>
            <span>All items</span>
            <b>{items.length}</b>
          </button>
          {cats.map((c, i) => (
            <div className={`adm-cat${sel === c.category_id ? " is-active" : ""}`} key={c.category_id}>
              <button className="adm-cat__name" onClick={() => setSel(c.category_id)}>
                <span>{c.label}</span>
                <b>{c.item_count}</b>
              </button>
              <span className="adm-row-tools">
                <button className="adm-icon-btn" disabled={i === 0 || busy} onClick={() => moveCat(i, i - 1)} aria-label="Move up">
                  ↑
                </button>
                <button className="adm-icon-btn" disabled={i === cats.length - 1 || busy} onClick={() => moveCat(i, i + 1)} aria-label="Move down">
                  ↓
                </button>
                <button className="adm-icon-btn" onClick={() => setRenaming(c)} aria-label="Rename">
                  ✎
                </button>
                <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => delCat(c)} aria-label="Delete">
                  ✕
                </button>
              </span>
            </div>
          ))}
          <form className="adm-inline" onSubmit={addCategory}>
            <input className="input" placeholder="New category name" value={catName} onChange={(e) => setCatName(e.target.value)} />
            <button className="btn btn--secondary btn--sm" disabled={busy}>
              Add
            </button>
          </form>
        </aside>

        <section>
          {!cats.length ? (
            <Empty title="No categories yet" text="Add a category (for example “Kape Series”), then add items to it." />
          ) : !shown.length ? (
            <Empty title="No items here yet" text="Add the first item with the button above.">
              <button className="btn btn--primary" onClick={openNew}>
                + Add item
              </button>
            </Empty>
          ) : (
            <ul className="adm-cards">
              {shown.map((i) => (
                <li className={`adm-tile${i.active ? "" : " is-off"}`} key={i.item_id}>
                  <div className="adm-tile__img">
                    {i.image_url ? <img src={cdn(i.image_url, 400)} alt="" loading="lazy" /> : <span>No photo</span>}
                  </div>
                  <div className="adm-tile__body">
                    <strong>{i.name}</strong>
                    <span className="adm-muted">{i.category_label}</span>
                    <span className="adm-price">PHP {peso(i.price)}</span>
                    <span className="adm-tags">
                      {i.featured && <em>Home page</em>}
                      {i.badge && <em>{i.badge}</em>}
                      {!i.active && <em className="is-warn">Hidden</em>}
                    </span>
                  </div>
                  <div className="adm-tile__tools">
                    {sel !== "all" && (
                      <>
                        <button className="adm-icon-btn" onClick={() => moveItem(i.item_id, -1)} aria-label="Move earlier">
                          ↑
                        </button>
                        <button className="adm-icon-btn" onClick={() => moveItem(i.item_id, 1)} aria-label="Move later">
                          ↓
                        </button>
                      </>
                    )}
                    <button className="btn btn--secondary btn--sm" onClick={() => openEdit(i)}>
                      Edit
                    </button>
                    <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => delItem(i)} aria-label="Delete">
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {renaming && (
        <Modal title="Rename category" onClose={() => setRenaming(null)} small>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act(() => api.put(`/admin/menu/categories/${renaming.category_id}`, { label: renaming.label }), "Category renamed."))
                setRenaming(null);
            }}
          >
            <div className="field">
              <label className="field__label" htmlFor="rn">
                Name
              </label>
              <input
                id="rn"
                className="input"
                value={renaming.label}
                onChange={(e) => setRenaming({ ...renaming, label: e.target.value })}
                autoFocus
              />
            </div>
            <div className="adm-actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setRenaming(null)}>
                Cancel
              </button>
              <button className="btn btn--primary btn--sm">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {draft && (
        <Modal title={draft.item_id ? "Edit menu item" : "Add menu item"} onClose={() => setDraft(null)}>
          <form className="adm-form" onSubmit={saveItem}>
            <ImageField
              label="Photo"
              hint="Square photos look best."
              value={draft.image}
              folder="menu"
              onChange={(image) => setDraft({ ...draft, image })}
            />
            <div className="adm-grid">
              <div className="field">
                <label className="field__label" htmlFor="in">
                  Name
                </label>
                <input id="in" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="ic">
                  Category
                </label>
                <select id="ic" className="select" value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
                  {cats.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="ip">
                  Price (PHP)
                </label>
                <input
                  id="ip"
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="ib">
                  Badge <small>(optional)</small>
                </label>
                <input
                  id="ib"
                  className="input"
                  placeholder="Popular pick"
                  value={draft.badge}
                  onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                />
              </div>
              <div className="field adm-span">
                <label className="field__label" htmlFor="ino">
                  Small note <small>(optional)</small>
                </label>
                <input
                  id="ino"
                  className="input"
                  placeholder="Add migalo +PHP 35"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-checks">
              <label className="adm-check">
                <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                <span>Visible on the website</span>
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
                <span>Show on the home page (menu favorites)</span>
              </label>
            </div>
            {draft.featured && (
              <div className="field">
                <label className="field__label" htmlFor="fo">
                  Position in the home page showcase
                </label>
                <input
                  id="fo"
                  className="input"
                  type="number"
                  min="0"
                  value={draft.feature_order}
                  onChange={(e) => setDraft({ ...draft, feature_order: e.target.value })}
                />
                <span className="field__hint">1 shows first, 2 second, and so on. The showcase fits up to 8 items.</span>
              </div>
            )}
            <div className="adm-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" disabled={busy}>
                {busy ? "Saving…" : "Save item"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
