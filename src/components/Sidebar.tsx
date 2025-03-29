// src/components/Sidebar.tsx

export default function Sidebar() {
    return (
      <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">🕊️ Kreator</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block text-blue-600 hover:underline">Dashboard</a>
          <a href="/auth/login" className="block text-blue-600 hover:underline">Wyloguj</a>
        </nav>
      </aside>
    )
  }