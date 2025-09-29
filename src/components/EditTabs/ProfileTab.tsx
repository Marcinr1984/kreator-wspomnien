'use client';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import ImageCropper from '../ImageCropper';

interface ProfileTabProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  middleName: string;
  setMiddleName: (value: string) => void;
  suffix: string;
  setSuffix: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  pronoun: string;
  setPronoun: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  deathDate: string;
  setDeathDate: (value: string) => void;
  isDeceased: boolean;
  setIsDeceased: (value: boolean) => void;
  relation: string;
  setRelation: (value: string) => void;
  relationDescription: string;
  setRelationDescription: (value: string) => void;
  photoUrl: string;
  setPhotoUrl: (value: string) => void;
  handleUploadClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  memorialId: number;
  supabase: any;
}

const pronounOptions = ['on', 'ona', 'oni']
const relationOptions = ['Rodzic', 'Dziecko', 'Małżonek/partner', 'Przyjaciel', 'Inne']

const ProfileTab: React.FC<ProfileTabProps> = ({
  firstName, setFirstName,
  lastName, setLastName,
  middleName, setMiddleName,
  suffix, setSuffix,
  nickname, setNickname,
  pronoun, setPronoun,
  birthDate, setBirthDate,
  deathDate, setDeathDate,
  isDeceased, setIsDeceased,
  relation, setRelation,
  relationDescription, setRelationDescription,
  photoUrl, setPhotoUrl,
  handleUploadClick, handleFileChange,
  fileInputRef,
  memorialId,
  supabase
}) => {
  // Expose supabase client globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // expose supabase client globally for console debugging
      (window as any).supabase = supabase;
      console.log('⚙️ Supabase client attached to window.supabase');
    }
  }, [supabase]);

  // Debug: list current files in memorial-photos bucket for this memorialId
  useEffect(() => {
    const listFiles = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('memorial-photos')
          .list(`${memorialId}`, { limit: 100 });
        console.log('🗂️ Current bucket files (debug):', data, 'Error:', error);
      } catch (e) {
        console.error('Error listing bucket files (debug):', e);
      }
    };
    listFiles();
  }, [supabase, memorialId]);
  const cropperRef = useRef<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [editablePhotoUrl, setEditablePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndConvert = async () => {
      try {
        const res = await fetch(photoUrl, { mode: 'cors' });
        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        setEditablePhotoUrl(localUrl);
      } catch (e) {
        console.error("Nie udało się pobrać zdjęcia:", e);
      }
    };

    if (photoUrl && !photoUrl.startsWith('blob:')) {
      fetchAndConvert();
    } else {
      setEditablePhotoUrl(photoUrl);
    }
  }, [photoUrl]);
  return (
    <div className="flex w-full flex-col gap-8 md:flex-row">
                        {/* Lewa kolumna – formularz */}
                        <div className="w-full md:w-1/2">
                        <h3 className="text-lg font-semibold mb-4">Dla kogo jest ta pamiątka?</h3>
                    <div className="rounded-[24px] border border-slate-100 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
    
    <div className="grid grid-cols-2 gap-4">
                            {/* Imię */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Imię <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                placeholder="Wprowadź imię"
                              />
                            </div>
                            {/* Nazwisko */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Nazwisko <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                placeholder="Wprowadź nazwisko"
                              />
                            </div>
                            {/* Drugie imię */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Drugie imię</label>
                              <input
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                placeholder="Wprowadź drugie imię"
                              />
                            </div>
                            {/* Tytuł (np. Jr, M.D.) */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Tytuł (np. Jr, M.D.)</label>
                              <input
                                type="text"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                placeholder="Wprowadź tytuł"
                              />
                            </div>
                            {/* Pseudonim */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Pseudonim</label>
                              <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                placeholder="Wprowadź pseudonim"
                              />
                            </div>
                            {/* Zaimek */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">
                                Zaimek <span className="text-red-500">*</span>
                              </label>
                              <Listbox value={pronoun} onChange={setPronoun}>
                                <div className="relative mt-1">
                                  <Listbox.Button className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
                                    <span>{pronoun || 'Wybierz'}</span>
                                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                                  </Listbox.Button>
                                  <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <Listbox.Options className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
                                      <Listbox.Option
                                        value=""
                                        className={({ active }) => `cursor-pointer px-4 py-2 transition ${active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400'}`}
                                      >
                                        Wybierz
                                      </Listbox.Option>
                                      {pronounOptions.map((option) => (
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
                            </div>
                            {/* Data urodzenia */}
                            <div>
                            <label className="block text-sm font-medium text-slate-600">Data urodzenia <span className="text-red-500">*</span></label>
                              <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                              />
                            </div>
                            {/* Data śmierci */}
                            <div>
                            <label className="block text-sm font-medium text-slate-600">Data śmierci {isDeceased && <span className="text-red-500">*</span>}</label>
                              <input
                                type="date"
                                value={deathDate}
                                onChange={(e) => setDeathDate(e.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                              />
                            </div>
                            {/* Czy osoba zmarła */}
                            <div className="col-span-2 flex items-center mt-2">
                              <input
                                type="checkbox"
                                checked={isDeceased}
                                onChange={(e) => setIsDeceased(e.target.checked)}
                                className="h-4 w-4 text-cyan-600 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm font-medium text-slate-600">Osoba zmarła?</label>
                            </div>
                            {/* Wybierz relację */}
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Wybierz relację <span className="text-red-500">*</span></label>
                              <Listbox value={relation} onChange={setRelation}>
                                <div className="relative mt-1">
                                  <Listbox.Button className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
                                    <span>{relation || 'Wybierz'}</span>
                                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                                  </Listbox.Button>
                                  <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <Listbox.Options className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
                                      <Listbox.Option
                                        value=""
                                        className={({ active }) => `cursor-pointer px-4 py-2 transition ${active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400'}`}
                                      >
                                        Wybierz
                                      </Listbox.Option>
                                      {relationOptions.map((option) => (
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
                            </div>
                            {/* Opisz relację */}
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-slate-600">Opisz relację</label>
                              <textarea
                                value={relationDescription}
                                onChange={(e) => setRelationDescription(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                                rows={3}
                                placeholder="Krótki opis relacji..."
                              />
                            </div>
                            </div>
                          </div>
                        </div>
                        {/* Prawa kolumna – podgląd zdjęcia */}
                        
                        <div className="w-full md:w-1/2 space-y-6">
                        <div className="flex flex-col items-center rounded-[24px] border border-slate-100 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]">
                            {/* Nagłówek i przycisk 'Usuń' */}
                            {/* Nagłówek i przycisk 'Usuń' na jednej linii o stałej szerokości */}
                            <div className="mb-4 flex w-full max-w-sm items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Aktualne zdjęcie</h3>
                            <button
                                onClick={async () => {
                                  try {
                                    if (photoUrl) {
                                      const bucketName = 'memorial-photos';
                                      const url = new URL(photoUrl);
                                      const match = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
                                      const fullPath = match ? decodeURIComponent(match[1]) : '';
                                      const pathInBucket = fullPath;
                                      console.log('Final pathInBucket:', pathInBucket);

                                      // Usuwanie pliku przez backendowy endpoint
                                      const deleteRes = await fetch('/api/delete-image', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ path: pathInBucket })
                                      });

                                      let deleteResult = null;
                                      try {
                                        deleteResult = await deleteRes.json();
                                      } catch (err) {
                                        console.warn("Odpowiedź nie była w formacie JSON lub pusta:", err);
                                        deleteResult = { status: deleteRes.status, statusText: deleteRes.statusText };
                                      }
                                      console.log('🧹 Delete API response:', deleteResult);

                                      // Dodatkowo: wylistuj folder memorial-photos
                                      const { data: currentFiles, error: listError } = await supabase
                                        .storage
                                        .from(bucketName)
                                        .list('memorial-photos');
                                      console.log('📦 Lista plików w memorial-photos:', currentFiles, '❗ Error:', listError);

                                      // Update photo_url in the database with explicit returning
                                      const { data: updatedPage, error: updateError, status, statusText } = await supabase
                                        .from('memorial_pages')
                                        .update({ photo_url: null }, { returning: 'representation' })
                                        .eq('id', memorialId)
                                        .select('id, photo_url')
                                        .single();

                                      console.log('Supabase update status:', status, statusText);
                                      console.log('Supabase update response:', { updatedPage, updateError });

                                      if (updateError) {
                                        console.error('Błąd aktualizacji photo_url w bazie:', updateError);
                                      } else if (!updatedPage) {
                                        console.warn(`Brak zwróconego rekordu po update. Sprawdź RLS i uprawnienia.`);
                                      } else {
                                        console.log("Photo_url po update:", updatedPage.photo_url);
                                        setPhotoUrl('');
                                      }
                                    }
                                  } catch (err) {
                                    console.error('Błąd przy usuwaniu zdjęcia:', err);
                                  }
                                  // Jeśli updateError pojawia się stale bez widocznych błędów, sprawdź reguły RLS w Supabase Studio dla tabeli memorial_pages.
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                            >
                                <svg
                                className="h-4 w-4 text-rose-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                                />
                                </svg>
                                Usuń
                            </button>
                            </div>

                            {/* Podgląd zdjęcia - zwiększony */}
                            <div className="relative flex h-80 w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border-4 border-white/70 bg-slate-50 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]">
                              {isCropping && photoUrl ? (
                                <ImageCropper
                                  ref={cropperRef}
                                  imageUrl={editablePhotoUrl || ''}
                                  onCropComplete={(blob) => {
                                    const newUrl = URL.createObjectURL(blob);
                                    setPhotoUrl(newUrl);
                                    setIsCropping(false);
                                  }}
                                />
                              ) : (photoUrl && photoUrl !== '') ? (
                                <img src={photoUrl} alt="Zdjęcie" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-20 h-20 text-slate-300 mb-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
                                      1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18
                                      3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0
                                      0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0
                                      1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375
                                      0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                  </svg>
                                  Brak zdjęcia
                                </div>
                              )}
                            </div>

                            
                            {/* Przyciski akcji */}
    {isCropping ? (
  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={handleUploadClick}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-[#0594B0]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Prześlij nowe zdjęcie
    </button>
    <button
      onClick={async () => {
        if (cropperRef.current?.getCroppedImage) {
          try {
            const blob = await cropperRef.current.getCroppedImage();
            if (blob) {
              // 🧹 Usuń stare zdjęcie ze storage jeśli istnieje (przed utworzeniem nowego pliku)
              if (photoUrl) {
                const bucketName = 'memorial-photos';
                const url = new URL(photoUrl);
                const match = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
                const fullPath = match ? decodeURIComponent(match[1]) : '';
                if (fullPath) {
                  const { data: deleted, error: deleteError } = await supabase.storage.from(bucketName).remove([fullPath]);
                  console.log('🧹 Usunięto stare zdjęcie (na zapis):', deleted, '❌', deleteError);
                }
              }
              // Ustal nazwę pliku na podstawie obecnego photoUrl (jeśli istnieje), w przeciwnym razie domyślna
              const filename = photoUrl
                ? decodeURIComponent(new URL(photoUrl).pathname.split('/').pop() || '')
                : `profile-photo-${memorialId}.jpeg`;
              const file = new File([blob], filename, { type: 'image/jpeg' });
              const dt = new DataTransfer();
              dt.items.add(file);
              if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
                handleFileChange({ target: fileInputRef.current } as any);
              }
            }
          } catch (e) {
            console.error('Błąd przycinania zdjęcia:', e);
          }
        }
        setIsCropping(false);
      }}
      className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50"
    >
      Zapisz
    </button>
    <button
      onClick={() => setIsCropping(false)}
      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
    >
      Anuluj
    </button>
  </div>
  ) : (
  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={() => setIsCropping(true)}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-[#0594B0]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.232 5.232l3.536 3.536M2.5 21.5l4.621-1.157a2 2 0 00.947-.547l12.487-12.487a2 2 0 000-2.828l-3.536-3.536a2 2 0 00-2.828 0L1.535 13.432a2 2 0 00-.547.947L-.17 19.379a.5.5 0 00.61.61l2.06-.515z"
        />
      </svg>
      Edytuj
    </button>

    <button
      onClick={handleUploadClick}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-[#0594B0]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Prześlij nowe zdjęcie
    </button>

    <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-[#0594B0]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11l2 2 4-4" />
      </svg>
      Wybierz z pamiątek
    </button>
  </div>
)}
<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  hidden
  onChange={handleFileChange}
/>

                            {/* Informacja o bibliotece obrazów */}
                            <p className="mt-4 text-sm text-slate-600 text-center">
                            Nie masz teraz dostępu do zdjęcia?
                            <br />
                            Skorzystaj z naszej{' '}
                            <a href="#" className="text-cyan-600 hover:underline">
                                biblioteki obrazów
                            </a>.
                            </p>
                        </div>
                        </div>
                      </div>
                    
                
  );
};

export default ProfileTab;