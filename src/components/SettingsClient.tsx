'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Props = {
  initialAccentColor: string
  initialSurfaceStyle: string
  initialIncomeColor: string
  initialExpenseColor: string
  initialBalanceColor: string
  initialThemeMode: string
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold">{label}</label>

      <div className="flex items-center gap-4">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-16 cursor-pointer rounded-lg border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        />

        <div
          className="h-12 flex-1 rounded-xl border"
          style={{
            backgroundColor: value,
            borderColor: 'var(--border)',
          }}
        />

        <div className="min-w-[90px] text-sm text-muted">{value}</div>
      </div>
    </div>
  )
}

export default function SettingsClient({
  initialAccentColor,
  initialSurfaceStyle,
  initialIncomeColor,
  initialExpenseColor,
  initialBalanceColor,
  initialThemeMode,
}: Props) {
  const router = useRouter()

  const [accentColor, setAccentColor] = useState(initialAccentColor)
  const [surfaceStyle, setSurfaceStyle] = useState(initialSurfaceStyle)
  const [incomeColor, setIncomeColor] = useState(initialIncomeColor)
  const [expenseColor, setExpenseColor] = useState(initialExpenseColor)
  const [balanceColor, setBalanceColor] = useState(initialBalanceColor)
  const [themeMode, setThemeMode] = useState(initialThemeMode)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--income-base', incomeColor)
    document.documentElement.style.setProperty('--expense-base', expenseColor)
    document.documentElement.style.setProperty('--balance-base', balanceColor)
    document.documentElement.setAttribute('data-theme', themeMode)
  }, [accentColor, incomeColor, expenseColor, balanceColor, themeMode])

  async function handleSave() {
    setSaving(true)
    setMessage('')

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      accent_color: accentColor,
      surface_style: surfaceStyle,
      income_color: incomeColor,
      expense_color: expenseColor,
      balance_color: balanceColor,
      theme_mode: themeMode,
    })

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setMessage('Settings saved.')
    setSaving(false)
    router.refresh()
  }

  function handleReset() {
    setAccentColor(initialAccentColor)
    setSurfaceStyle(initialSurfaceStyle)
    setIncomeColor(initialIncomeColor)
    setExpenseColor(initialExpenseColor)
    setBalanceColor(initialBalanceColor)
    setThemeMode(initialThemeMode)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="mt-2 text-base text-muted">
          Customize the look of your finance app
        </p>
      </div>

      <div className="panel-card p-6 space-y-6">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Theme Mode</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={
                themeMode === 'light' ? 'btn-primary' : 'btn-secondary'
              }
            >
              Light
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={themeMode === 'dark' ? 'btn-primary' : 'btn-secondary'}
            >
              Dark
            </button>
          </div>
        </div>

        <ColorControl
          label="Accent Color"
          value={accentColor}
          onChange={setAccentColor}
        />

        <ColorControl
          label="Income Card Color"
          value={incomeColor}
          onChange={setIncomeColor}
        />

        <ColorControl
          label="Expense Card Color"
          value={expenseColor}
          onChange={setExpenseColor}
        />

        <ColorControl
          label="Balance Card Color"
          value={balanceColor}
          onChange={setBalanceColor}
        />
      </div>

      <div className="panel-card p-6">
        <h2 className="mb-4 text-2xl font-semibold">Preview</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div
            className="metric-card"
            style={{
              backgroundColor:
                'color-mix(in srgb, ' + incomeColor + ' 13%, var(--card))',
              color: incomeColor,
            }}
          >
            <p className="metric-label">Income</p>
            <p className="metric-value">$4,250</p>
            <p className="metric-subtext">Monthly income</p>
          </div>

          <div
            className="metric-card"
            style={{
              backgroundColor:
                'color-mix(in srgb, ' + expenseColor + ' 13%, var(--card))',
              color: expenseColor,
            }}
          >
            <p className="metric-label">Expenses</p>
            <p className="metric-value">$1,980</p>
            <p className="metric-subtext">Monthly expenses</p>
          </div>

          <div
            className="metric-card"
            style={{
              backgroundColor:
                'color-mix(in srgb, ' + balanceColor + ' 13%, var(--card))',
              color: balanceColor,
            }}
          >
            <p className="metric-label">Balance</p>
            <p className="metric-value">$2,270</p>
            <p className="metric-subtext">Net balance</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
      </div>
    </div>
  )
}
