'use client'

import { Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  transactionId: string
}

export default function DeleteTransactionButton({ transactionId }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm('Delete this transaction?')
    if (!confirmed) return

    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', transactionId)

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
