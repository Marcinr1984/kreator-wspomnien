'use client';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../utils/supabaseClient';
import ProfileTab from './EditTabs/ProfileTab';
import ThemeTab from './EditTabs/ThemeTab';
import IconTab from './EditTabs/IconTab';
import PrivacyTab from './EditTabs/PrivacyTab';
import KeeperAdminsTab from './EditTabs/KeeperAdminsTab';
import { useRouter } from 'next/navigation';
import {
  Cog6ToothIcon,
  PhotoIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersIcon
} from '@heroicons/react/24/solid'


interface EditPageSettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  memorialId: number;
  pageData: any;
  onRelationsChange?: (newRelations: string) => Promise<void>;
  defaultTab?: string;
  onUpdate?: (newPhotoUrl: string) => void;
  onBannerChange?: (newBannerUrl: string) => Promise<void> | void;
}
  

const EditPageSettingsModal: React.FC<EditPageSettingsModalProps> = ({ isOpen, closeModal, memorialId, pageData, defaultTab, onUpdate, onBannerChange }) => {
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
  
  const [activeTab, setActiveTab] = useState(defaultTab || 'profile');
  const router = useRouter();
  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserCircleIcon },
    { id: 'theme', label: 'Motyw', icon: PhotoIcon },
    { id: 'icon', label: 'Ikona', icon: Cog6ToothIcon },
    { id: 'privacy', label: 'Prywatność', icon: ShieldCheckIcon },
    { id: 'keepers', label: 'Opiekunowie', icon: UsersIcon }
  ] as const

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
      onUpdate?.(photoUrl);
      closeModal();
    }
  };

  const handleTabChange = (tab: string) => {
    setValidationError('');
    setActiveTab(tab);
  };

  if (!isOpen) return null;

  console.log('PrivacyTab type', typeof PrivacyTab);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={closeModal}>
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
              <Dialog.Panel className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                          <Cog6ToothIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Edytuj ustawienia strony</Dialog.Title>
                          <p className="mt-1 max-w-xl text-sm text-white/85">
                            {pageData?.first_name} {pageData?.last_name} • Zarządzaj wyglądem, prywatnością oraz zespołem opiekunów.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                      >
                        Zamknij
                      </button>
                    </div>

                    <nav className="grid gap-3 sm:grid-cols-5">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                              isActive
                                ? 'border-white/30 bg-white/20 text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.65)]'
                                : 'border-white/10 bg-white/10 text-white/70 hover:border-white/20 hover:bg-white/20'
                            }`}
                          >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                              isActive
                                ? 'border-white/60 bg-white/20 text-white'
                                : 'border-white/20 bg-white/10 text-white/70'
                            }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden bg-white">
                  <div className="h-full overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
                    <div className="rounded-[28px] border border-slate-100 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
                      {validationError && (
                        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{validationError}</div>
                      )}
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
                          memorialId={memorialId}
                          supabase={supabase}
                        />
                      )}
                      {activeTab === 'theme' && (
                        <ThemeTab
                          memorialId={memorialId}
                          currentBannerUrl={pageData?.banner_url}
                          onBannerChange={onBannerChange}
                        />
                      )}
                      {activeTab === 'icon' && <IconTab />}
                      {activeTab === 'privacy' && (
                        <PrivacyTab
                          pageId={memorialId}
                          supabase={supabase}
                          userId={pageData.user_id}
                          slug={pageData.slug}
                        />
                      )}
                      {activeTab === 'keepers' && <KeeperAdminsTab />}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-white/95 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Zapisz zmiany, aby weszły w życie</span>
                  <div className="flex w-full gap-3 sm:w-auto">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-initial"
                    >
                      Anuluj
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={uploading}
                      className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-initial"
                    >
                      {uploading ? 'Zapisywanie…' : 'Zapisz zmiany'}
                    </button>
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

export default EditPageSettingsModal;
