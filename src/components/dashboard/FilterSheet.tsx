"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Bottom sheet built on the native modal <dialog>: focus is trapped while it
 * is open, Escape closes it, and focus returns to the button that opened it.
 */
export function FilterSheet({ open, onClose, title, children, footer }: FilterSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Keep the page behind the sheet from scrolling.
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={headingId}
      onClose={() => {
        document.documentElement.style.overflow = "";
        onClose();
      }}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overscroll-contain rounded-t-2xl bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 open:flex open:flex-col"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-1">
        <h2 id={headingId} className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="tap -mr-2 flex min-w-11 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink"
          aria-label={`Close ${title.toLowerCase()}`}
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {footer ? <footer className="border-t border-line px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">{footer}</footer> : null}
    </dialog>
  );
}
