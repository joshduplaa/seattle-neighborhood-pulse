import type { ReactNode } from "react";

interface PanelProps {
  id?: string;
  title: string;
  /** Short line describing scope, units or filters. */
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ id, title, description, actions, children, className = "", bodyClassName = "" }: PanelProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-32 rounded-2xl border border-line bg-surface lg:scroll-mt-40 ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="min-w-0 flex-1 basis-56">
          <h2 id={headingId} className="font-display text-lg font-semibold leading-7 text-ink">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-ink-subtle">{description}</p> : null}
        </div>
        {actions ? <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className={bodyClassName || "px-4 pb-4 pt-3 sm:px-6 sm:pb-6"}>{children}</div>
    </section>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-1 px-4 py-8 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? <div className="max-w-sm text-[13px] leading-5 text-ink-subtle">{children}</div> : null}
    </div>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={`size-3.5 shrink-0 transition-transform ${className}`}>
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Progressive disclosure for methodology and secondary detail. A native
 * <details>, so it is keyboard- and screen-reader-accessible as is.
 */
export function Disclosure({ summary, children, className = "" }: { summary: ReactNode; children: ReactNode; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="tap flex cursor-pointer list-none items-center gap-1.5 rounded-md text-[13px] font-medium text-sound-strong hover:text-sound-deep [&::-webkit-details-marker]:hidden">
        {summary}
        <Chevron className="group-open:rotate-180" />
      </summary>
      <div className="pb-1 pt-1 text-xs leading-5 text-ink-subtle">{children}</div>
    </details>
  );
}
