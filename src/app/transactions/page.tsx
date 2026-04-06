import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppNav from '@/components/AppNav'
import TransactionsClient from '@/components/TransactionsClient'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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

  return (
    <div className="finance-shell">
      <AppNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <TransactionsClient
          categories={Array.isArray(categories) ? categories : []}
          transactions={Array.isArray(transactions) ? transactions : []}
        />
      </div>
    </div>
  )
}
