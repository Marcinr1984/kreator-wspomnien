// src/components/Sidebar.tsx
export default function Sidebar() {
    return (
      <aside className="w-64 bg-white shadow h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Kreator</h2>
        <ul>
          <li><a href="/" className="block py-2 text-blue-700">Strona główna</a></li>
          <li><a href="/dashboard" className="block py-2 text-blue-700">Dashboard</a></li>
        </ul>
    </aside>
    )
  }