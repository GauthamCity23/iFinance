import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppNav from '@/components/AppNav'
import DashboardClient from '@/components/DashboardClient'
import { format, eachMonthOfInterval, startOfMonth, subMonths } from 'date-fns'

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

export default async function DashboardPage({
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
      category_id,
      categories (
        id,
        name,
        color
      )
    `,
    )
    .order('transaction_date', { ascending: false })

  const safeCategories = categories || []
  const safeTransactions = transactions || []

  const currentMonthString = selectedMonth

  const monthTransactions = safeTransactions.filter((item) =>
    item.transaction_date.startsWith(currentMonthString),
  )

  const totalIncome = monthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const totalExpenses = monthTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const netBalance = totalIncome - totalExpenses

  const last6Months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: startOfMonth(new Date()),
  })

  const monthlyTrend = last6Months.map((date) => {
    const monthKey = format(date, 'yyyy-MM')

    const monthTxns = safeTransactions.filter((item) =>
      item.transaction_date.startsWith(monthKey),
    )

    const income = monthTxns
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const expense = monthTxns
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    return {
      month: format(date, 'MMM'),
      income,
      expense,
    }
  })

  const expenseCategories = safeCategories.filter(
    (cat) => cat.kind === 'expense',
  )

  const categoryData = expenseCategories
    .map((cat, index) => {
      const value = monthTransactions
        .filter(
          (item) => item.type === 'expense' && item.category_id === cat.id,
        )
        .reduce((sum, item) => sum + Number(item.amount), 0)

      return {
        name: cat.name,
        value,
        color: cat.color || fallbackColors[index % fallbackColors.length],
      }
    })
    .filter((item) => item.value > 0)

  const recentTransactions = monthTransactions.slice(0, 5)

  const categorySummary = safeCategories.map((cat, index) => {
    const catTransactions = monthTransactions.filter(
      (item) => item.category_id === cat.id,
    )

    const total = catTransactions.reduce(
      (sum, item) =>
        item.type === 'income'
          ? sum + Number(item.amount)
          : sum - Number(item.amount),
      0,
    )

    return {
      ...cat,
      total,
      transactionCount: catTransactions.length,
      displayColor: cat.color || fallbackColors[index % fallbackColors.length],
    }
  })

  return (
    <div className="finance-shell">
      <AppNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <DashboardClient
          selectedMonth={selectedMonth}
          categories={safeCategories}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netBalance={netBalance}
          monthlyTrend={monthlyTrend}
          categoryData={categoryData}
          categorySummary={categorySummary}
          recentTransactions={recentTransactions}
        />
      </div>
    </div>
  )
}
