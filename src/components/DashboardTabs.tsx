'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { label: 'Panel główny', href: '/dashboard' },
  { label: 'Prośby', href: '/dashboard/prosby' },
  { label: 'Zgłoszenia', href: '/dashboard/zgloszenia' }
]

interface DashboardTabsProps {
  activePath?: string
}

export default function DashboardTabs({ activePath }: DashboardTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const current = activePath ?? pathname

  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-10 h-[64px] text-sm">
          {tabs.map((tab) => {
            const isActive = current === tab.href
            return (
              <button
                key={tab.href}
                onClick={() => {
                  if (!isActive) router.push(tab.href)
                }}
                className={`relative flex h-full flex-col items-center justify-center transition-colors ${
                  isActive ? 'text-cyan-600 font-medium' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-sm md:text-base">{tab.label}</span>
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-3/5 h-[3px] rounded-full origin-center transition-all duration-300 ease-out ${
                    isActive
                      ? 'bottom-[-2px] opacity-100 bg-gradient-to-r from-cyan-500 via-sky-400 to-rose-400 scale-x-100'
                      : 'bottom-[-22px] opacity-0 bg-transparent scale-x-0'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
