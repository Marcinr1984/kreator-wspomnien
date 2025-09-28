'use client'

import { Dialog, Listbox, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import slugify from 'slugify'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  IdentificationIcon,
  PhotoIcon,
  UserPlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid'

interface StepFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function StepFormModal({ isOpen, onClose, onSave }: StepFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    }
    getUser()
  }, [])

  const steps = [
    { id: 1, label: 'Nazwa', icon: UserPlusIcon },
    { id: 2, label: 'Daty', icon: CalendarDaysIcon },
    { id: 3, label: 'Relacja', icon: IdentificationIcon },
    { id: 4, label: 'Zdjęcie', icon: PhotoIcon }
  ] as const
  const [step1Data, setStep1Data] = useState({
    firstName: '',
    lastName: '',
    pronoun: '',
  });
  const [step1Errors, setStep1Errors] = useState<{ [key: string]: string }>({});
  const [step2Data, setStep2Data] = useState({
    birthDate: '',
    deathDate: '',
    isDeceased: false,
  });
  const [step2Errors, setStep2Errors] = useState<{ [key: string]: string }>({});
  const [step3Data, setStep3Data] = useState({
    relation: '',
    relationDescription: '',
  });
  const [step3Errors, setStep3Errors] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};
    if (!step1Data.firstName.trim()) errors.firstName = 'Pole wymagane';
    if (!step1Data.lastName.trim()) errors.lastName = 'Pole wymagane';
    if (!step1Data.pronoun) errors.pronoun = 'Pole wymagane';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};
    if (!step2Data.birthDate.trim()) errors.birthDate = 'Pole wymagane';
    if (step2Data.isDeceased && !step2Data.deathDate.trim()) errors.deathDate = 'Pole wymagane';
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: { [key: string]: string } = {};
    if (!step3Data.relation) errors.relation = 'Pole wymagane';
    if (!step3Data.relationDescription.trim()) errors.relationDescription = 'Pole wymagane';
    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(currentStep + 1);
    }
  };
  
  const handleSave = async () => {
    if (isSubmitting || isSaved) return;
    setIsSubmitting(true);
    setIsSaved(true);

    if (!user?.id) {
      alert("Nie jesteś zalogowany. Nie można zapisać strony pamięci.");
      setIsSaved(false);
      setIsSubmitting(false);
      return;
    }
    let photoUrl: string | null = null;
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('memorial-photos')
        .upload(fileName, photoFile);

      if (storageError) {
        alert("Błąd przy przesyłaniu zdjęcia: " + storageError.message);
        setIsSaved(false);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('memorial-photos')
        .getPublicUrl(fileName);

      photoUrl = publicUrlData?.publicUrl || null;
    }

    // 1. Wstawiamy rekord memorial_pages bez slug
    const displayName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || user.id;
    const baseQRSlug = slugify(displayName, { lower: true, strict: true }) || `qr-${user.id}`;
    const generatedQRSlug = baseQRSlug;

    const allData = {
      user_id: user?.id,
      first_name: step1Data.firstName,
      last_name: step1Data.lastName,
      pronoun: step1Data.pronoun,
      birth_date: step2Data.birthDate || null,
      death_date: step2Data.isDeceased ? step2Data.deathDate || null : null,
      is_deceased: step2Data.isDeceased,
      relation: step3Data.relation,
      relation_description: step3Data.relationDescription,
      created_at: new Date().toISOString(),
      photo_url: photoUrl,
      qr_slug: generatedQRSlug,
      // slug dodamy po wygenerowaniu
    };

    console.log("Wysyłane dane:", allData);

    const { data, error } = await supabase
      .from('memorial_pages')
      .insert([allData])
      .select();

    if (error) {
      console.error('Błąd przy zapisie strony pamięci:', error);
      alert("Błąd przy zapisie: " + error.message);
      setIsSaved(false);
      setIsSubmitting(false);
      return;
    }

    // 2. Pobierz id, wygeneruj slug i zaktualizuj rekord
    const newMemorialId = data?.[0]?.id;
    const rawSlug = `${step1Data.firstName} ${step1Data.lastName} ${newMemorialId}`;
    const generatedSlug = slugify(rawSlug, { lower: true, strict: true });

    if (newMemorialId && generatedSlug) {
      await supabase
        .from('memorial_pages')
        .update({ slug: generatedSlug })
        .eq('id', newMemorialId);
    }

    // 3. Dodaj keepera
    if (newMemorialId) {
      const { error: keeperError } = await supabase
        .from('memorial_keepers')
        .insert([
          {
            user_id: user.id,
            memorial_id: newMemorialId,
            role: 'wlasciciel',
            added_by: user.id,
          }
        ]);

      if (keeperError) {
        console.error('Błąd przy zapisie keepera:', keeperError);
        alert('Błąd przy przypisaniu roli do użytkownika: ' + keeperError.message);
        setIsSaved(false);
        setIsSubmitting(false);
        return;
      }
    }

    console.log("Zamykam modal...");
    onClose();
    console.log("Przekierowuję do:", `/memorial/${newMemorialId}`);
    setTimeout(() => {
      window.location.href = `/memorial/${newMemorialId}`;
    }, 300);
    setIsSubmitting(false);
    setIsSaved(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0b1426]/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:px-6">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-6 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 translate-y-6 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                          <UserPlusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Tworzenie strony pamięci</Dialog.Title>
                          <p className="mt-1 max-w-md text-sm text-white/85">
                            Wypełnij kilka krótkich kroków, aby założyć miejsce pamięci bliskiej osoby i zaprosić rodzinę do współtworzenia wspomnień.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                      >
                        Zamknij
                      </button>
                    </div>

                    <nav className="grid gap-3 sm:grid-cols-4">
                      {steps.map((step) => {
                        const Icon = step.icon
                        const isActive = currentStep === step.id
                        const isCompleted = currentStep > step.id
                        return (
                          <div
                            key={step.id}
                            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                              isCompleted
                                ? 'border-white/30 bg-white/25 text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.7)]'
                                : isActive
                                ? 'border-white/30 bg-white/20 text-white'
                                : 'border-white/10 bg-white/10 text-white/70'
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                                isCompleted
                                  ? 'border-white bg-white/10 text-white'
                                  : isActive
                                  ? 'border-white/60 bg-white/15 text-white'
                                  : 'border-white/20 bg-white/10 text-white/70'
                              }`}
                            >
                              {isCompleted ? <CheckIcon className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Krok {step.id}</span>
                              <span className="text-sm font-semibold leading-tight">{step.label}</span>
                            </div>
                          </div>
                        )
                      })}
                    </nav>
                  </div>
                </div>

                <div className="space-y-8 bg-white px-6 py-6 sm:px-8 sm:py-8">
                  {currentStep === 1 && (
                    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                      <header className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Dla kogo jest ta strona pamięci?</h2>
                        <p className="text-sm text-slate-500">Te dane pomogą nam przygotować stronę i ułatwią znalezienie jej bliskim.</p>
                      </header>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Imię <span className="text-rose-500">*</span></span>
                          <input
                            type="text"
                            value={step1Data.firstName}
                            onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                            placeholder="Wpisz imię"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          {step1Errors.firstName && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step1Errors.firstName}</span>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Drugie imię
                          <input
                            type="text"
                            placeholder="Opcjonalnie"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Nazwisko <span className="text-rose-500">*</span></span>
                          <input
                            type="text"
                            value={step1Data.lastName}
                            onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                            placeholder="Wpisz nazwisko"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          {step1Errors.lastName && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step1Errors.lastName}</span>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Tytuł
                          <input
                            type="text"
                            placeholder="Np. dr, prof., ks."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500 sm:col-span-2">
                          Pseudonim
                          <input
                            type="text"
                            placeholder="Znany przydomek lub czułe określenie"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">Wyświetlane przy wspomnieniach i dedykacjach.</span>
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Zaimek <span className="text-rose-500">*</span></span>
                          <Listbox value={step1Data.pronoun} onChange={(value) => setStep1Data({ ...step1Data, pronoun: value })}>
                            <div className="relative">
                              <Listbox.Button className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
                                <span>{step1Data.pronoun || 'Wybierz zaimek'}</span>
                                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
                                  {['on', 'ona', 'oni'].map((option) => (
                                    <Listbox.Option
                                      key={option}
                                      value={option}
                                      className={({ active }) =>
                                        `cursor-pointer px-4 py-2 transition ${
                                          active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-700'
                                        }`
                                      }
                                    >
                                      {option}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                          {step1Errors.pronoun && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step1Errors.pronoun}</span>
                          )}
                          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">Tylko na potrzeby powiadomień.</span>
                        </label>
                      </div>
                    </form>
                  )}

                  {currentStep === 2 && (
                    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                      <header className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Daty i status</h2>
                        <p className="text-sm text-slate-500">Podpowiemy, jak przygotować historię życia i odpowiednio wyświetlimy informacje na stronie.</p>
                      </header>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Data urodzenia <span className="text-rose-500">*</span></span>
                          <input
                            type="date"
                            value={step2Data.birthDate}
                            onChange={(e) => setStep2Data({ ...step2Data, birthDate: e.target.value })}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          {step2Errors.birthDate && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step2Errors.birthDate}</span>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Data śmierci {step2Data.isDeceased && <span className="text-rose-500">*</span>}</span>
                          <input
                            type="date"
                            value={step2Data.deathDate}
                            onChange={(e) => setStep2Data({ ...step2Data, deathDate: e.target.value })}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          {step2Errors.deathDate && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step2Errors.deathDate}</span>
                          )}
                        </label>
                      </div>

                      <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 shadow-inner">
                        <input
                          type="checkbox"
                          checked={step2Data.isDeceased}
                          onChange={(e) => setStep2Data({ ...step2Data, isDeceased: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Osoba zmarła</span>
                      </label>
                    </form>
                  )}

                  {currentStep === 3 && (
                    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                      <header className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Twoja relacja</h2>
                        <p className="text-sm text-slate-500">Dzięki temu dopasujemy powiadomienia i rolę, którą otrzymasz na stronie pamięci.</p>
                      </header>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Wybierz relację <span className="text-rose-500">*</span></span>
                          <Listbox value={step3Data.relation} onChange={(value) => setStep3Data({ ...step3Data, relation: value })}>
                            <div className="relative">
                              <Listbox.Button className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
                                <span>{step3Data.relation || 'Wybierz...'}</span>
                                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
                                  {['Rodzic', 'Dziecko', 'Małżonek/partner', 'Przyjaciel', 'Inne'].map((option) => (
                                    <Listbox.Option
                                      key={option}
                                      value={option}
                                      className={({ active }) =>
                                        `cursor-pointer px-4 py-2 transition ${
                                          active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-700'
                                        }`
                                      }
                                    >
                                      {option}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                          {step3Errors.relation && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step3Errors.relation}</span>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          <span className="flex items-center gap-1">Opisz relację <span className="text-rose-500">*</span></span>
                          <input
                            type="text"
                            value={step3Data.relationDescription}
                            onChange={(e) => setStep3Data({ ...step3Data, relationDescription: e.target.value })}
                            placeholder="Krótki opis relacji"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                          />
                          {step3Errors.relationDescription && (
                            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{step3Errors.relationDescription}</span>
                          )}
                        </label>
                      </div>
                    </form>
                  )}

                  {currentStep === 4 && (
                    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                      <header className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Zdjęcie pamięci</h2>
                        <p className="text-sm text-slate-500">Dodaj zdjęcie, które najlepiej oddaje charakter osoby. Możesz je zmienić w dowolnym momencie.</p>
                      </header>
                      <label className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center text-slate-500">
                        <PhotoIcon className="h-12 w-12 text-cyan-500" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-700">Kliknij lub przeciągnij plik</p>
                          <p className="text-xs text-slate-500">Obsługujemy PNG i JPG do 5 MB.</p>
                        </div>
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPhotoFile(e.target.files[0])
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm">Wybierz plik</span>
                        {photoFile && (
                          <p className="text-xs text-slate-500">Wybrano: {photoFile.name}</p>
                        )}
                      </label>
                    </form>
                  )}
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 bg-white/95 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Krok {currentStep} z 4</div>
                  <div className="flex w-full gap-3 sm:w-auto">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-initial"
                      >
                        Wstecz
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 sm:flex-initial"
                      >
                        Następny krok <ArrowRightIcon className="ml-2 hidden h-4 w-4 sm:inline" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-initial"
                      >
                        {isSubmitting ? 'Zapisywanie…' : 'Zapisz stronę'}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
