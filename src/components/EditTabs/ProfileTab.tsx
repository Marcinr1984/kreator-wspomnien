import React from 'react';

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
  fileInputRef: React.RefObject<HTMLInputElement>;
}

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
  fileInputRef
}) => {
  return (
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
                    
                
  );
};

export default ProfileTab;