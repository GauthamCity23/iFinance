import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppNav from '@/components/AppNav'
import BudgetsClient from '@/components/BudgetsClient'
import { format } from 'date-fns'

const fallbackColors = [
  '#ff6b6b',
  '#4ecdc4',
  '#ffe66d',
  '#a8e6cf',
  '#95e1d3',
  '#6c5ce7',
  '#ff9ff3',
  '#54a0ff',
  '#48dbfb',
  '#1dd1a1',
]

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const selectedMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : format(new Date(), 'yyyy-MM')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, kind, color')
    .order('name', { ascending: true })

  const { data: transactions } = await supabase
    .from('transactions')
    .select(
      `
      id,
      title,
      amount,
      type,
      transaction_date,
      notes,
      category_id
    `,
    )
    .order('transaction_date', { ascending: false })

  const safeCategories = categories || []
  const safeTransactions = transactions || []

  const expenseCategories = safeCategories.filter(
    (cat) => cat.kind === 'expense',
  )

  const monthTransactions = safeTransactions.filter((item) =>
    item.transaction_date.startsWith(selectedMonth),
  )

  const budgetMonthDate = `${selectedMonth}-01`

  const { data: budgets } = await supabase
    .from('budgets')
    .select('id, category_id, amount, budget_month')
    .eq('user_id', user.id)
    .eq('budget_month', budgetMonthDate)

  const safeBudgets = budgets || []

  const budgetSummary = expenseCategories.map((cat, index) => {
    const spent = monthTransactions
      .filter((item) => item.type === 'expense' && item.category_id === cat.id)
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const matchingBudget = safeBudgets.find(
      (item) => item.category_id === cat.id,
    )

    const budgetAmount = matchingBudget ? Number(matchingBudget.amount) : 0
    const remaining = budgetAmount - spent
    const percentUsed =
      budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 999) : 0

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color || fallbackColors[index % fallbackColors.length],
      budgetAmount,
      spent,
      remaining,
      percentUsed,
      isOverBudget: budgetAmount > 0 && spent > budgetAmount,
    }
  })

  return (
    <div className="finance-shell">
      <AppNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <BudgetsClient
          selectedMonth={selectedMonth}
          budgetSummary={budgetSummary}
        />
      </div>
    </div>
  )
}
