import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../utils/supabaseClient';

interface EditPageSettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  memorialId: number;
  pageData: any;
  onRelationsChange?: (newRelations: string) => Promise<void>;
}

const EditPageSettingsModal: React.FC<EditPageSettingsModalProps> = ({ isOpen, closeModal, memorialId, pageData }) => {
    const [validationError, setValidationError] = useState('');
    const [firstName, setFirstName] = useState(pageData.first_name);
  const [middleName, setMiddleName] = useState(pageData.middle_name || '');
  const [lastName, setLastName] = useState(pageData.last_name);
  const [suffix, setSuffix] = useState(pageData.suffix || '');
  const [nickname, setNickname] = useState(pageData.nickname || '');
  const [pronoun, setPronoun] = useState(pageData.pronoun || '');
  const [isDeceased, setIsDeceased] = useState(pageData.is_deceased || false);
  const [birthDate, setBirthDate] = useState(pageData.birth_date);
  const [deathDate, setDeathDate] = useState(pageData.death_date);
  const [relation, setRelation] = useState(pageData.relation || '');
  const [relationDescription, setRelationDescription] = useState(pageData.relation_description || '');
  const [photoUrl, setPhotoUrl] = useState(pageData.photo_url);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setUploading(true);
  
    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoUrl(localPreviewUrl);
  
    const fileExt = file.name.split('.').pop();
    const fileName = `${memorialId}-${Date.now()}.${fileExt}`;
    const filePath = `memorial-photos/${fileName}`;
  
    const { data, error } = await supabase
      .storage
      .from('memorial-photos')
      .upload(filePath, file);
  
    if (error) {
      console.error('Błąd przesyłania pliku:', error);
      setUploading(false);
      return;
    }
  
    const { data: publicData } = supabase
  .storage
  .from('memorial-photos')
  .getPublicUrl(filePath);

const publicURL = publicData?.publicUrl;
console.log('Publiczny URL:', publicURL);
setPhotoUrl(publicURL || '');
setUploading(false);
  };
  
  const [activeTab, setActiveTab] = useState('profile'); // Domyślnie aktywna jest karta 'profile'

  const handleSave = async () => {
    setValidationError('');
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !pronoun.trim() ||
      !birthDate ||
      !relation.trim() ||
      (isDeceased && !deathDate)
    ) {
      setValidationError('Uzupełnij wymagane pola.');
      return;
    }

    const { data, error } = await supabase
      .from('memorial_pages')
      .update({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix,
        nickname: nickname,
        pronoun: pronoun,
        birth_date: birthDate,
        death_date: deathDate,
        is_deceased: isDeceased,
        relation: relation,
        relation_description: relationDescription,
        photo_url: photoUrl,
      })
      .eq('id', memorialId);

    if (error) {
      console.error('Błąd zapisu ustawień strony:', error);
    } else {
      console.log('Zmiany zapisane:', data);
      closeModal();
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
              <Dialog.Panel className="w-[1150px] h-[800px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                      +
                    </div>
                    <span className="text-white font-medium">Edytuj ustawienia strony</span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-black bg-white rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-200"
                  >
                    Zamknij
                  </button>
                </div>
                <div className="w-full border-b border-gray-200 bg-white py-4">
                  <nav className="flex justify-center items-center space-x-10">
                    <button 
                      onClick={() => handleTabChange('profile')}
                      className={`relative text-base font-medium py-2 ${activeTab === 'profile' ? 'text-cyan-600' : 'text-gray-600'}`}
                    >
                      Profil
                      {activeTab === 'profile' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[180%] h-[2px] bg-cyan-600"></div>}
                    </button>
                    <button 
                      onClick={() => handleTabChange('theme')}
                      className={`relative text-base font-medium py-2 ${activeTab === 'theme' ? 'text-cyan-600' : 'text-gray-600'}`}
                    >
                      Motyw
                      {activeTab === 'theme' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[170%] h-[2px] bg-cyan-600"></div>}
                    </button>
                    <button 
                      onClick={() => handleTabChange('icon')}
                      className={`relative text-base font-medium py-2 ${activeTab === 'icon' ? 'text-cyan-600' : 'text-gray-600'}`}
                    >
                      Ikona
                      {activeTab === 'icon' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[180%] h-[2px] bg-cyan-600"></div>}
                    </button>
                    <button 
                      onClick={() => handleTabChange('privacy')}
                      className={`relative text-base font-medium py-2 ${activeTab === 'privacy' ? 'text-cyan-600' : 'text-gray-600'}`}
                    >
                      Prywatność
                      {activeTab === 'privacy' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[150%] h-[2px] bg-cyan-600"></div>}
                    </button>
                  </nav>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-wrap p-8">
                    {activeTab === 'profile' && (
                      <div className="flex w-full gap-4 flex-nowrap">
                        {/* Lewa kolumna – formularz */}
                        <div className="w-full md:w-1/2">
                        <h3 className="text-lg font-semibold mb-4">Dla kogo jest ta pamiątka?</h3>
                    <div className="border-2 border-gray-200 rounded-2xl pt-12 px-6 pb-12 bg-white shadow-sm">
    
    <div className="grid grid-cols-2 gap-4">
                            {/* Imię */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Imię <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Wprowadź imię"
                              />
                            </div>
                            {/* Nazwisko */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Nazwisko <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Wprowadź nazwisko"
                              />
                            </div>
                            {/* Drugie imię */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Drugie imię</label>
                              <input
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Wprowadź drugie imię"
                              />
                            </div>
                            {/* Tytuł (np. Jr, M.D.) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Tytuł (np. Jr, M.D.)</label>
                              <input
                                type="text"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Wprowadź tytuł"
                              />
                            </div>
                            {/* Pseudonim */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Pseudonim</label>
                              <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Wprowadź pseudonim"
                              />
                            </div>
                            {/* Zaimek */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Zaimek <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={pronoun}
                                onChange={(e) => setPronoun(e.target.value)}
                                className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-base h-12"
                            >
                                <option value="">Wybierz</option>
                                <option value="on">on</option>
                                <option value="ona">ona</option>
                                <option value="oni">oni</option>
                            </select>
                            </div>
                            {/* Data urodzenia */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700">Data urodzenia <span className="text-red-500">*</span></label>
                              <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            {/* Data śmierci */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700">Data śmierci {isDeceased && <span className="text-red-500">*</span>}</label>
                              <input
                                type="date"
                                value={deathDate}
                                onChange={(e) => setDeathDate(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
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
                              <label className="ml-2 block text-sm font-medium text-gray-700">Osoba zmarła?</label>
                            </div>
                            {/* Wybierz relację */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700">Wybierz relację <span className="text-red-500">*</span></label>
                            <select
                                value={relation}
                                onChange={(e) => setRelation(e.target.value)}
                                className="mt-1 block w-full px-2 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base h-12"
                            >
                                <option value="">Wybierz</option>
                                <option value="Rodzic">Rodzic</option>
                                <option value="Dziecko">Dziecko</option>
                                <option value="Małżonek/partner">Małżonek/partner</option>
                                <option value="Przyjaciel">Przyjaciel</option>
                                <option value="Inne">Inne</option>
                            </select>
                            </div>
                            {/* Opisz relację */}
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Opisz relację</label>
                              <textarea
                                value={relationDescription}
                                onChange={(e) => setRelationDescription(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                rows={2}
                                placeholder="Krótki opis relacji..."
                              />
                            </div>
                            </div>
                          </div>
                        </div>
                        {/* Prawa kolumna – podgląd zdjęcia */}
                        
                        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-4">
                        <div className="flex flex-col items-center">
                            {/* Nagłówek i przycisk 'Usuń' */}
                            {/* Nagłówek i przycisk 'Usuń' na jednej linii o stałej szerokości */}
                            <div className="flex items-center justify-between w-80 mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">Aktualne zdjęcie</h3>
                            <button
                                onClick={() => setPhotoUrl('')}
                                className="flex items-center text-black hover:underline"
                            >
                                <svg
                                className="w-4 h-4 text-cyan-600 mr-1"
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
                            <div className="mt-4 w-full flex justify-center">
                            <div className="w-80 h-80 border-4 border-gray-100 shadow-md flex items-center justify-center rounded-2xl overflow-hidden">
                                {photoUrl ? (
                                <img src={photoUrl} alt="Zdjęcie" className="w-full h-full object-cover" />
                                ) : (
                                <span className="text-gray-400">Brak zdjęcia</span>
                                )}
                            </div>
                            </div>

                            {/* Przyciski akcji */}
                            <div className="flex flex-wrap gap-2 mt-4">
  {/* Edit */}
  <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-500"
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

  {/* Upload new photo */}
  <button
    onClick={handleUploadClick}
    className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    Prześlij nowe zdjęcie
  </button>

  {/* Choose from Mementos */}
  <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-500"
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
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              hidden
                              onChange={handleFileChange}
                            />

                            {/* Informacja o bibliotece obrazów */}
                            <p className="mt-4 text-sm text-gray-600 text-center">
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
                    )}
                    {activeTab === 'theme' && (
                      <div className="flex justify-center items-center">
                        <span className="text-lg font-semibold">Motyw</span>
                      </div>
                    )}
                    {activeTab === 'icon' && (
                      <div className="flex justify-center items-center">
                        <span className="text-lg font-semibold">Ikona</span>
                      </div>
                    )}
                    {activeTab === 'privacy' && (
                      <div className="flex justify-center items-center">
                        <span className="text-lg font-semibold">Prywatność</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sekcja przycisku zapisz zmiany */}
                <div className="mt-auto border-t border-gray-200 py-4 px-6 flex justify-end">
                {validationError && <p className="text-red-500 text-sm mb-2">{validationError}</p>}
                  <button 
                    onClick={handleSave} 
                    disabled={uploading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditPageSettingsModal;