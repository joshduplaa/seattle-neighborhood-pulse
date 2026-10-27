import type { ReactNode } from "react";

interface SegmentedOption<T> {
  id: T;
  label: ReactNode;
  /** Accessible name when the visible label is abbreviated. */
  ariaLabel?: string;
  title?: string;
}

/** A row of toggle buttons where exactly one is pressed. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label: string;
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`inline-flex max-w-full rounded-lg bg-surface-muted p-0.5 ring-1 ring-line ring-inset ${className}`}>
      {options.map((o) => {
        const pressed = value === o.id;
        return (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={pressed}
            aria-label={o.ariaLabel}
            title={o.title}
            onClick={() => onChange(o.id)}
            className={`tap flex-1 whitespace-nowrap rounded-md px-3 text-[13px] transition-colors ${
              pressed ? "bg-sound-strong font-medium text-white shadow-sm" : "text-ink-muted hover:bg-sound-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
