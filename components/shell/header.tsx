import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 md:hidden h-14 bg-surface border-b border-default flex items-center justify-between px-4 z-40">
      <span className="text-lg font-bold text-primary tracking-tight">
        BudgetBot
      </span>
      <UserButton />
    </header>
  );
}
