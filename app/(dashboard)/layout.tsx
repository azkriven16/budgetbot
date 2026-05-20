import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { Header } from '@/components/shell/header'
import { Sidebar } from '@/components/shell/sidebar'
import { BottomNav } from '@/components/shell/bottom-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await getOrCreateUser(userId)

  return (
    <div className="min-h-dvh bg-base">
      <Header />
      <Sidebar />
      <main className="pt-14 pb-20 md:pt-0 md:pb-0 md:pl-64 min-h-dvh">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
