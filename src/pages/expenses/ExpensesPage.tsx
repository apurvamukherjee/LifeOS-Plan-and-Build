import { AddExpenseForm } from '@/modules/expenses/components/AddExpenseForm'
import { ExpenseListItem } from '@/modules/expenses/components/ExpenseListItem'
import { MonthlyOverview } from '@/modules/expenses/components/MonthlyOverview'
import { SetBudgetForm } from '@/modules/expenses/components/SetBudgetForm'
import { useExpenses } from '@/modules/expenses/hooks/useExpenses'

export function ExpensesPage() {
  const expenses = useExpenses()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Expenses</h1>

      <MonthlyOverview />
      <AddExpenseForm />
      <SetBudgetForm />

      <div className="flex flex-col gap-2">
        {expenses?.length ? (
          expenses.map((expense) => <ExpenseListItem key={expense.id} expense={expense} />)
        ) : (
          <span className="text-sm text-(--color-text-muted)">No transactions logged yet.</span>
        )}
      </div>
    </div>
  )
}
