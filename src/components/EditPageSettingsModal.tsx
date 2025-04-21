'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../utils/supabaseClient';
import ImageEditor from '../components/ImageEditor';
import ProfileTab from './EditTabs/ProfileTab';
import ThemeTab from './EditTabs/ThemeTab';
import IconTab from './EditTabs/IconTab';
import PrivacyTab from './EditTabs/PrivacyTab';
import KeeperAdminsTab from './EditTabs/KeeperAdminsTab';


interface EditPageSettingsModalProps {
    isOpen: boolean;
    closeModal: () => void;
    memorialId: number;
    pageData: any;
    onRelationsChange?: (newRelations: string) => Promise<void>;
    defaultTab?: string;
  }
  

const EditPageSettingsModal: React.FC<EditPageSettingsModalProps> = ({ isOpen, closeModal, memorialId, pageData, defaultTab }) => {
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
  const [imageSrc, setImageSrc] = useState<string>('');
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
  
  const [activeTab, setActiveTab] = useState(defaultTab || 'profile');
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

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
                    <button 
                    onClick={() => handleTabChange('keepers')}
                    className={`relative text-base font-medium py-2 ${activeTab === 'keepers' ? 'text-cyan-600' : 'text-gray-600'}`}
                  >
                    Opiekunowie strony
                    {activeTab === 'keepers' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[130%] h-[2px] bg-cyan-600"></div>}
                  </button>
                  </nav>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-wrap p-8">
                    {activeTab === 'profile' && (
                      <ProfileTab
                        firstName={firstName}
                        setFirstName={setFirstName}
                        lastName={lastName}
                        setLastName={setLastName}
                        middleName={middleName}
                        setMiddleName={setMiddleName}
                        suffix={suffix}
                        setSuffix={setSuffix}
                        nickname={nickname}
                        setNickname={setNickname}
                        pronoun={pronoun}
                        setPronoun={setPronoun}
                        birthDate={birthDate}
                        setBirthDate={setBirthDate}
                        deathDate={deathDate}
                        setDeathDate={setDeathDate}
                        isDeceased={isDeceased}
                        setIsDeceased={setIsDeceased}
                        relation={relation}
                        setRelation={setRelation}
                        relationDescription={relationDescription}
                        setRelationDescription={setRelationDescription}
                        photoUrl={photoUrl}
                        setPhotoUrl={setPhotoUrl}
                        handleUploadClick={handleUploadClick}
                        handleFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                      />
                    )}
                    
                    {activeTab === 'theme' && <ThemeTab />}
                    {activeTab === 'icon' && <IconTab />}
                    {activeTab === 'privacy' && <PrivacyTab />}
                    {activeTab === 'keepers' && <KeeperAdminsTab />}
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