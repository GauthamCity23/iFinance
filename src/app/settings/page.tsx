import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppNav from '@/components/AppNav'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select(
      'accent_color, surface_style, income_color, expense_color, balance_color, theme_mode',
    )
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="finance-shell">
      <AppNav />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <SettingsClient
          initialAccentColor={settings?.accent_color || '#2563eb'}
          initialSurfaceStyle={settings?.surface_style || 'clean'}
          initialIncomeColor={settings?.income_color || '#027a48'}
          initialExpenseColor={settings?.expense_color || '#c2410c'}
          initialBalanceColor={settings?.balance_color || '#4f46e5'}
          initialThemeMode={settings?.theme_mode || 'light'}
        />
      </div>
    </div>
  )
}
