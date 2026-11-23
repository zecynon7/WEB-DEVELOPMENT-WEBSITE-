import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api, errorMessage } from "../../lib/axios";

import { pageByKey } from "../contentSchema";
import { ContentEditor } from "../fields";
import { useOverview } from "../Shell";
import { Empty, Spinner, useToast } from "../ui";

/** One page's texts and photos. The form is generated from contentSchema.js. */
export default function PageEditor() {
  const { key = "" } = useParams();
  const schema = pageByKey(key);
  const [value, setValue] = useState(null);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { refresh } = useOverview();

  useEffect(() => {
    setValue(null);
    api
      .get("/admin/pages")
      .then((r) => {
        const c = r.data.content[key] || {};
        setValue(c);
        setSaved(JSON.stringify(c));
      })
      .catch((err) => toast.bad(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const dirty = value !== null && JSON.stringify(value) !== saved;
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (!schema) return <Empty title="Unknown page" />;
  if (!value) return <Spinner />;

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/admin/pages/${key}`, { content: value });
      setValue(data.content);
      setSaved(JSON.stringify(data.content));
      toast.ok(`${schema.label} saved.`);
      refresh();
    } catch (err) {
      toast.bad(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>{schema.label}</h1>
          <p className="adm-muted">{schema.description}</p>
        </div>
        <div className="adm-page__actions">
          {schema.path && (
            <a className="btn btn--secondary btn--sm" href={schema.path} target="_blank" rel="noopener noreferrer">
              View page ↗
            </a>
          )}
        </div>
      </div>
      <ContentEditor schema={schema} value={value} onChange={setValue} />
      <div className="adm-savebar">
        <span>{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <button className="btn btn--primary" onClick={save} disabled={busy || !dirty}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
