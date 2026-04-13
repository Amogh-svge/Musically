import { createPortal } from "react-dom";
import { useRef, useState } from "react";

export default function RestrictedAction({ allowed, reason, children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  if (allowed) return children;

  return (
    <>
      <span
        ref={ref}
        className="inline-flex cursor-not-allowed opacity-55"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>

      {show &&
        ref.current &&
        createPortal(
          <div
            className="fixed z-[9999] rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              top: ref.current.getBoundingClientRect().bottom + 8,
              left:
                ref.current.getBoundingClientRect().left +
                ref.current.offsetWidth / 2,
              transform: "translateX(-50%)",
            }}
          >
            {reason}
          </div>,
          document.body
        )}
    </>
  );
}