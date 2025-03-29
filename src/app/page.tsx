export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Witaj w kreatorze wspomnień</h1>
      <a href="auth/login" className="text-blue-600 underline mr-4">Zaloguj się</a>
      <a href="auth/register" className="text-blue-600 underline">Zarejestruj się</a>
     </main>
  )
}