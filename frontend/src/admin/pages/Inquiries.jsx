import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { useOverview } from "../Shell";
import { Empty, Spinner, useConfirm, useToast } from "../ui";

export default function Inquiries() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useOverview();

  const load = useCallback(async () => {
    try {
      setRows((await api.get("/admin/inquiries")).data.inquiries);
      refresh();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!rows) return <Spinner />;

  const mark = async (m, is_read) => {
    try {
      await api.patch(`/admin/inquiries/${m.inquiry_id}`, { is_read });
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };
  const toggle = (m) => {
    setOpen(open === m.inquiry_id ? null : m.inquiry_id);
    if (!m.is_read) mark(m, true);
  };
  const del = async (m) => {
    if (!(await confirm({ title: "Delete this message?", confirmLabel: "Delete", danger: true }))) return;
    try {
      await api.delete(`/admin/inquiries/${m.inquiry_id}`);
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Messages</h1>
          <p className="adm-muted">Inquiries sent from the Contact page.</p>
        </div>
      </div>
      {!rows.length ? (
        <Empty title="No messages yet" text="Messages from the Contact page appear here." />
      ) : (
        <ul className="adm-msgs">
          {rows.map((m) => (
            <li key={m.inquiry_id} className={`adm-msg${m.is_read ? "" : " is-unread"}${open === m.inquiry_id ? " is-open" : ""}`}>
              <button className="adm-msg__head" onClick={() => toggle(m)}>
                <span className="adm-msg__dot" />
                <strong>{m.full_name}</strong>
                <span className="adm-muted">{m.topic || "General"}</span>
                <span className="adm-msg__time">{new Date(m.created_at).toLocaleDateString()}</span>
              </button>
              {open === m.inquiry_id && (
                <div className="adm-msg__body">
                  <p>{m.message}</p>
                  <div className="adm-actions" style={{ justifyContent: "flex-start" }}>
                    <a className="btn btn--primary btn--sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.topic || "Your message")}`}>
                      Reply by email
                    </a>
                    <button className="btn btn--secondary btn--sm" onClick={() => mark(m, !m.is_read)}>
                      {m.is_read ? "Mark unread" : "Mark read"}
                    </button>
                    <button className="btn btn--sm adm-btn-ghost" onClick={() => del(m)}>
                      Delete
                    </button>
                    <span className="adm-muted">
                      {m.email} · {m.inquiry_id}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
