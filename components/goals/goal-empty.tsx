import { NewGoalDialog } from './new-goal-dialog'

export function GoalEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl" aria-hidden="true">🎯</span>
      <div>
        <p className="text-sm font-medium text-primary mb-1">No savings goals yet</p>
        <p className="text-xs text-muted">Start saving toward something you care about</p>
      </div>
      <NewGoalDialog label="Create your first goal" />
    </div>
  )
}
