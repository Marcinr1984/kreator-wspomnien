'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';

import { LockClosedIcon } from '@heroicons/react/24/solid'

import { supabase } from '../../utils/supabaseClient'

export default function MemorialPage() {
  
  const router = useRouter();
  const user = useUser();

  const sectionLabels: { [key: string]: string } = {
    profile: 'Twój profil',
    email: 'Adres e-mail',
    password: 'Hasło',
    notifications: 'Powiadomienia',
    keeper: 'Keeper Plus',
    other: 'Inne ustawienia',
  };

  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState('podglad')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState('ustawienia');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalDefaultTab('ustawienia');
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailUpdateMessage('');
    setEmailError('');

    if (!newEmail || !confirmEmail || !currentPassword) {
      setEmailError('Uzupełnij wszystkie pola.');
      return;
    }

    if (newEmail !== confirmEmail) {
      setEmailError('Adresy e-mail nie są takie same.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      if (
        error.message.includes('already been registered') ||
        error.message.includes('Email already in use')
      ) {
        setEmailError('Użytkownik z tym adresem e-mail już istnieje.');
      } else {
        setEmailError(error.message);
      }
    } else {
      setEmailUpdateMessage('E-mail został zaktualizowany. Sprawdź swoją skrzynkę pocztową.');
      setNewEmail('');
      setConfirmEmail('');
      setCurrentPassword('');
    }

    setIsSubmitting(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setPasswordError('Uzupełnij wszystkie pola.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Hasła nie są takie same.');
      return;
    }

    if (newPassword.length < 10 || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('Hasło musi mieć min. 10 znaków, 1 małą literę i 1 cyfrę.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError('Wystąpił błąd podczas zmiany hasła: ' + error.message);
    } else {
      setPasswordMessage('Hasło zostało zmienione.');
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    }
  };

  return (
    <div className="bg-[#f8fbfa] min-h-screen w-full">
      <div className="w-full">
        {/* Sekcja górna z banerem */}
        <div className="group relative w-full h-80 md:h-[22rem] lg:h-[26rem] xl:h-[28rem] overflow-hidden">
          <img
            src="/edycja_profil/profil.jpg"
            className="w-full h-full object-cover select-none z-0"
            alt="Baner"
          />
          <div className="absolute top-[19.5rem] left-1/2 -translate-x-[36rem] z-30 flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center px-6 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-800 hover:border-cyan-500 hover:bg-gray-50 transition-all duration-300"
            >
              <svg className="h-4 w-4 text-cyan-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
              Powrót do panelu
            </button>
          </div>
        </div>

        {/* Sekcja z kartą */}
        <div className="bg-white -mt-20 max-w-6xl mx-auto rounded-lg shadow-md p-6 relative z-10">
          <div className="flex flex-col md:flex-row w-full">
            {/* Lewa kolumna z przyciskami */}
            <div className="w-full md:w-1/3 px-4 py-6">
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setSelectedSection('profile')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'profile' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Twój profil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedSection('email')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'email' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Adres e-mail
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedSection('password')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'password' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Hasło
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedSection('notifications')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'notifications' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Powiadomienia
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedSection('keeper')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'keeper' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Keeper Plus
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedSection('other')}
                    className={`block w-full text-left px-4 py-4 transition rounded-xl ${
                      selectedSection === 'other' ? 'bg-gray-100 text-cyan-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Inne ustawienia
                  </button>
                </li>
              </ul>
            </div>

            {/* Prawa kolumna z dynamiczną zawartością */}
            <div className="w-full md:w-3/4 p-6 md:ml-16">
              <h2 className="text-2xl font-bold text-cyan-500 mb-2">
                {selectedSection ? sectionLabels[selectedSection] : 'Ustawienia profilu'}
              </h2>
              <hr className="border-t border-gray-200 mt-8 mb-10" />
              {/* Tutaj będzie zmieniana zawartość */}
              {selectedSection === 'profile' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Twój profil</h3>
                  <p className="text-gray-600">Tutaj możesz zobaczyć i edytować swój profil.</p>
                </div>
              )}
              {selectedSection === 'email' && (
                <div>
                  <div className="border rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                      <div>
                        <p className="text-sm text-gray-500">Adres e-mail</p>
                        <p className="text-base font-medium text-gray-900">{user?.email || 'Brak adresu e-mail'}</p>
                      </div>
                      {!showEmailForm && (
                        <button
                          onClick={() => setShowEmailForm(true)}
                          className="flex items-center border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 hover:border-cyan-500 transition"
                        >
                          <svg className="h-4 w-4 text-cyan-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          Edytuj
                        </button>
                      )}
                    </div>

                    {showEmailForm && (
                      <form onSubmit={handleEmailUpdate} className="mt-8 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Nowy adres e-mail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Wpisz nowy adres e-mail"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Potwierdź nowy adres e-mail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder="Potwierdź nowy adres e-mail"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Aktualne hasło <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Wpisz aktualne hasło"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-md transition ${
                              isSubmitting
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-cyan-500 text-white hover:bg-cyan-600'
                            }`}
                          >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEmailForm(false)}
                            className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-100"
                          >
                            Anuluj
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                  {emailUpdateMessage && (
                    <p className="text-sm text-green-600 mt-4">{emailUpdateMessage}</p>
                  )}
                </div>
              )}
              {selectedSection === 'password' && (
                <div>
                  <div className="border rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                      <div>
                        <p className="text-sm text-gray-500">Hasło</p>
                        <p className="text-base font-medium text-black">••••••••••••••••</p>
                      </div>
                      {!showPasswordForm && (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="flex items-center border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 hover:border-cyan-500 transition"
                        >
                          <svg className="h-4 w-4 text-cyan-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          Edytuj
                        </button>
                      )}
                    </div>
                    {showPasswordForm && (
                      <form className="mt-8 space-y-4" onSubmit={handlePasswordUpdate}>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Aktualne hasło <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Wpisz aktualne hasło"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Nowe hasło <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Wpisz nowe hasło"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                          <ul className="text-sm text-gray-500 mt-2 list-disc list-inside">
                            <li>Min. 10 znaków</li>
                            <li>Min. 1 mała litera</li>
                            <li>Min. 1 cyfra</li>
                          </ul>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Potwierdź hasło <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Potwierdź nowe hasło"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                          <button
                            type="submit"
                            className="px-6 py-3 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 transition"
                          >
                            Zapisz zmiany
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPasswordForm(false)}
                            className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-100"
                          >
                            Anuluj
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
                    )}
                    {passwordMessage && (
                      <p className="text-sm text-green-600 mt-4">{passwordMessage}</p>
                    )}
                    {passwordError && (
                      <p className="text-sm text-red-600 mt-4">{passwordError}</p>
                    )}
              {selectedSection === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Powiadomienia</h3>
                  <p className="text-gray-600">Tutaj możesz zarządzać swoimi powiadomieniami.</p>
                </div>
              )}
              {selectedSection === 'keeper' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Keeper Plus</h3>
                  <p className="text-gray-600">Informacje o planie Keeper Plus.</p>
                </div>
              )}
              {selectedSection === 'other' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Inne ustawienia</h3>
                  <p className="text-gray-600">Tutaj możesz edytować inne ustawienia profilu.</p>
                </div>
              )}
              {!selectedSection && (
                <div className="text-gray-600">
                  Wybierz kategorię po lewej stronie, aby zobaczyć jej ustawienia.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stopka */}
        <footer className="text-center text-xs text-gray-400 mt-12 mb-6">
          © 2025 DlaBliskich. Wszelkie prawa zastrzeżone.
        </footer>
          
      </div>
    </div>
  )
}