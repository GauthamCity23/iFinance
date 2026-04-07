import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppNav from '@/components/AppNav'
import ReportsClient from '@/components/ReportsClient'
import { eachMonthOfInterval, format, startOfMonth, subMonths } from 'date-fns'

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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; month?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const selectedRange =
    params.range && ['3m', '6m', '12m', 'all', 'month'].includes(params.range)
      ? params.range
      : '6m'

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
    .select('id, amount, type, transaction_date, category_id')
    .order('transaction_date', { ascending: true })

  const safeCategories = Array.isArray(categories) ? categories : []
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  let monthsToShow: Date[] = []

  if (selectedRange === 'month') {
    const singleDate = new Date(`${selectedMonth}-01T00:00:00`)
    monthsToShow = [startOfMonth(singleDate)]
  } else if (selectedRange === '3m') {
    monthsToShow = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 2)),
      end: startOfMonth(new Date()),
    })
  } else if (selectedRange === '6m') {
    monthsToShow = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: startOfMonth(new Date()),
    })
  } else if (selectedRange === '12m') {
    monthsToShow = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 11)),
      end: startOfMonth(new Date()),
    })
  } else {
    const datedTransactions = safeTransactions
      .map((item) => new Date(`${item.transaction_date}T00:00:00`))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    if (datedTransactions.length > 0) {
      monthsToShow = eachMonthOfInterval({
        start: startOfMonth(datedTransactions[0]),
        end: startOfMonth(new Date()),
      })
    } else {
      monthsToShow = [
        startOfMonth(subMonths(new Date(), 5)),
        startOfMonth(subMonths(new Date(), 4)),
        startOfMonth(subMonths(new Date(), 3)),
        startOfMonth(subMonths(new Date(), 2)),
        startOfMonth(subMonths(new Date(), 1)),
        startOfMonth(new Date()),
      ]
    }
  }

  const allowedMonthKeys = new Set(
    monthsToShow.map((date) => format(date, 'yyyy-MM')),
  )

  const filteredTransactions = safeTransactions.filter((item) =>
    allowedMonthKeys.has(item.transaction_date.slice(0, 7)),
  )

  const monthlyData = monthsToShow.map((date) => {
    const monthKey = format(date, 'yyyy-MM')

    const monthTxns = filteredTransactions.filter((item) =>
      item.transaction_date.startsWith(monthKey),
    )

    const income = monthTxns
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expense = monthTxns
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return {
      month: format(date, 'MMM yyyy'),
      income,
      expense,
      net: income - expense,
    }
  })

  const totalIncome = filteredTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalExpense = filteredTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalNet = totalIncome - totalExpense

  const expenseCategories = safeCategories.filter(
    (cat) => cat.kind === 'expense',
  )

  const categoryData = expenseCategories
    .map((cat, index) => {
      const value = filteredTransactions
        .filter(
          (item) => item.type === 'expense' && item.category_id === cat.id,
        )
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)

      return {
        name: cat.name,
        value,
        color: cat.color || fallbackColors[index % fallbackColors.length],
      }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="finance-shell">
      <AppNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ReportsClient
          selectedRange={selectedRange}
          selectedMonth={selectedMonth}
          monthlyData={monthlyData}
          categoryData={categoryData}
          totalIncome={Number(totalIncome)}
          totalExpense={Number(totalExpense)}
          totalNet={Number(totalNet)}
        />
      </div>
    </div>
  )
}
