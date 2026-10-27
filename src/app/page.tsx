import { Suspense } from "react";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { SiteNav } from "@/components/SiteNav";
import { Skeleton } from "@/components/ui/Panel";
import { DATASET_NAME, DATASET_PAGE_URL, DATASET_PUBLISHER } from "@/lib/socrata/config";

function Logo() {
  // Abstract mark: a pulse line over Puget Sound waves.
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#063f57" />
      <path d="M5 17h5l2.5-6 4 12 3-9 2 3H27" fill="none" stroke="#9fd3df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 25c2.5-1.6 4.5-1.6 7 0s4.5 1.6 7 0 4.5-1.6 6 0" fill="none" stroke="#00a3c8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DashboardFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading dashboard">
      <Skeleton className="h-10 w-80 max-w-full" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-2xl lg:h-20" />
      <Skeleton className="h-[420px] w-full rounded-2xl sm:h-[520px]" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to dashboard
      </a>
      <header className="border-b border-line bg-surface lg:sticky lg:top-0 lg:z-40">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 pb-1 pt-3 sm:px-6 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
          <a href="#main" className="flex shrink-0 items-center gap-2.5">
            <Logo />
            <span className="leading-tight">
              <span className="block font-display text-[17px] font-semibold text-ink">Seattle Neighborhood Pulse</span>
              <span className="hidden text-xs text-ink-subtle sm:block">Civic service requests, mapped</span>
            </span>
          </a>
          <SiteNav />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
        <Suspense fallback={<DashboardFallback />}>
          <Dashboard />
        </Suspense>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 py-5 text-xs text-ink-subtle sm:px-6">
          <p>
            Data:{" "}
            <a href={DATASET_PAGE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              {DATASET_PUBLISHER}, {DATASET_NAME}
            </a>{" "}
            (public domain). Basemap © OpenStreetMap contributors, OpenFreeMap.
          </p>
          <p>Independent project; not affiliated with the City of Seattle.</p>
        </div>
      </footer>
    </>
  );
}
