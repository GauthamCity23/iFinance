import { createClient } from '@/utils/supabase/server'

type Props = {
  children: React.ReactNode
}

export default async function ThemeProviderServer({ children }: Props) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let accentColor = '#2563eb'
  let incomeColor = '#027a48'
  let expenseColor = '#c2410c'
  let balanceColor = '#4f46e5'
  let themeMode = 'light'

  if (user) {
    const { data: settings } = await supabase
      .from('user_settings')
      .select(
        'accent_color, income_color, expense_color, balance_color, theme_mode',
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (settings?.accent_color) accentColor = settings.accent_color
    if (settings?.income_color) incomeColor = settings.income_color
    if (settings?.expense_color) expenseColor = settings.expense_color
    if (settings?.balance_color) balanceColor = settings.balance_color
    if (settings?.theme_mode) themeMode = settings.theme_mode
  }

  return (
    <div
      data-theme={themeMode}
      style={
        {
          ['--accent' as string]: accentColor,
          ['--income-base' as string]: incomeColor,
          ['--expense-base' as string]: expenseColor,
          ['--balance-base' as string]: balanceColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
