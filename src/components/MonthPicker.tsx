'use client'

import { useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

type Props = {
  selectedMonth: string
}

type MonthInputWithPicker = HTMLInputElement & {
  showPicker?: () => void
}

export default function MonthPicker({ selectedMonth }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<MonthInputWithPicker | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (!value) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('month', value)

    router.push(`${pathname}?${params.toString()}`)
  }

  function handleOpenPicker() {
    const input = inputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
  }

  const displayDate = new Date(`${selectedMonth}-01T00:00:00`)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleOpenPicker}
        className="btn-secondary flex items-center gap-2"
      >
        <span>{format(displayDate, 'MMMM yyyy')}</span>
        <CalendarDays className="h-4 w-4 text-slate-500" />
      </button>

      <input
        ref={inputRef}
        type="month"
        value={selectedMonth}
        onChange={handleChange}
        className="pointer-events-none absolute right-0 top-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
