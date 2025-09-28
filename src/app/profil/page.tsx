'use client'

import { useState, type FormEvent, type SVGProps, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@supabase/auth-helpers-react'
import {
  ArrowLeftIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid'

import { supabase } from '../../utils/supabaseClient'
import TopNavbar from '../../components/TopNavbar'

const sectionLabels: Record<string, string> = {
  profile: 'Twój profil',
  email: 'Adres e-mail',
  password: 'Hasło',
  notifications: 'Powiadomienia',
  keeper: 'Opiekun Plus',
  other: 'Inne ustawienia'
}

const sectionDescriptions: Record<string, string> = {
  profile: 'Zobacz podstawowe informacje i dbaj o aktualność danych swojego konta.',
  email: 'Zmień adres logowania i zarządzaj powiadomieniami e-mail.',
  password: 'Ustaw nowe hasło, aby Twoje konto było bezpieczne.',
  notifications: 'Wybierz, jakie powiadomienia chcesz otrzymywać.',
  keeper: 'Sprawdź swój status Opiekuna Plus i dostępne benefity.',
  other: 'Dostosuj pozostałe preferencje związane z kontem.'
}

const sectionOrder = ['profile', 'email', 'password', 'notifications', 'keeper', 'other'] as const

const sectionIcons: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  profile: (props) => <UserCircleIcon {...props} />,
  email: (props) => <EnvelopeIcon {...props} />,
  password: (props) => <LockClosedIcon {...props} />,
  notifications: (props) => <BellAlertIcon {...props} />,
  keeper: (props) => <ShieldCheckIcon {...props} />,
  other: (props) => <Cog6ToothIcon {...props} />
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const user = useUser()

  const displayName = [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
    .filter(Boolean)
    .join(' ') || user?.user_metadata?.name || user?.email || 'Użytkowniku'

  const primaryEmail = user?.email || 'Brak adresu e-mail'

  const [selectedSection, setSelectedSection] = useState<string>('profile')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setEmailUpdateMessage('')
    setEmailError('')

    if (!newEmail || !confirmEmail || !currentPassword) {
      setEmailError('Uzupełnij wszystkie pola.')
      return
    }

    if (newEmail !== confirmEmail) {
      setEmailError('Adresy e-mail nie są takie same.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      if (
        error.message.includes('already been registered') ||
        error.message.includes('Email already in use')
      ) {
        setEmailError('Użytkownik z tym adresem e-mail już istnieje.')
      } else {
        setEmailError(error.message)
      }
    } else {
      setEmailUpdateMessage('E-mail został zaktualizowany. Sprawdź swoją skrzynkę pocztową.')
      setNewEmail('')
      setConfirmEmail('')
      setCurrentPassword('')
      setShowEmailForm(false)
    }

    setIsSubmitting(false)
  }

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setPasswordError('Uzupełnij wszystkie pola.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Hasła nie są takie same.')
      return
    }

    if (newPassword.length < 10 || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('Hasło musi mieć min. 10 znaków, 1 małą literę i 1 cyfrę.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError('Wystąpił błąd podczas zmiany hasła: ' + error.message)
    } else {
      setPasswordMessage('Hasło zostało zmienione.')
      setCurrentPasswordInput('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3]">
      <TopNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-16 space-y-10">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 text-white shadow-[0_30px_60px_-20px_rgba(14,116,144,0.45)]">
          <div className="absolute inset-0 opacity-40" aria-hidden="true">
            <div className="absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-[-4rem] right-[-2rem] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 border border-white/30 backdrop-blur">
                  <LockClosedIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-white/70">Ustawienia konta</p>
                  <h1 className="text-3xl font-semibold sm:text-4xl">Witaj, {displayName}</h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-white/85 sm:text-base">Zadbaj o bezpieczeństwo, aktualność danych oraz preferencje komunikacji. Wszystko w jednym, przejrzystym miejscu.</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/80">
                  <EnvelopeIcon className="h-4 w-4" />{primaryEmail}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/80">
                  <ShieldCheckIcon className="h-4 w-4" />Bezpieczeństwo konta aktywne
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-cyan-600 px-6 py-3 text-sm font-semibold shadow-[0_12px_30px_-15px_rgba(255,255,255,0.9)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Powrót do panelu
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <aside className="rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-[0_20px_50px_-30px_rgba(14,116,144,0.55)] backdrop-blur">
            <nav className="flex flex-col gap-2">
              {sectionOrder.map((section) => {
                const Icon = sectionIcons[section]
                const isActive = selectedSection === section
                return (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${isActive ? 'border-white/40 bg-white/25 text-white' : 'border-slate-200 bg-white text-cyan-500 group-hover:border-cyan-200 group-hover:text-cyan-500'}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {sectionLabels[section]}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.35)] sm:p-8">
            <header className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                {sectionLabels[selectedSection]}
              </h2>
              <p className="text-sm text-slate-500">
                {sectionDescriptions[selectedSection]}
              </p>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </header>

            {selectedSection === 'profile' && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                <h3 className="text-lg font-semibold text-slate-800">Twój profil</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Moduł profilu jest w przygotowaniu. Już wkrótce w tym miejscu zaktualizujesz opis, zdjęcie oraz dane kontaktowe.
                </p>
              </div>
            )}

            {selectedSection === 'email' && (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Adres e-mail</p>
                    <p className="text-base font-semibold text-slate-800">{primaryEmail}</p>
                  </div>
                  {!showEmailForm && (
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600"
                    >
                      Edytuj adres
                    </button>
                  )}
                </div>

                {showEmailForm && (
                  <form onSubmit={handleEmailUpdate} className="space-y-5 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-inner">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Nowy adres e-mail <span className="text-rose-500">*</span>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="np. imie@dlabliskich.pl"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Potwierdź nowy adres <span className="text-rose-500">*</span>
                        <input
                          type="email"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          placeholder="Powtórz adres e-mail"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Aktualne hasło <span className="text-rose-500">*</span>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Wpisz aktualne hasło"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white transition ${
                          isSubmitting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                        }`}
                      >
                        Zapisz nowy adres
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailForm(false)
                          setNewEmail('')
                          setConfirmEmail('')
                          setCurrentPassword('')
                          setEmailError('')
                          setEmailUpdateMessage('')
                        }}
                        className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
                      >
                        Anuluj
                      </button>
                    </div>

                    {emailUpdateMessage && (
                      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {emailUpdateMessage}
                      </p>
                    )}
                    {emailError && (
                      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {emailError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}

            {selectedSection === 'password' && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bezpieczeństwo</p>
                      <p className="text-base font-semibold text-slate-800">Zmień hasło do konta</p>
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600"
                      >
                        Aktualizuj hasło
                      </button>
                    )}
                  </div>
                </div>

                {showPasswordForm && (
                  <form className="space-y-5 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-inner" onSubmit={handlePasswordUpdate}>
                    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Aktualne hasło <span className="text-rose-500">*</span>
                      <input
                        type="password"
                        placeholder="Wpisz aktualne hasło"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Nowe hasło <span className="text-rose-500">*</span>
                      <input
                        type="password"
                        placeholder="Wpisz nowe hasło"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                      />
                      <ul className="mt-2 space-y-1 text-xs text-slate-500">
                        <li>• Min. 10 znaków</li>
                        <li>• Min. 1 mała litera</li>
                        <li>• Min. 1 cyfra</li>
                      </ul>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Potwierdź hasło <span className="text-rose-500">*</span>
                      <input
                        type="password"
                        placeholder="Potwierdź nowe hasło"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
                      >
                        Zapisz nowe hasło
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setCurrentPasswordInput('')
                          setNewPassword('')
                          setConfirmPassword('')
                          setPasswordError('')
                          setPasswordMessage('')
                        }}
                        className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
                      >
                        Anuluj
                      </button>
                    </div>

                    {passwordMessage && (
                      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {passwordMessage}
                      </p>
                    )}
                    {passwordError && (
                      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {passwordError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}

            {selectedSection === 'notifications' && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                <h3 className="text-lg font-semibold text-slate-800">Powiadomienia</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Konfiguracja preferencji powiadomień będzie dostępna wkrótce. Przygotowujemy szczegółowe opcje mailingowe i powiadomienia SMS.
                </p>
              </div>
            )}

            {selectedSection === 'keeper' && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                <h3 className="text-lg font-semibold text-slate-800">Opiekun Plus</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Tutaj wkrótce sprawdzisz status swojego planu, przedłużysz subskrypcję oraz poznasz dodatkowe benefity.
                </p>
              </div>
            )}

            {selectedSection === 'other' && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                <h3 className="text-lg font-semibold text-slate-800">Inne ustawienia</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Pozostałe preferencje będą dostępne w tym miejscu. Daj nam znać, jakie funkcje byłyby dla Ciebie najważniejsze.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="pb-8 text-center text-xs text-slate-400">© 2025 DlaBliskich. Wszelkie prawa zastrzeżone.</footer>
    </div>
  )
}
