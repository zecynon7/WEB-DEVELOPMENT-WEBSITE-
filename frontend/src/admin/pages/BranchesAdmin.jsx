import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { cdn } from "../../lib/format";

import { ImageField, RowTools } from "../fields";
import { useOverview } from "../Shell";
import { Empty, Modal, Spinner, useConfirm, useToast } from "../ui";

const MapPicker = lazy(() => import("./MapPicker"));

const blank = {
  name: "",
  short_name: "",
  area: "",
  region: "",
  description: "",
  badge: "",
  glance: "",
  hours: [{ label: "Daily", value: "" }],
  note: "",
  facebook_url: "",
  directions_url: "",
  latitude: "",
  longitude: "",
  active: true,
  image: null,
};

export default function BranchesAdmin() {
  const [list, setList] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useOverview();

  const load = useCallback(async () => {
    try {
      setList((await api.get("/admin/branches")).data.branches);
      refresh();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!list) return <Spinner />;
  const regions = Array.from(new Set(list.map((b) => b.region).filter(Boolean)));

  const edit = (b) =>
    setDraft({
      branch_id: b.branch_id,
      name: b.name,
      short_name: b.short_name || "",
      area: b.area || "",
      region: b.region || "",
      description: b.description || "",
      badge: b.badge || "",
      glance: b.glance || "",
      hours: b.hours?.length ? b.hours : [{ label: "", value: "" }],
      note: b.note || "",
      facebook_url: b.facebook_url || "",
      directions_url: b.directions_url || "",
      latitude: b.latitude == null ? "" : String(b.latitude),
      longitude: b.longitude == null ? "" : String(b.longitude),
      active: b.active,
      image: b.image_url ? { url: b.image_url, public_id: b.image_public_id || "" } : null,
    });

  const save = async (e) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      const body = {
        ...draft,
        latitude: draft.latitude === "" ? null : Number(draft.latitude),
        longitude: draft.longitude === "" ? null : Number(draft.longitude),
      };
      if (draft.branch_id) await api.put(`/admin/branches/${draft.branch_id}`, body);
      else await api.post("/admin/branches", body);
      toast.ok(draft.branch_id ? "Branch saved." : "Branch added.");
      setDraft(null);
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const move = async (i, to) => {
    const ids = list.map((b) => b.branch_id);
    const [x] = ids.splice(i, 1);
    ids.splice(to, 0, x);
    try {
      await api.post("/admin/reorder/branches", { ids });
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };
  const del = async (b) => {
    if (
      !(await confirm({
        title: `Delete “${b.name}”?`,
        message: "The branch and its photo are removed from the website.",
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    try {
      await api.delete(`/admin/branches/${b.branch_id}`);
      toast.ok("Branch deleted.");
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };

  const lat = draft && draft.latitude !== "" ? Number(draft.latitude) : null;
  const lng = draft && draft.longitude !== "" ? Number(draft.longitude) : null;

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Branches</h1>
          <p className="adm-muted">Each branch appears on the Branches page, in the home page ride, on the map and in the reservation form.</p>
        </div>
        <div className="adm-page__actions">
          <button className="btn btn--primary" onClick={() => setDraft({ ...blank })}>
            + Add branch
          </button>
        </div>
      </div>

      {!list.length ? (
        <Empty title="No branches yet" text="Add your first branch with its photo, hours and map location.">
          <button className="btn btn--primary" onClick={() => setDraft({ ...blank })}>
            + Add branch
          </button>
        </Empty>
      ) : (
        <ul className="adm-cards adm-cards--wide">
          {list.map((b, i) => (
            <li className={`adm-tile${b.active ? "" : " is-off"}`} key={b.branch_id}>
              <div className="adm-tile__img">{b.image_url ? <img src={cdn(b.image_url, 500)} alt="" loading="lazy" /> : <span>No photo</span>}</div>
              <div className="adm-tile__body">
                <strong>{b.name}</strong>
                <span className="adm-muted">{[b.area, b.region].filter(Boolean).join(" · ")}</span>
                <span className="adm-muted">{b.hours?.[0] ? `${b.hours[0].label}: ${b.hours[0].value}` : "No hours yet"}</span>
                <span className="adm-tags">
                  {b.latitude != null ? <em>On the map</em> : <em className="is-warn">No map location</em>}
                  {!b.active && <em className="is-warn">Hidden</em>}
                </span>
              </div>
              <div className="adm-tile__tools">
                <button className="adm-icon-btn" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                  ↑
                </button>
                <button className="adm-icon-btn" disabled={i === list.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">
                  ↓
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => edit(b)}>
                  Edit
                </button>
                <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => del(b)} aria-label="Delete">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && (
        <Modal title={draft.branch_id ? "Edit branch" : "Add branch"} onClose={() => setDraft(null)} wide>
          <form className="adm-form" onSubmit={save}>
            <ImageField
              label="Photo"
              hint="Landscape works best (16:10)."
              value={draft.image}
              folder="branches"
              onChange={(image) => setDraft({ ...draft, image })}
            />
            <div className="adm-grid">
              <div className="field">
                <label className="field__label" htmlFor="bn">
                  Full name
                </label>
                <input
                  id="bn"
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Naic Branch"
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="bs">
                  Short name <small>(home page ride)</small>
                </label>
                <input
                  id="bs"
                  className="input"
                  value={draft.short_name}
                  onChange={(e) => setDraft({ ...draft, short_name: e.target.value })}
                  placeholder="Naic"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="ba">
                  Area
                </label>
                <input
                  id="ba"
                  className="input"
                  value={draft.area}
                  onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                  placeholder="Naic, Cavite"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="br">
                  Region <small>(used for the filter tabs)</small>
                </label>
                <input
                  id="br"
                  className="input"
                  list="regions"
                  value={draft.region}
                  onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                  placeholder="Cavite"
                />
                <datalist id="regions">
                  {regions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="field adm-span">
                <label className="field__label" htmlFor="bd">
                  Description
                </label>
                <textarea
                  id="bd"
                  className="textarea"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="bb">
                  Badge <small>(optional)</small>
                </label>
                <input
                  id="bb"
                  className="input"
                  value={draft.badge}
                  onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                  placeholder="The original"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="bg">
                  Hours at a glance <small>(home page ride)</small>
                </label>
                <input
                  id="bg"
                  className="input"
                  value={draft.glance}
                  onChange={(e) => setDraft({ ...draft, glance: e.target.value })}
                  placeholder="Daily · 8:00 AM – 10:00 PM"
                />
              </div>
            </div>

            <div className="field">
              <span className="field__label">Operating hours</span>
              <div className="adm-list">
                {draft.hours.map((h, i) => (
                  <div className="adm-list__row adm-list__row--2" key={i}>
                    <input
                      className="input"
                      placeholder="Mon–Thu"
                      value={h.label}
                      onChange={(e) => setDraft({ ...draft, hours: draft.hours.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                    />
                    <input
                      className="input"
                      placeholder="11:00 AM – 11:00 PM"
                      value={h.value}
                      onChange={(e) => setDraft({ ...draft, hours: draft.hours.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })}
                    />
                    <RowTools
                      i={i}
                      n={draft.hours.length}
                      onMove={(to) => {
                        const c = [...draft.hours];
                        const [x] = c.splice(i, 1);
                        c.splice(to, 0, x);
                        setDraft({ ...draft, hours: c });
                      }}
                      onRemove={() => setDraft({ ...draft, hours: draft.hours.filter((_, j) => j !== i) })}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm adm-add"
                onClick={() => setDraft({ ...draft, hours: [...draft.hours, { label: "", value: "" }] })}
              >
                + Add hours row
              </button>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bnote">
                Note under the hours <small>(optional)</small>
              </label>
              <input id="bnote" className="input" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
            </div>

            <div className="field">
              <span className="field__label">Map location</span>
              <span className="field__hint">
                Click the map to drop the pin, drag it to adjust, or type the numbers (in Google Maps, right-click a spot and copy the two numbers).
              </span>
              <Suspense fallback={<Spinner />}>
                <MapPicker lat={lat} lng={lng} onChange={(la, ln) => setDraft((d) => d && { ...d, latitude: String(la), longitude: String(ln) })} />
              </Suspense>
              <div className="adm-grid">
                <div className="field">
                  <label className="field__label" htmlFor="lat">
                    Latitude
                  </label>
                  <input
                    id="lat"
                    className="input"
                    type="number"
                    step="any"
                    value={draft.latitude}
                    onChange={(e) => setDraft({ ...draft, latitude: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="lng">
                    Longitude
                  </label>
                  <input
                    id="lng"
                    className="input"
                    type="number"
                    step="any"
                    value={draft.longitude}
                    onChange={(e) => setDraft({ ...draft, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="adm-grid">
              <div className="field">
                <label className="field__label" htmlFor="bf">
                  Facebook page link
                </label>
                <input
                  id="bf"
                  className="input"
                  value={draft.facebook_url}
                  onChange={(e) => setDraft({ ...draft, facebook_url: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="bdir">
                  Directions link <small>(optional)</small>
                </label>
                <input
                  id="bdir"
                  className="input"
                  value={draft.directions_url}
                  onChange={(e) => setDraft({ ...draft, directions_url: e.target.value })}
                  placeholder="Leave empty to use the map location"
                />
              </div>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
              <span>Visible on the website</span>
            </label>
            <div className="adm-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" disabled={busy}>
                {busy ? "Saving…" : "Save branch"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
