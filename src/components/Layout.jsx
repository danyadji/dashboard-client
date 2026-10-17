import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  {
    to: '/dashboard',
    label: 'Beranda',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/tamu',
    label: 'Tamu',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: '/kirim',
    label: 'Kirim',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    to: '/ucapan',
    label: 'Ucapan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    to: '/pengaturan',
    label: 'Profil',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center">
      {/* Mobile Frame (max 430px) */}
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative pb-20">
        <main className="flex-1 px-4 sm:px-5 pt-3">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(31,29,27,0.03)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
          <div className="grid grid-cols-5 h-[56px] items-center">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
                    isActive ? 'text-primary font-semibold' : 'text-text-tertiary hover:text-text-secondary font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary-tint text-primary px-3 py-0.5 rounded-full'
                          : 'text-text-tertiary'
                      }`}
                    >
                      {t.icon}
                    </div>
                    <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                      {t.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
