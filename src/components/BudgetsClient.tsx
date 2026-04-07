'use client'

import SetBudgetButton from '@/components/SetBudgetButton'
import MonthPicker from '@/components/MonthPicker'
import CopyPreviousBudgetsButton from '@/components/CopyPreviousBudgetsButton'

type BudgetSummaryType = {
  id: string
  name: string
  color: string
  budgetAmount: number
  spent: number
  remaining: number
  percentUsed: number
  isOverBudget: boolean
}

type Props = {
  selectedMonth: string
  budgetSummary: BudgetSummaryType[]
}

export default function BudgetsClient({ selectedMonth, budgetSummary }: Props) {
  const totalBudgeted = budgetSummary.reduce(
    (sum, item) => sum + item.budgetAmount,
    0,
  )

  const totalSpent = budgetSummary.reduce((sum, item) => sum + item.spent, 0)

  const totalRemaining = totalBudgeted - totalSpent

  const overBudgetCount = budgetSummary.filter(
    (item) => item.isOverBudget,
  ).length

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="page-title">Budgets</h2>
          <p className="mt-2 text-base text-muted">
            Manage your monthly spending limits by category
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <MonthPicker selectedMonth={selectedMonth} />
          <CopyPreviousBudgetsButton selectedMonth={selectedMonth} />
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-4">
        <div className="metric-card">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Total Budgeted</p>
          </div>
          <p className="metric-value">${totalBudgeted.toFixed(2)}</p>
          <p className="metric-subtext">Across all expense categories</p>
        </div>

        <div className="metric-card">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Total Spent</p>
          </div>
          <p className="metric-value">${totalSpent.toFixed(2)}</p>
          <p className="metric-subtext">Spent this month</p>
        </div>

        <div className="metric-card">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Remaining</p>
          </div>
          <p className="metric-value">${Math.abs(totalRemaining).toFixed(2)}</p>
          <p className="metric-subtext">
            {totalRemaining < 0 ? 'Over budget overall' : 'Left to spend'}
          </p>
        </div>

        <div className="metric-card">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Over Budget</p>
          </div>
          <p className="metric-value">{overBudgetCount}</p>
          <p className="metric-subtext">Categories over limit</p>
        </div>
      </div>

      <div className="panel-card p-6">
        <div className="mb-5">
          <h3 className="section-title">Monthly Budgets</h3>
          <p className="text-sm text-muted">
            Set and track budgets for your expense categories
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {budgetSummary.length > 0 ? (
            budgetSummary.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: item.color,
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <p className="truncate font-semibold">{item.name}</p>
                    </div>
                  </div>

                  <SetBudgetButton
                    categoryId={item.id}
                    categoryName={item.name}
                    selectedMonth={selectedMonth}
                    initialAmount={item.budgetAmount}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Spent</span>
                    <span className="font-medium">
                      ${item.spent.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Budget</span>
                    <span className="font-medium">
                      {item.budgetAmount > 0
                        ? `$${item.budgetAmount.toFixed(2)}`
                        : 'Not set'}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.percentUsed, 100)}%`,
                        backgroundColor: item.isOverBudget
                          ? '#dc2626'
                          : item.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Remaining</span>
                    <span
                      className={
                        item.remaining >= 0
                          ? 'font-medium text-green-700'
                          : 'font-medium text-red-700'
                      }
                    >
                      ${Math.abs(item.remaining).toFixed(2)}
                      {item.remaining < 0 ? ' over' : ' left'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-muted">
                    <span>Used</span>
                    <span>
                      {item.budgetAmount > 0
                        ? `${item.percentUsed.toFixed(1)}%`
                        : 'No budget'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-surface rounded-2xl border border-dashed p-6 text-sm text-muted md:col-span-2">
              No expense categories yet
            </div>
          )}
        </div>
      </div>
    </>
  )
}
