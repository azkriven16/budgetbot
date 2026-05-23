import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { getUserGoals } from '@/lib/goals'
import { GoalCard } from '@/components/goals/goal-card'
import { GoalEmpty } from '@/components/goals/goal-empty'
import { NewGoalDialog } from '@/components/goals/new-goal-dialog'

export default async function GoalsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const user = await getOrCreateUser(clerkId)
  const goals = await getUserGoals(user.id)

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-primary">Savings Goals</h1>
        <NewGoalDialog />
      </div>
      {goals.length === 0 ? (
        <GoalEmpty />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
