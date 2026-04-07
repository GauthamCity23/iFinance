'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import AddCategoryModal from '@/components/AddCategoryModal'
import AddTransactionModal from '@/components/AddTransactionModal'
import MonthPicker from '@/components/MonthPicker'
import DeleteCategoryButton from '@/components/DeleteCategoryButton'
import EditCategoryButton from '@/components/EditCategoryButton'

type CategoryType = {
  id: string
  name: string
  kind: string
  color: string | null
}

type TransactionCategoryType =
  | {
      id?: string
      name?: string
      color?: string | null
    }
  | {
      id?: string
      name?: string
      color?: string | null
    }[]
  | null

type TransactionType = {
  id: string
  title: string
  amount: number | string
  type: string
  transaction_date: string
  notes: string | null
  category_id: string | null
  categories: TransactionCategoryType
}

type TrendPoint = {
  month: string
  income: number
  expense: number
}

type CategoryBreakdownType = {
  name: string
  value: number
  color: string
}

type CategorySummaryType = {
  id: string
  name: string
  kind: string
  color: string | null
  total: number
  transactionCount: number
  displayColor: string
}

type Props = {
  selectedMonth: string
  categories: CategoryType[]
  totalIncome: number
  totalExpenses: number
  netBalance: number
  monthlyTrend: TrendPoint[]
  categoryData: CategoryBreakdownType[]
  categorySummary: CategorySummaryType[]
  recentTransactions: TransactionType[]
}

type ChartView = 'both' | 'income' | 'expense'

export default function DashboardClient({
  selectedMonth,
  categories,
  totalIncome,
  totalExpenses,
  netBalance,
  monthlyTrend,
  categoryData,
  categorySummary,
  recentTransactions,
}: Props) {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [chartView, setChartView] = useState<ChartView>('both')

  const chartSubtitle = useMemo(() => {
    if (chartView === 'income') return 'Income over time'
    if (chartView === 'expense') return 'Expenses over time'
    return 'Income vs expenses over time'
  }, [chartView])

  return (
    <>
      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />

      <AddTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={categories}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="mt-2 text-base text-muted">
            Track your finances with ease
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <MonthPicker selectedMonth={selectedMonth} />

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="btn-secondary"
          >
            + Add Category
          </button>

          <button
            onClick={() => setTransactionModalOpen(true)}
            className="btn-primary"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="metric-card metric-income">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Total Income</p>
            <TrendingUp className="h-5 w-5 opacity-70" />
          </div>
          <p className="metric-value">${totalIncome.toFixed(2)}</p>
          <p className="metric-subtext">Money received</p>
        </div>

        <div className="metric-card metric-expense">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Total Expenses</p>
            <TrendingDown className="h-5 w-5 opacity-70" />
          </div>
          <p className="metric-value">${totalExpenses.toFixed(2)}</p>
          <p className="metric-subtext">Money spent</p>
        </div>

        <div className="metric-card metric-balance">
          <div className="mb-5 flex items-start justify-between">
            <p className="metric-label">Net Balance</p>
            <DollarSign className="h-5 w-5 opacity-70" />
          </div>
          <p className="metric-value">${netBalance.toFixed(2)}</p>
          <p className="metric-subtext">Income - Expenses</p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="panel-card p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="section-title">6-Month Trend</h3>
              <p className="mt-1 text-sm text-muted">{chartSubtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setChartView('income')}
                className={
                  chartView === 'income' ? 'btn-primary' : 'btn-secondary'
                }
              >
                Income
              </button>

              <button
                onClick={() => setChartView('expense')}
                className={
                  chartView === 'expense' ? 'btn-primary' : 'btn-secondary'
                }
              >
                Expenses
              </button>

              <button
                onClick={() => setChartView('both')}
                className={
                  chartView === 'both' ? 'btn-primary' : 'btn-secondary'
                }
              >
                Compare
              </button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    color: 'var(--foreground)',
                  }}
                />

                {(chartView === 'both' || chartView === 'income') && (
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--income-base)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Income"
                  />
                )}

                {(chartView === 'both' || chartView === 'expense') && (
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--expense-base)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Expenses"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card p-6">
          <h3 className="section-title">Category Breakdown</h3>
          <p className="mb-5 text-sm text-muted">
            Spending by category this month
          </p>

          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No expense data this month
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel-card min-h-[460px] p-6">
          <h3 className="section-title">Your Categories</h3>
          <p className="mb-5 text-sm text-muted">Manage your categories</p>

          <div className="grid max-h-[360px] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
            {categorySummary.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: cat.displayColor,
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.displayColor }}
                      />
                      <p className="truncate font-semibold">{cat.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EditCategoryButton
                      categoryId={cat.id}
                      initialName={cat.name}
                      initialKind={cat.kind}
                      initialColor={cat.color}
                      transactionCount={cat.transactionCount}
                    />

                    <DeleteCategoryButton
                      categoryId={cat.id}
                      categoryName={cat.name}
                      categoryKind={cat.kind}
                    />
                  </div>
                </div>

                <p
                  className={`text-3xl font-bold ${
                    cat.total >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  ${Math.abs(cat.total).toFixed(2)}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-muted">
                    {cat.transactionCount} transaction
                    {cat.transactionCount === 1 ? '' : 's'}
                  </p>

                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted">
                    {cat.kind}
                  </span>
                </div>
              </div>
            ))}

            {categorySummary.length === 0 ? (
              <div className="empty-surface rounded-2xl border border-dashed p-6 text-sm">
                No categories yet
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel-card min-h-[460px] p-6">
          <h3 className="section-title">Recent Transactions</h3>
          <p className="mb-5 text-sm text-muted">Latest activity this month</p>

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => {
                const category = Array.isArray(txn.categories)
                  ? txn.categories[0]
                  : txn.categories

                const badgeColor = category?.color || '#94a3b8'

                return (
                  <div
                    key={txn.id}
                    className="empty-surface flex items-center justify-between rounded-2xl border px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {(category?.name || txn.title || 'T')[0]}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {category?.name || txn.title}
                        </p>
                        <p className="text-sm text-muted">
                          {format(
                            new Date(txn.transaction_date),
                            'MMM d, yyyy',
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          txn.type === 'income'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {txn.type === 'income' ? '+' : '-'}$
                        {Number(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted capitalize">
                        {txn.type}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex h-[260px] items-center justify-center text-muted">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
