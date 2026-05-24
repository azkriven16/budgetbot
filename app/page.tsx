import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/chat");

  // Unauthenticated users see a minimal landing page.
  // This also ensures PWABuilder and search crawlers receive real HTML
  // with the <link rel="manifest"> tag from the root layout.
  return (
    <main className="flex flex-col items-center justify-center min-h-dvh gap-6 p-8 bg-base">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
          <span className="text-3xl font-bold text-white">B</span>
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">BudgBot</h1>
        <p className="text-sm text-muted text-center max-w-xs">
          Chat-first personal finance tracker
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/sign-in"
          className="px-5 py-2.5 text-sm font-medium rounded-xl bg-accent text-white hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="px-5 py-2.5 text-sm font-medium rounded-xl border border-default text-primary hover:bg-subtle transition-colors"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
