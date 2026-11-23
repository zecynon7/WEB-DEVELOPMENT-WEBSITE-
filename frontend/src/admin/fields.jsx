import { useRef, useState } from "react";
import { errorMessage } from "../lib/axios";
import { cdn } from "../lib/format";

import { uploadImage } from "./upload";
import { useToast } from "./ui";

/* ------------------------------------------------------------- one image */
export function ImageField({ label, hint, value, onChange, folder = "pages", compact }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      toast.bad(err instanceof Error && !("response" in err) ? err.message : errorMessage(err));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={`field adm-image${compact ? " adm-image--compact" : ""}`}>
      {label && <span className="field__label">{label}</span>}
      <div className="adm-image__box">
        <div className={`adm-image__preview${busy ? " is-busy" : ""}`}>
          {value?.url ? <img src={cdn(value.url, 400)} alt="" /> : <span>No photo</span>}
          {busy && <i className="adm-spinner" />}
        </div>
        <div className="adm-image__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            {value?.url ? "Replace photo" : "Upload photo"}
          </button>
          {value?.url && (
            <button type="button" className="btn btn--sm adm-btn-ghost" onClick={() => onChange(null)} disabled={busy}>
              Remove
            </button>
          )}
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      </div>
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

/* ------------------------------------------------- schema-driven editing */
function FieldInput({ def, value, onChange }) {
  const id = `f-${def.key}-${Math.random().toString(36).slice(2, 7)}`;
  switch (def.kind) {
    case "text":
      return (
        <div className="field">
          <label className="field__label" htmlFor={id}>
            {def.label}
          </label>
          <input className="input" id={id} value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
          {def.hint && <span className="field__hint">{def.hint}</span>}
        </div>
      );

    case "textarea":
      return (
        <div className="field">
          <label className="field__label" htmlFor={id}>
            {def.label}
          </label>
          <textarea className="textarea" id={id} rows={def.rows || 3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          {def.hint && <span className="field__hint">{def.hint}</span>}
        </div>
      );

    case "select":
      return (
        <div className="field">
          <label className="field__label" htmlFor={id}>
            {def.label}
          </label>
          <select className="select" id={id} value={value ?? def.options[0].value} onChange={(e) => onChange(e.target.value)}>
            {def.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "bool":
      return (
        <label className="adm-check">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{def.label}</span>
        </label>
      );

    case "image":
      return <ImageField label={def.label} hint={def.hint} value={value} folder={def.folder} onChange={onChange} />;
    case "strings": {
      const list = Array.isArray(value) ? value : [];
      return (
        <div className="field">
          <span className="field__label">{def.label}</span>
          {def.hint && <span className="field__hint">{def.hint}</span>}
          <div className="adm-list">
            {list.map((s, i) => (
              <div className="adm-list__row" key={i}>
                <input className="input" value={s} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                <RowTools
                  i={i}
                  n={list.length}
                  onMove={(to) => onChange(move(list, i, to))}
                  onRemove={() => onChange(list.filter((_, j) => j !== i))}
                />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--secondary btn--sm adm-add" onClick={() => onChange([...list, ""])}>
            + {def.addLabel || "Add"}
          </button>
        </div>
      );
    }
    case "items": {
      const list = Array.isArray(value) ? value : [];
      return (
        <div className="field">
          <span className="field__label">{def.label}</span>
          {def.hint && <span className="field__hint">{def.hint}</span>}
          <div className="adm-items">
            {list.map((item, i) => (
              <div className="adm-item" key={i}>
                <div className="adm-item__head">
                  <strong>
                    {def.itemTitle || "Item"} {i + 1}
                  </strong>
                  <RowTools
                    i={i}
                    n={list.length}
                    onMove={(to) => onChange(move(list, i, to))}
                    onRemove={() => onChange(list.filter((_, j) => j !== i))}
                  />
                </div>
                <div className="adm-grid">
                  {def.fields.map((f) => (
                    <FieldInput
                      key={f.key}
                      def={f}
                      value={item[f.key]}
                      onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--secondary btn--sm adm-add" onClick={() => onChange([...list, {}])}>
            + {def.addLabel || "Add"}
          </button>
        </div>
      );
    }
  }
}

function move(list, from, to) {
  const copy = [...list];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

export function RowTools({ i, n, onMove, onRemove }) {
  return (
    <div className="adm-row-tools">
      <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => onMove(i - 1)} aria-label="Move up">
        ↑
      </button>
      <button type="button" className="adm-icon-btn" disabled={i === n - 1} onClick={() => onMove(i + 1)} aria-label="Move down">
        ↓
      </button>
      <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={onRemove} aria-label="Remove">
        ✕
      </button>
    </div>
  );
}

/** Builds the whole editing form for one page from its schema. */
export function ContentEditor({ schema, value, onChange }) {
  return (
    <div className="adm-sections">
      {schema.sections.map((sec) => (
        <section className="adm-card" key={sec.title}>
          <h3>{sec.title}</h3>
          {sec.hint && <p className="adm-muted">{sec.hint}</p>}
          <div className="adm-grid">
            {sec.fields.map((f) => (
              <div
                key={f.key}
                className={f.kind === "items" || f.kind === "strings" || f.kind === "textarea" || f.kind === "image" ? "adm-span" : ""}
              >
                <FieldInput def={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
