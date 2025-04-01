'use client'

import { Dialog, Transition } from '@headlessui/react'
import { useSession } from '@supabase/auth-helpers-react'
import { Fragment, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient';

interface StepFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function StepFormModal({ isOpen, onClose, onSave }: StepFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };
    getUser();
  }, []);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (isSaved) return;
    setIsSaved(true);
    if (!user?.id) {
    alert("Nie jesteś zalogowany. Nie można zapisać strony pamięci.");
    return;
  }
  let photoUrl = '';
  if (photoFile) {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('memorial-photos')
      .upload(fileName, photoFile);

    if (storageError) {
      alert("Błąd przy przesyłaniu zdjęcia: " + storageError.message);
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('memorial-photos')
      .getPublicUrl(fileName);

    photoUrl = publicUrlData?.publicUrl || '';
  }

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
    } else {
      console.log('Strona pamięci zapisana:', data);
      console.log("ID nowo utworzonej strony:", data?.[0]?.id);
      console.log("Zamykam modal...");
      onClose();
      console.log("Przekierowuję do:", `/memorial/${data?.[0]?.id}`);
      setTimeout(() => {
        window.location.href = `/memorial/${data?.[0]?.id}`;
      }, 300);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-[850px] h-[650px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">

                <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                      +
                    </div>
                    <span className="text-white font-medium">Tworzenie strony pamięci</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-black bg-white rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-200"
                  >
                    Zamknij
                  </button>
                </div>

                <div className="w-full border-b border-gray-200 bg-white py-4">
                  <nav className="flex justify-around items-center px-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex flex-col items-center text-xs font-medium text-gray-500">
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                            currentStep > step
                              ? 'bg-cyan-600 border-cyan-600 text-white'
                              : currentStep === step
                              ? 'border-cyan-600 text-cyan-600'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {currentStep > step ? '✓' : step}
                        </div>
                        <span className="mt-1">
                          {step === 1 && 'Nazwa'}
                          {step === 2 && 'Daty'}
                          {step === 3 && 'Relacja'}
                          {step === 4 && 'Zdjęcie'}
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>

                {currentStep === 1 && (
                  <form className="flex-1 px-6 py-4 space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Dla kogo jest ta strona pamięci?</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Imię <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={step1Data.firstName}
                          onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                          placeholder="Wpisz imię"
                        />
                        {step1Errors.firstName && <p className="text-sm text-red-500">{step1Errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Drugie imię</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                          placeholder="Wpisz drugie imię"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nazwisko <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={step1Data.lastName}
                          onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                          placeholder="Wpisz nazwisko"
                        />
                        {step1Errors.lastName && <p className="text-sm text-red-500">{step1Errors.lastName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tytuł (np. Jr, M.D.)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                          placeholder="Wpisz tytuł"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pseudonim</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                          placeholder="Wpisz pseudonim"
                        />
                        <p className="mt-1 text-xs text-gray-500">Używane do wspominania bliskiej osoby podczas uroczystości żałobnych</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Zaimek <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={step1Data.pronoun}
                          onChange={(e) => setStep1Data({ ...step1Data, pronoun: e.target.value })}
                          className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                        >
                          <option value="">Wybierz zaimek</option>
                          <option>on</option>
                          <option>ona</option>
                          <option>oni</option>
                        </select>
                        {step1Errors.pronoun && <p className="text-sm text-red-500">{step1Errors.pronoun}</p>}
                        <p className="mt-1 text-xs text-gray-500">Nie wyświetlane – używane tylko dla Twoich powiadomień.</p>
                      </div>
                    </div>
                  </form>
                )}
                {currentStep === 2 && (
                  <form className="flex-1 px-6 py-4 space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Data urodzenia i śmierci</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Data urodzenia <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={step2Data.birthDate}
                            onChange={(e) => setStep2Data({ ...step2Data, birthDate: e.target.value })}
                            className="mt-1 block w-full px-2 rounded-md border border-gray-300 h-12"
                          />
                          {step2Errors.birthDate && <p className="text-sm text-red-500">{step2Errors.birthDate}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Data śmierci {step2Data.isDeceased && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="date"
                            value={step2Data.deathDate}
                            onChange={(e) => setStep2Data({ ...step2Data, deathDate: e.target.value })}
                            className="mt-1 block w-full px-2 rounded-md border border-gray-300 h-12"
                          />
                          {step2Errors.deathDate && <p className="text-sm text-red-500">{step2Errors.deathDate}</p>}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <input
                          type="checkbox"
                          id="passed"
                          checked={step2Data.isDeceased}
                          onChange={(e) => setStep2Data({ ...step2Data, isDeceased: e.target.checked })}
                          className="h-4 w-4 text-cyan-600 border-gray-300 rounded"
                        />
                        <label htmlFor="passed" className="ml-2 block text-sm text-gray-700">
                          Osoba zmarła
                        </label>
                      </div>
                    </div>
                  </form>
                )}
                {currentStep === 3 && (
                  <form className="flex-1 px-6 py-4 space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Twoja relacja z osobą</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Wybierz relację <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={step3Data.relation}
                            onChange={(e) => setStep3Data({ ...step3Data, relation: e.target.value })}
                            className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base h-12"
                          >
                            <option value="">Wybierz...</option>
                            <option>Rodzic</option>
                            <option>Dziecko</option>
                            <option>Małżonek/partner</option>
                            <option>Przyjaciel</option>
                            <option>Inne</option>
                          </select>
                          {step3Errors.relation && <p className="text-sm text-red-500">{step3Errors.relation}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Opisz relację <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={step3Data.relationDescription}
                            onChange={(e) => setStep3Data({ ...step3Data, relationDescription: e.target.value })}
                            className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base h-12"
                            placeholder="Wpisz krótki opis relacji"
                          />
                          {step3Errors.relationDescription && <p className="text-sm text-red-500">{step3Errors.relationDescription}</p>}
                        </div>
                      </div>
                    </div>
                  </form>
                )}
                {currentStep === 4 && (
                  <form className="flex-1 px-6 py-4 space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Dodaj zdjęcie</h2>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-10">
                      <svg className="w-12 h-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 12h4m-2-2v4m-8-6a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      <p className="text-sm text-gray-600 mb-1">Kliknij lub przeciągnij plik, aby przesłać</p>
                      <p className="text-xs text-gray-400">PNG, JPG do 5MB</p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPhotoFile(e.target.files[0]);
                          }
                        }}
                        className="mt-4"
                      />
                      {photoFile && (
                        <p className="mt-2 text-sm text-gray-600">Wybrane zdjęcie: {photoFile.name}</p>
                      )}
                    </div>
                    </div>
                  </form>
                )}

                
                <div className="px-6 py-4 flex justify-between border-t border-gray-200">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Wstecz
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700"
                    >
                      Następny krok
                    </button>
                  ) : (
                  <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
                    >
                      Zapisz
                    </button>
                  )}
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}