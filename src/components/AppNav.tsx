'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, Settings, Landmark } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="topbar">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <Landmark className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Finance Tracker
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'nav-pill-active' : 'nav-pill'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <div className="ml-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
