'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Props = {
  selectedMonth: string
}

function getPreviousMonth(monthStr: string) {
  const [yearStr, monthNumStr] = monthStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthNumStr)

  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() - 1)

  const prevYear = date.getFullYear()
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0')

  return `${prevYear}-${prevMonth}`
}

export default function CopyPreviousBudgetsButton({ selectedMonth }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const previousMonth = useMemo(
    () => getPreviousMonth(selectedMonth),
    [selectedMonth],
  )

  async function handleCopy() {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You must be logged in.')
      setLoading(false)
      return
    }

    const sourceMonthDate = `${previousMonth}-01`
    const targetMonthDate = `${selectedMonth}-01`

    const { data: previousBudgets, error: fetchError } = await supabase
      .from('budgets')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('budget_month', sourceMonthDate)

    if (fetchError) {
      setMessage(fetchError.message)
      setLoading(false)
      return
    }

    if (!previousBudgets || previousBudgets.length === 0) {
      setMessage(`No budgets found for ${previousMonth}.`)
      setLoading(false)
      return
    }

    const rowsToUpsert = previousBudgets.map((item) => ({
      user_id: user.id,
      category_id: item.category_id,
      budget_month: targetMonthDate,
      amount: item.amount,
    }))

    const { error: upsertError } = await supabase
      .from('budgets')
      .upsert(rowsToUpsert, {
        onConflict: 'user_id,category_id,budget_month',
      })

    if (upsertError) {
      setMessage(upsertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button onClick={handleCopy} disabled={loading} className="btn-secondary">
        {loading ? 'Copying...' : `Copy ${previousMonth} Budgets`}
      </button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  )
}
