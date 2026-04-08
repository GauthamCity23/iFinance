'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import MonthPicker from '@/components/MonthPicker'

type MonthlyPoint = {
  month: string
  income: number
  expense: number
  net: number
}

type CategoryPoint = {
  name: string
  value: number
  color: string
}

type Props = {
  selectedRange: string
  selectedMonth: string
  monthlyData?: MonthlyPoint[]
  categoryData?: CategoryPoint[]
  totalIncome?: number
  totalExpense?: number
  totalNet?: number
}

export default function ReportsClient({
  selectedRange,
  selectedMonth,
  monthlyData = [],
  categoryData = [],
  totalIncome = 0,
  totalExpense = 0,
  totalNet = 0,
}: Props) {
  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : []
  const safeCategoryData = Array.isArray(categoryData) ? categoryData : []

  const topCategories = useMemo(() => {
    return [...safeCategoryData].sort((a, b) => b.value - a.value).slice(0, 5)
  }, [safeCategoryData])

  function buildRangeHref(range: string) {
    if (range === 'month') {
      return `/reports?range=month&month=${selectedMonth}`
    }
    return `/reports?range=${range}`
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="page-title font-display">Reports</h2>
          <p className="mt-2 text-base text-muted">
            Visualize your income, expenses, and trends over time
          </p>
        </div>

        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <a
            href={buildRangeHref('3m')}
            className={selectedRange === '3m' ? 'btn-primary' : 'btn-secondary'}
          >
            Last 3 Months
          </a>

          <a
            href={buildRangeHref('6m')}
            className={selectedRange === '6m' ? 'btn-primary' : 'btn-secondary'}
          >
            Last 6 Months
          </a>

          <a
            href={buildRangeHref('12m')}
            className={
              selectedRange === '12m' ? 'btn-primary' : 'btn-secondary'
            }
          >
            Last 12 Months
          </a>

          <a
            href={buildRangeHref('all')}
            className={
              selectedRange === 'all' ? 'btn-primary' : 'btn-secondary'
            }
          >
            All Time
          </a>

          <a
            href={buildRangeHref('month')}
            className={
              selectedRange === 'month' ? 'btn-primary' : 'btn-secondary'
            }
          >
            Single Month
          </a>

          {selectedRange === 'month' ? (
            <MonthPicker selectedMonth={selectedMonth} />
          ) : null}
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="metric-card metric-income">
          <div className="mb-5">
            <p className="metric-label">Total Income</p>
          </div>
          <p className="metric-value">${Number(totalIncome).toFixed(2)}</p>
          <p className="metric-subtext">For selected period</p>
        </div>

        <div className="metric-card metric-expense">
          <div className="mb-5">
            <p className="metric-label">Total Expenses</p>
          </div>
          <p className="metric-value">${Number(totalExpense).toFixed(2)}</p>
          <p className="metric-subtext">For selected period</p>
        </div>

        <div className="metric-card metric-balance">
          <div className="mb-5">
            <p className="metric-label">Net Balance</p>
          </div>
          <p className="metric-value">
            {Number(totalNet) < 0 ? '-$' : '$'}
            {Math.abs(Number(totalNet)).toFixed(2)}
          </p>
          <p className="metric-subtext">Income minus expenses</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="panel-card min-h-[430px] p-4 sm:p-6">
          <h3 className="section-title font-display">Income vs Expenses</h3>
          <p className="mb-5 text-sm text-muted">
            Monthly comparison for the selected period
          </p>

          <div className="h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeMonthlyData}>
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
                <Bar
                  dataKey="income"
                  fill="var(--income-base)"
                  radius={[8, 8, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expense"
                  fill="var(--expense-base)"
                  radius={[8, 8, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card min-h-[430px] p-4 sm:p-6">
          <h3 className="section-title font-display">Top Expense Categories</h3>
          <p className="mb-5 text-sm text-muted">
            Largest spending categories for the selected period
          </p>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="h-[280px] sm:h-[320px]">
              {safeCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeCategoryData}
                      dataKey="value"
                      outerRadius={95}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                    >
                      {safeCategoryData.map((entry, index) => (
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
                  No category data yet
                </div>
              )}
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 sm:pr-2">
              {topCategories.length > 0 ? (
                topCategories.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="empty-surface flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate font-medium">{item.name}</span>
                    </div>

                    <span className="shrink-0 font-semibold">
                      ${Number(item.value).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-surface rounded-2xl border border-dashed p-4 text-sm text-muted">
                  No expense categories yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card p-4 sm:p-6">
        <h3 className="section-title font-display">Net Trend</h3>
        <p className="mb-5 text-sm text-muted">
          Monthly net income after expenses
        </p>

        <div className="h-[300px] sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeMonthlyData}>
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
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--balance-base)"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Net"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
