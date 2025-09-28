export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071120] via-[#0d1b33] to-[#101a2c] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-48 -left-20 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
