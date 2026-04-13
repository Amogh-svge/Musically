import { useEffect, useId } from "react";

/**
 * Accessible modal shell for forms. Closes on backdrop click and Escape.
 */
export default function FormModal({ open, title, onClose, children, footer }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            className="btn btn-circle btn-sm bg-slate-200 text-slate-500 border-none shadow-none hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-400 active:bg-slate-200"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
