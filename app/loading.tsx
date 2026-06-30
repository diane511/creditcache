import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-6 py-24 dark:bg-black sm:items-start sm:px-16">
        <div className="h-[60px] w-[200px] animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <div className="space-y-3">
            <div className="h-10 w-72 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-56 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-3 max-w-md">
            <div className="h-5 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-11/12 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-4/5 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <div className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black bg-white px-5 md:w-[158px] dark:border-white dark:bg-black">
            <span className="animate-pulse text-black dark:text-white">
              Get Started
            </span>
          </div>

          <div className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.12] bg-transparent px-5 md:w-[158px] dark:border-white/[.18]">
            <span className="animate-pulse text-black dark:text-white">
              Opportunities
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}