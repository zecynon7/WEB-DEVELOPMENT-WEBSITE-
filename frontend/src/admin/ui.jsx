import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------- toasts */

const ToastCtx = createContext({ ok: () => {}, bad: () => {} });
export const useToast = () => useContext(ToastCtx);

/* --------------------------------------------------------------- confirm */

const ConfirmCtx = createContext(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [ask, setAsk] = useState(null);
  const n = useRef(0);

  const push = useCallback((kind, text) => {
    const id = ++n.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "bad" ? 6000 : 3200);
  }, []);
  const toast = useRef({ ok: (t) => push("ok", t), bad: (t) => push("bad", t) }).current;
  const confirm = useCallback((o) => new Promise((resolve) => setAsk({ ...o, resolve })), []);

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="adm-toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>
              {t.text}
            </div>
          ))}
        </div>
        {ask && (
          <Modal
            title={ask.title}
            onClose={() => {
              ask.resolve(false);
              setAsk(null);
            }}
            small
          >
            {ask.message && <p>{ask.message}</p>}
            <div className="adm-actions">
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  ask.resolve(false);
                  setAsk(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`btn btn--sm ${ask.danger ? "adm-btn-danger" : "btn--primary"}`}
                onClick={() => {
                  ask.resolve(true);
                  setAsk(null);
                }}
              >
                {ask.confirmLabel || "Confirm"}
              </button>
            </div>
          </Modal>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

/* ----------------------------------------------------------------- modal */
export function Modal({ title, onClose, children, small, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`adm-modal__panel${small ? " adm-modal__panel--small" : ""}${wide ? " adm-modal__panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="adm-modal__head">
          <h2>{title}</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="adm-modal__body">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ title, text, children }) {
  return (
    <div className="adm-empty">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export const Spinner = () => <div className="adm-spinner" role="status" aria-label="Loading" />;
