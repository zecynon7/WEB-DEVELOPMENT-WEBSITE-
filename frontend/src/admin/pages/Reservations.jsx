import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { useOverview } from "../Shell";
import { Empty, Spinner, useConfirm, useToast } from "../ui";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function Reservations() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("all");
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useOverview();

  const load = useCallback(async () => {
    try {
      setRows((await api.get("/admin/reservations")).data.reservations);
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
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const count = (s) => rows.filter((r) => r.status === s).length;

  const setStatus = async (r, status) => {
    try {
      await api.patch(`/admin/reservations/${r.reservation_id}`, { status });
      toast.ok(`${r.reservation_id} marked ${status}.`);
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };
  const del = async (r) => {
    if (
      !(await confirm({
        title: `Delete ${r.reservation_id}?`,
        message: "The guest will no longer be able to look it up.",
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    try {
      await api.delete(`/admin/reservations/${r.reservation_id}`);
      await load();
    } catch (err) {
      toast.bad(errorMessage(err));
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Reservations</h1>
          <p className="adm-muted">Requests from the Reserve page. Guests can check their status with their reference.</p>
        </div>
      </div>
      <div className="adm-chips">
        <button className={`adm-chip${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>
          All <b>{rows.length}</b>
        </button>
        {STATUSES.map((s) => (
          <button key={s} className={`adm-chip${filter === s ? " is-active" : ""}`} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)} <b>{count(s)}</b>
          </button>
        ))}
      </div>

      {!shown.length ? (
        <Empty title="No reservations here" text="New requests from the website appear in this list." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Branch</th>
                <th>When</th>
                <th>Guests</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.reservation_id}>
                  <td data-label="Reference">
                    <strong>{r.reservation_id}</strong>
                    <small>{new Date(r.created_at).toLocaleString()}</small>
                  </td>
                  <td data-label="Guest">
                    {r.full_name}
                    <small>
                      <a href={`tel:${r.phone}`}>{r.phone}</a> · <a href={`mailto:${r.email}`}>{r.email}</a>
                    </small>
                    {r.note && <small>“{r.note}”</small>}
                  </td>
                  <td data-label="Branch">{r.branch_name}</td>
                  <td data-label="When">
                    {r.visit_date}
                    <small>
                      {r.visit_time}
                      {r.duration ? ` · ${r.duration}` : ""}
                    </small>
                  </td>
                  <td data-label="Guests">{r.guests}</td>
                  <td data-label="Status">
                    <select className={`select adm-status adm-status--${r.status}`} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => del(r)} aria-label="Delete">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
