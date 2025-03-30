export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <main className="min-h-screen flex items-center justify-center p-0 m-0 bg-[#f6faf9]">
        {children}
      </main>
    )
  }