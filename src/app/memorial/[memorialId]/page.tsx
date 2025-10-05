'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'
import EditPageSettingsModal from '../../../components/EditPageSettingsModal';
import {
  LockClosedIcon,
  GlobeAltIcon,
  PlusIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  Squares2X2Icon
} from '@heroicons/react/24/solid'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'
import PamiecTab from '../../../components/MemorialTab/PamiecTab';
import PamiatkiTab from '../../../components/MemorialTab/PamiatkiTab';
import BliscyTab from '../../../components/MemorialTab/BliscyTab';
export default function MemorialPage() {
  const params = useParams()
  const memorialId = params.memorialId
  console.log('Parametr memorialId:', memorialId)
  const [keeperCount, setKeeperCount] = useState(1)

  // Stan na bieżącego użytkownika
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.display_name ?? user.email;
        setCurrentUser({ ...user, fullName });
      } else {
        console.error('Nie udało się pobrać użytkownika:', error);
      }
    };

    getCurrentUser();
  }, []);

  const [pageData, setPageData] = useState<any>(null)
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loading, setLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [repositionMode, setRepositionMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('pamiec')
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const useLegacyLayout = process.env.NEXT_PUBLIC_MEMORIAL_USE_LEGACY === 'true';
  // Dropdown ref for outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState('ustawienia');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalDefaultTab('ustawienia');
  };

  const startDragPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startObjectPosition = useRef<{ x: number; y: number }>({ x: 50, y: 50 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  const parsedId = Number(Array.isArray(memorialId) ? memorialId[0] : memorialId)
  console.log('parsedId:', parsedId, 'typ:', typeof parsedId)
  if (!memorialId || Array.isArray(memorialId) || isNaN(parsedId)) {
    return <div className="p-8">Nieprawidłowy identyfikator strony pamięci.</div>
  }

  useEffect(() => {
    const fetchMemorial = async () => {
      const { data, error } = await supabase
        .from('memorial_pages')
        .select('*')
        .eq('id', parsedId)
        .single()

      if (error) {
        console.error('Błąd pobierania strony pamięci:', error)
        console.error(error.message)
      } else {
        setPageData(data)
      }

      setLoading(false)
    }

    if (!isNaN(parsedId)) {
      console.log('parsedId:', parsedId)
      fetchMemorial()
    }
  }, [parsedId])

  useEffect(() => {
    const fetchKeeperCount = async () => {
      console.log('🔍 Wysyłam zapytanie o keeperów z full_memorial_keepers dla memorial_id:', parsedId);
 
      const { data, error } = await supabase
        .from('full_memorial_keepers')
        .select('user_id')
        .eq('memorial_id', parsedId);
 
      if (!error && Array.isArray(data)) {
        console.log('✅ Keeperzy z widoku:', data);
        console.log('👥 Liczba keeperów:', data.length);
        setKeeperCount(data.length);
      } else {
        console.error('❌ Błąd zliczania opiekunów:', error);
      }
    };
 
    if (!isNaN(parsedId)) {
      fetchKeeperCount();
    }
  }, [parsedId]);

  useEffect(() => {
    if (pageData?.banner_position && typeof pageData.banner_position === 'string') {
      console.log('Odczytana pozycja z bazy:', pageData.banner_position)
      const [x, y] = pageData.banner_position.split('%').map((v: string) => parseFloat(v.trim()))
      if (!isNaN(x) && !isNaN(y)) {
        setPosition({ x, y })
      }
    }
  }, [pageData])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !repositionMode) return;

      const dx = e.clientX - startDragPosition.current.x;
      const dy = e.clientY - startDragPosition.current.y;
      const newX = Math.min(Math.max(0, startObjectPosition.current.x + dx / imageRef.current!.offsetWidth * 100), 100);
      const newY = Math.min(Math.max(0, startObjectPosition.current.y - dy / imageRef.current!.offsetHeight * 100), 100);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging && repositionMode) {
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, repositionMode, position, parsedId]);

  const handleBannerChange = async (newUrl: string) => {
    const previousUrl = pageData?.banner_url
    setPageData((prev: any) => ({ ...prev, banner_url: newUrl }))
    const { data: updated, error } = await supabase
      .from('memorial_pages')
      .update({ banner_url: newUrl })
      .eq('id', parsedId)
      .select('banner_url')
      .single()

    if (error) {
      console.error('Błąd zapisu tła:', error)
      setPageData((prev: any) => ({ ...prev, banner_url: previousUrl }))
    } else {
      if (updated?.banner_url) {
        setPageData((prev: any) => ({ ...prev, banner_url: updated.banner_url }))
      }
      console.log('✅ Zmieniono tło na', updated?.banner_url)
    }
  }

  const handleRelationsChange = async (newRelations: string) => {
    setPageData((prev: any) => ({ ...prev, relations: newRelations }));
    const response = await supabase
      .from('memorial_pages')
      .update({ relations: newRelations })
      .eq('id', parsedId)
      .select();

    if (response.error) {
      console.error('Błąd aktualizacji relacji:', response.error);
    } else {
      console.log('Relacja zaktualizowana:', response.data);
    }
  };

  const performPublishToggle = async () => {
    if (!pageData || isPublishing) return

    const userId = currentUser?.id || pageData.user_id
    if (!userId) {
      alert('Nie udało się ustalić właściciela strony. Spróbuj ponownie po odświeżeniu.')
      return
    }

    const makePublic = !pageData.is_public
    try {
      setIsPublishing(true)

      if (makePublic) {
        const { data: otherPages, error: fetchError } = await supabase
          .from('memorial_pages')
          .select('id')
          .eq('user_id', userId)
          .eq('is_public', true)
          .neq('id', pageData.id)

        if (fetchError) {
          throw fetchError
        }

        if (Array.isArray(otherPages) && otherPages.length > 0) {
          const otherIds = otherPages.map((p: { id: number }) => p.id)
          const { error: deactivateError } = await supabase
            .from('memorial_pages')
            .update({ is_public: false })
            .in('id', otherIds)

          if (deactivateError) {
            throw deactivateError
          }
        }
      }

      const { data: updatedPage, error: updateError } = await supabase
        .from('memorial_pages')
        .update({ is_public: makePublic })
        .eq('id', pageData.id)
        .select('*')
        .maybeSingle()

      if (updateError || !updatedPage) {
        throw updateError || new Error('Brak danych po aktualizacji statusu publikacji.')
      }

      setPageData((prev: any) => ({ ...prev, ...updatedPage }))
    } catch (error: any) {
      console.error('❌ Błąd przy zmianie statusu publikacji:', error)
      alert(`Nie udało się zaktualizować statusu publikacji: ${error?.message || 'spróbuj ponownie później.'}`)
    } finally {
      setIsPublishing(false)
      setIsPublishConfirmOpen(false)
    }
  }

  const togglePublishStatus = () => {
    if (!pageData || isPublishing) return

    if (!pageData.is_public) {
      setIsPublishConfirmOpen(true)
      return
    }

    performPublishToggle()
  }

  if (loading) {
    return (
      <div className="relative h-1 w-full">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-rose-400 via-purple-500 to-cyan-400 animate-[slide_1.5s_linear_infinite] w-1/3 rounded-r-full"></div>
        <style jsx>{`
          @keyframes slide {
            0% { left: -33%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  if (!pageData) {
    return <div className="p-8">Nie znaleziono strony pamięci.</div>
  }

  const sliderGap = '0.75rem'
  const sliderKnobStyle: CSSProperties = {
    width: `calc(50% - ${sliderGap})`,
    transform: pageData.is_public ? 'translateX(100%)' : 'translateX(0)',
    left: sliderGap,
    top: '0.5rem',
    bottom: '0.5rem'
  }

  const legacyLayout = (
    <div className="bg-[#f8fbfa] min-h-screen w-full">
      <div className="w-full">
        {/* Sekcja górna z banerem */}
        <div className="group relative w-full h-80 md:h-[22rem] lg:h-[26rem] xl:h-[28rem] overflow-hidden">
          <img
            ref={imageRef}
            src={pageData.banner_url || '/banner1.jpg'}
            className={`w-full h-full object-cover select-none z-0 ${repositionMode ? 'cursor-move pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              objectPosition: `${position.x}% ${position.y}%`,
            }}
            onMouseDown={(e) => {
              if (!repositionMode) return;
              e.preventDefault();
              setIsDragging(true);
              startDragPosition.current = { x: e.clientX, y: e.clientY };
              const rect = e.currentTarget.getBoundingClientRect();
              const currentX = (e.clientX - rect.left) / rect.width * 100;
              const currentY = (e.clientY - rect.top) / rect.height * 100;
              startObjectPosition.current = { x: currentX, y: currentY };
            }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none z-10" />
          <div className="absolute top-[19.5rem] left-1/2 transform -translate-x-[calc(50%-290px)] z-30 flex gap-2">
            <button
              onClick={() => {
                const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                const previewUrl = isLocalhost
                  ? `http://localhost:3000/preview/${parsedId}`
                  : `https://qr.dlabliskich.pl/preview/${parsedId}`;
                window.open(previewUrl, '_blank');
              }}
              className="bg-white px-4 py-2.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium text-gray-800 pointer-events-auto flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C6 2 2.73 5.11 1 10c1.73 4.89 5 8 9 8s7.27-3.11 9-8c-1.73-4.89-5-8-9-8zm0 12a4 4 0 110-8 4 4 0 010 8z" />
              </svg>
              Podgląd jako gość
            </button>
            <button
              className="bg-white px-4 py-2.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium text-gray-800 pointer-events-auto flex items-center gap-2"
              onClick={() => {
                setModalDefaultTab('profile');
                openModal();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a1 1 0 011 1v1.09a7.966 7.966 0 014.03 1.66l.77-.77a1 1 0 111.42 1.42l-.77.77A7.966 7.966 0 0120.91 11H22a1 1 0 110 2h-1.09a7.966 7.966 0 01-1.66 4.03l.77.77a1 1 0 11-1.42 1.42l-.77-.77A7.966 7.966 0 0113 20.91V22a1 1 0 11-2 0v-1.09a7.966 7.966 0 01-4.03-1.66l-.77.77a1 1 0 11-1.42-1.42l.77-.77A7.966 7.966 0 013.09 13H2a1 1 0 110-2h1.09a7.966 7.966 0 011.66-4.03l-.77-.77a1 1 0 111.42-1.42l.77.77A7.966 7.966 0 0111 3.09V2a1 1 0 011-1zm0 5a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
              Edytuj ustawienia strony
            </button>
            <button className="bg-cyan-600 px-4 py-2.5 rounded-md shadow-md hover:bg-cyan-700 text-sm font-medium text-white pointer-events-auto flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 100-6 3 3 0 000 6zM9 21a3 3 0 100-6 3 3 0 000 6zM21 15a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83-4.02M8.59 10.49l6.83 4.02" />
              </svg>
              Udostępnij stronę
            </button>
          </div>
          <div className="absolute top-16 inset-x-0 flex justify-center transition-opacity duration-300 group-hover:opacity-100 z-20">
            {!repositionMode && (
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                className="bg-white px-4 py-2 rounded-full shadow-md hover:bg-cyan-100 transition flex items-center gap-2"
                onClick={() => {
                  setModalDefaultTab('theme'); // Ustawiamy, aby modal otwierał się z zakładką motyw
                  openModal();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l2 2M4 20h4l10-10a2.828 2.828 0 00-4-4L4 16v4z" />
                </svg>
                <span className="text-black">Zmień zdjęcie w tle</span>
              </button>
                <button
                  className="bg-white px-4 py-2 rounded-full shadow-md hover:bg-cyan-100 transition flex items-center gap-2"
                  onClick={() => setRepositionMode(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8v8H8V8z" />
                  </svg>
                  <span className="text-black">Zmień pozycję zdjęcia</span>
                </button>
              </div>
            )}
            {repositionMode && (
              <div className="flex gap-4">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-100"
                  onClick={() => {
                    setRepositionMode(false)
                  }}
                >
                  Anuluj
                </button>
                <button
                  className="bg-cyan-500 text-white px-4 py-2 rounded-full shadow hover:bg-cyan-600"
                  onClick={async () => {
                    console.log('Kliknięto przycisk zapisz')
                    if (!parsedId || isNaN(parsedId)) {
                      console.error('Brak prawidłowego ID strony pamięci')
                      return
                    }

                    const pos = `${position.x}% ${position.y}%`
                    console.log('ID strony pamięci:', parsedId)
                    console.log('Zapisuję pozycję:', pos)
                    console.log('Aktualne dane strony:', pageData)

                    const response = await supabase
                      .from('memorial_pages')
                      .update({ banner_position: pos })
                      .eq('id', parsedId)
                      .select()

                    console.log('Zapisano:', response)

                    if (response.error) {
                      console.error('Błąd zapisu pozycji:', response.error)
                    } else {
                      console.log('Zapisano pomyślnie:', response.data)
                      setPageData((prev: any) => ({
                        ...prev,
                        banner_position: pos,
                      }))
                    }

                    setRepositionMode(false)
                  }}
                >
                  Zapisz zmiany
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sekcja z kartą */}
        <div className="bg-white -mt-20 max-w-6xl mx-auto rounded-lg shadow-md p-6 relative z-10">
          <div className="flex flex-wrap md:flex-nowrap gap-6 w-full">
            {/* Lewa kolumna */}
            <div className="w-full md:w-1/2 flex flex-col items-center -ml-[2.325rem] mt-[4rem] md:mt-[6rem] relative">
            <div className="absolute -top-[175px] z-20">
            <div
  className="relative group bg-gray-100 rounded-2xl p-1 shadow-md cursor-pointer"
  onClick={() => {
    setModalDefaultTab('profile');
    openModal();
  }}
>
  {photoLoading ? (
    <div className="w-[360px] h-[360px] flex items-center justify-center bg-gray-100 rounded-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500 border-solid"></div>
    </div>
  ) : pageData.photo_url ? (
    <img
      src={pageData.photo_url}
      alt="Zdjęcie"
      className="w-[360px] h-[360px] object-cover rounded-2xl transition duration-300 ease-in-out"
    />
  ) : (
    <div className="w-[360px] h-[360px] bg-gray-100 flex items-center justify-center rounded-2xl">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-28 h-28 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
          1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18
          3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0
          0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0
          1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375
          0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </div>
  )}
  {/* Overlay – zaczynamy od opacity-0, a przy hover przechodzi do półprzezroczystości */}
  <div className="absolute inset-0 bg-black opacity-0 rounded-2xl transition duration-300 ease-in-out group-hover:opacity-30"></div>
  {/* Przycisk – domyślnie ukryty (opacity-0), pojawia się przy najechaniu */}
  <button
  className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-md hover:bg-cyan-100 transition flex items-center gap-2 text-base font-medium text-gray-800 pointer-events-auto opacity-0 group-hover:opacity-100"
  onClick={(e) => {
    e.stopPropagation();
    setModalDefaultTab('profile'); // Ustawiamy, aby modal otwierał się z zakładką profile
    openModal();
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-cyan-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l2 2M4 20h4l10-10a2.828 2.828 0 00-4-4L4 16v4z"
    />
  </svg>
  <span className="text-black">Zmień zdjęcie profilowe</span>
</button>
</div>
</div>
              <button
                onClick={() => {
                  setModalDefaultTab('keepers');
                  openModal();
                }}
                className="bg-gray-100 rounded-xl p-4 shadow-sm w-[370px] mt-[220px] mb-[20px] transition-all duration-300 hover:ring-2 hover:ring-cyan-500 text-left"
                type="button"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-medium text-gray-700">Opiekunowie pamięci ({keeperCount})</span>
                  <a href="#" className="text-sm text-black hover:underline flex items-center gap-1">
                    Zobacz więcej
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 bg-white border border-cyan-500 rounded-full flex items-center justify-center text-sm font-semibold text-cyan-500">
                    MR
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{currentUser?.fullName || 'Nieznany użytkownik'} <span className="text-xs text-gray-500">(ty)</span></p>
                    <p className="text-xs text-gray-500">{pageData.relation}</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Prawa kolumna */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center mt-[60px]">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                {pageData.first_name} {pageData.last_name}
              </h1>
              <p className="text-base text-gray-600">
                {pageData.birth_date} - {pageData.death_date || 'Obecnie'}
              </p>
              <div className="mt-32 flex justify-center">
                <div className="relative">
                  <div className={`relative w-64 h-14 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400 p-[2px] transition-all duration-300 ease-out overflow-hidden ${
                    isPublishing ? 'opacity-70' : 'hover:shadow-[0_6px_18px_rgba(13,148,136,0.16)]'
                  }`}>
                    <button
                      type="button"
                      onClick={togglePublishStatus}
                      disabled={isPublishing}
                      className="relative flex items-center justify-between w-full h-full rounded-full bg-white/6 backdrop-blur-[3px] overflow-hidden"
                    >
                      <span
                        className="absolute rounded-full bg-white/40 backdrop-blur-[4px] transition-transform duration-300 ease-out"
                        style={{
                          top: '0.42rem',
                          bottom: '0.42rem',
                          width: 'calc(50% - 0.95rem)',
                          left: '0.72rem',
                          transform: pageData?.is_public
                            ? 'translateX(calc(100% + 0.72rem))'
                            : 'translateX(0)'
                        }}
                      />
                      <span
                        className={`relative z-10 flex-1 text-center text-sm font-medium tracking-wide transition-colors duration-300 px-3 ${
                          pageData?.is_public ? 'text-white/85' : 'text-white'
                        }`}
                      >
                        Szkic
                      </span>
                      <span
                        className={`relative z-10 flex-1 text-center text-sm font-medium tracking-wide transition-colors duration-300 px-3 ${
                          pageData?.is_public ? 'text-white' : 'text-white/85'
                        }`}
                      >
                        Opublikowano
                      </span>
                    </button>
                  </div>
                  <span className="absolute -top-3 -right-3 flex items-center justify-center w-9 h-9 rounded-full bg-black text-white ring-[3px] ring-white shadow-md">
                    {pageData?.is_public ? (
                      <GlobeAltIcon className="w-3.5 h-3.5" />
                    ) : (
                      <LockClosedIcon className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
              </div>
            </div>

          </div>
          
        </div>
        {isPublishConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-[520px] rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-600 w-9 h-9 rounded-full flex items-center justify-center">
                    <LockClosedIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Udostępnij stronę</span>
                </div>
                <button
                  onClick={() => setIsPublishConfirmOpen(false)}
                  className="bg-white text-black text-sm font-medium rounded-full px-4 py-1 hover:bg-gray-200"
                >
                  Zamknij
                </button>
              </div>
              <div className="bg-white px-8 py-6">
                <h3 className="text-lg font-semibold text-gray-800">Czy na pewno chcesz udostępnić tę stronę publicznie?</h3>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  Publikując tę stronę jako publiczną, wszystkie inne Twoje strony zostaną automatycznie ustawione jako prywatne.
                  W każdej chwili możesz zmienić to ustawienie w zakładce „Prywatność”.
                </p>
              </div>
              <div className="bg-gray-100 px-8 py-5 flex justify-end gap-4">
                <button
                  onClick={() => setIsPublishConfirmOpen(false)}
                  className="px-5 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={performPublishToggle}
                  className="px-6 py-2 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700"
                  disabled={isPublishing}
                >
                  Udostępnij
                </button>
              </div>
            </div>
          </div>
        )}
{/* Sekcja z przyciskami i treścią */}
<div className="w-full mt-10 bg-white max-w-6xl mx-auto rounded-lg shadow-md p-6 pb-6 pt-0 overflow-hidden">
 

  {/* Nawigacja z przyciskami – rozciągnięta na całą szerokość dzięki -mx-6 i px-6 */}
  <div className={`-mx-6 ${!isEditing ? 'border-b border-gray-200' : ''} ${isEditing ? 'bg-gray-100' : 'bg-white'} py-4 px-6`}>
    {!isEditing ? (
      <nav className="flex justify-center items-center space-x-10">
        <button 
          onClick={() => setActiveTab('pamiec')}
          className={`relative text-base font-medium py-2 ${activeTab === 'pamiec' ? 'text-cyan-600' : 'text-gray-600'}`}
        >
          Pamięć
          {activeTab === 'pamiec' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('pamiatki')}
          className={`relative text-base font-medium py-2 ${activeTab === 'pamiatki' ? 'text-cyan-600' : 'text-gray-600'}`}
        >
          Pamiątki
          {activeTab === 'pamiatki' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[150%] h-[2px] bg-cyan-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('bliscy')}
          className={`relative text-base font-medium py-2 ${activeTab === 'bliscy' ? 'text-cyan-600' : 'text-gray-600'}`}
        >
          Bliscy
          {activeTab === 'bliscy' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
        </button>
      </nav>
    ) : (
      <div className="flex justify-between items-center bg-gray-100 h-12 px-6 rounded-md">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm py-3 px-6 rounded-xl min-w-[250px] flex justify-between items-center w-full"
          >
            <span>Dodaj pamiątki</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div ref={dropdownRef} className="absolute mt-2 w-full bg-white rounded-xl shadow-lg z-50 pb-4">
              <div className="px-4 py-2 text-gray-400 text-xs font-semibold">PRZEŚLIJ ZDJĘCIA I FILMY</div>
              <div className="flex flex-col">
                <button className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-cyan-500" />
                  Dodaj pliki
                </button>
              </div>

              <div className="px-4 py-2 text-gray-400 text-xs font-semibold">UTWÓRZ HISTORIE</div>
              <div className="flex flex-col">
                <button className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5 text-cyan-500" />
                  Dodaj zdjęcia
                </button>
                <button className="w-full text-left px-4 py-2 mt-1.5 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <VideoCameraIcon className="h-5 w-5 text-cyan-500" />
                  Dodaj film
                </button>
                <button className="w-full text-left px-4 py-2 mt-1.5 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-cyan-500" />
                  Dodaj stronę
                </button>
                <button className="w-full text-left px-4 py-2 mt-1.5 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-cyan-500" />
                  Dodaj dokument
                </button>
                <button className="w-full text-left px-4 py-2 mt-1.5 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                  <Squares2X2Icon className="h-5 w-5 text-cyan-500" />
                  Dodaj album
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-semibold text-gray-700">Zezwól odwiedzającym na pobieranie pamiątek?</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-cyan-600 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>
    )}
  </div>

  {/* Zawartość zakładek */}
  <div className="pt-6">
    {activeTab === 'pamiec' && (
      <PamiecTab />
    )}

    {activeTab === 'pamiatki' && (
      <PamiatkiTab setIsEditing={setIsEditing} memorialId={parsedId} />
    )}

    {activeTab === 'bliscy' && (
      <BliscyTab />
    )}
  </div>
</div>

        {/* Stopka */}
          <footer className="text-center text-xs text-gray-400 mt-12 mb-6">
          © 2025 DlaBliskich. Wszelkie prawa zastrzeżone.
          </footer>

      </div>
    </div>
  );

  const refreshedLayout = (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] pb-24 text-[#0b1426]">
      <div className="relative">
        <div className="group relative h-[380px] sm:h-[420px] lg:h-[460px] overflow-hidden isolate">
          <img
            ref={imageRef}
            src={pageData.banner_url || '/banner1.jpg'}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out ${repositionMode ? 'cursor-move pointer-events-auto' : 'pointer-events-none'}`}
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            onMouseDown={(e) => {
              if (!repositionMode) return;
              e.preventDefault();
              setIsDragging(true);
              startDragPosition.current = { x: e.clientX, y: e.clientY };
              const rect = e.currentTarget.getBoundingClientRect();
              const currentX = ((e.clientX - rect.left) / rect.width) * 100;
              const currentY = ((e.clientY - rect.top) / rect.height) * 100;
              startObjectPosition.current = { x: currentX, y: currentY };
            }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#ecf2f6] via-[#ecf2f6]/70 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-6 top-8 z-20 flex flex-wrap items-start justify-between gap-4 text-white">
            {repositionMode ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-full bg-black/25 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8v8H8V8z" />
                    </svg>
                  </span>
                  <span className="text-white/85">Przeciągnij, by ustawić kadr.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-md transition hover:bg-white/25"
                    onClick={() => setRepositionMode(false)}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    Anuluj
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/25"
                    onClick={async () => {
                      if (!parsedId || isNaN(parsedId)) {
                        console.error('Brak prawidłowego ID strony pamięci');
                        return;
                      }

                      const pos = `${position.x}% ${position.y}%`;

                      const response = await supabase
                        .from('memorial_pages')
                        .update({ banner_position: pos })
                        .eq('id', parsedId)
                        .select();

                      if (response.error) {
                        console.error('Błąd zapisu pozycji:', response.error);
                      } else {
                        setPageData((prev: any) => ({
                          ...prev,
                          banner_position: pos,
                        }));
                      }

                      setRepositionMode(false);
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Zapisz
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                    onClick={() => {
                      setModalDefaultTab('theme');
                      openModal();
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l2 2M4 20h4l10-10a2.828 2.828 0 00-4-4L4 16v4z" />
                      </svg>
                    </span>
                    <span>Zmień tło</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                    onClick={() => setRepositionMode(true)}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8v8H8V8z" />
                      </svg>
                    </span>
                    <span>Przesuń zdjęcie</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                      const previewUrl = isLocalhost
                        ? `http://localhost:3000/preview/${parsedId}`
                        : `https://qr.dlabliskich.pl/preview/${parsedId}`;
                      window.open(previewUrl, '_blank');
                    }}
                    className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2C6 2 2.73 5.11 1 10c1.73 4.89 5 8 9 8s7.27-3.11 9-8c-1.73-4.89-5-8-9-8zm0 12a4 4 0 110-8 4 4 0 010 8z" />
                      </svg>
                    </span>
                    <span>Podgląd jako gość</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                    onClick={() => {
                      setModalDefaultTab('profile');
                      openModal();
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1a1 1 0 011 1v1.09a7.966 7.966 0 014.03 1.66l.77-.77a1 1 0 111.42 1.42l-.77.77A7.966 7.966 0 0120.91 11H22a1 1 0 110 2h-1.09a7.966 7.966 0 01-1.66 4.03l.77.77a1 1 0 11-1.42 1.42l-.77-.77A7.966 7.966 0 0113 20.91V22a1 1 0 11-2 0v-1.09a7.966 7.966 0 01-4.03-1.66l-.77.77a1 1 0 11-1.42-1.42l.77-.77A7.966 7.966 0 013.09 13H2a1 1 0 110-2h1.09a7.966 7.966 0 011.66-4.03l-.77-.77a1 1 0 111.42-1.42l.77.77A7.966 7.966 0 0111 3.09V2a1 1 0 011-1zm0 5a6 6 0 100 12 6 6 0 000-12z" />
                      </svg>
                    </span>
                    <span>Edytuj ustawienia</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm shadow-lg shadow-cyan-500/30 transition hover:bg-white/25"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 100-6 3 3 0 000 6zM9 21a3 3 0 100-6 3 3 0 000 6zM21 15a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83-4.02M8.59 10.49l6.83 4.02" />
                      </svg>
                    </span>
                    <span>Udostępnij stronę</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div className="space-y-6">
              <div
                className="profile-card group relative cursor-pointer overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_30px_60px_-32px_rgba(14,116,144,0.35)] backdrop-blur"
                onClick={() => {
                  setModalDefaultTab('profile');
                  openModal();
                }}
              >
                {photoLoading ? (
                  <div className="flex h-[360px] w-full items-center justify-center bg-slate-100">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                  </div>
                ) : pageData.photo_url ? (
                  <img
                    src={pageData.photo_url}
                    alt="Zdjęcie"
                    className="h-[360px] w-full object-cover transition duration-300 ease-out"
                  />
                ) : (
                  <div className="flex h-[360px] w-full items-center justify-center bg-slate-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-24 w-24 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/15" />
                <button
                  type="button"
                  className="profile-card__cta absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-white/90 via-white/70 to-white/30 px-5 py-2 text-sm font-semibold text-[#0b1426] shadow-[0_22px_40px_-32px_rgba(14,116,144,0.55)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-[-60%]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalDefaultTab('profile');
                    openModal();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l2 2M4 20h4l10-10a2.828 2.828 0 00-4-4L4 16v4z" />
                  </svg>
                  Edytuj zdjęcie profilowe
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalDefaultTab('keepers');
                  openModal();
                }}
                className="group w-full rounded-3xl border border-white/70 bg-white/90 p-6 text-left text-[#0b1426] shadow-[0_24px_50px_-28px_rgba(14,116,144,0.35)] backdrop-blur transition hover:border-cyan-300/60 hover:shadow-[0_28px_55px_-26px_rgba(14,116,144,0.45)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase tracking-wide text-[#0b1426]/60">Opiekunowie pamięci</span>
                  <span className="text-sm font-medium text-cyan-600">Zobacz więcej</span>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-br from-cyan-500 to-sky-500 text-base font-semibold text-white shadow-lg">
                    {currentUser?.fullName?.slice(0, 2)?.toUpperCase() || 'MR'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0b1426]">
                      {currentUser?.fullName || 'Nieznany użytkownik'} <span className="text-xs text-[#0b1426]/60">(ty)</span>
                    </p>
                    <p className="text-xs text-[#0b1426]/60">{pageData.relation}</p>
                    <p className="mt-2 text-xs text-[#0b1426]/50">Łącznie opiekunów: {keeperCount}</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 p-8 text-white shadow-[0_30px_60px_-20px_rgba(14,116,144,0.45)]">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Upamiętniona osoba</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                      {pageData.first_name} {pageData.last_name}
                    </h1>
                    <p className="mt-2 text-sm font-medium text-white/80">
                      {pageData.birth_date} – {pageData.death_date || 'Obecnie'}
                    </p>
                    {pageData.short_description && (
                      <p className="mt-6 max-w-xl text-base text-white/85">
                        {pageData.short_description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-4 text-white">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Status strony</span>
                    <button
                      type="button"
                      onClick={togglePublishStatus}
                      disabled={isPublishing}
                      className={`relative flex h-12 w-[280px] items-center justify-between overflow-hidden rounded-full bg-gradient-to-r from-sky-400/85 via-sky-300/75 to-purple-400/85 transition duration-300 ease-out ${
                        isPublishing ? 'opacity-70' : 'hover:shadow-[0_20px_40px_-18px_rgba(14,116,144,0.65)]'
                      }`}
                    >
                      <span
                        className="pointer-events-none absolute rounded-full bg-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.75)] transition-transform duration-300 ease-out"
                        style={sliderKnobStyle}
                        aria-hidden="true"
                      />
                      <span className={`relative z-10 flex-1 px-6 text-center text-sm font-semibold ${pageData.is_public ? 'text-white/70' : 'text-[#0b1426]'}`}>
                        Szkic
                      </span>
                      <span className={`relative z-10 flex-1 px-6 text-center text-sm font-semibold ${pageData.is_public ? 'text-[#0b1426]' : 'text-white/70'}`}>
                        Opublikowano
                      </span>
                    </button>
                    <p className="max-w-[240px] text-right text-[11px] text-white/70">
                      Kliknij, aby przełączyć status strony pamięci. Udostępnianie jest możliwe po publikacji.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 text-gray-900 shadow-[0_30px_60px_-28px_rgba(14,116,144,0.35)] backdrop-blur">
                <nav className="flex gap-2 px-6 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('pamiec');
                      setIsDropdownOpen(false);
                    }}
                    className={`relative rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === 'pamiec' ? 'text-[#0b1426]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pamięć
                    {activeTab === 'pamiec' && (
                      <span className="absolute inset-x-2 bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pamiatki')}
                    className={`relative rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === 'pamiatki' ? 'text-[#0b1426]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pamiątki
                    {activeTab === 'pamiatki' && (
                      <span className="absolute inset-x-2 bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('bliscy');
                      setIsDropdownOpen(false);
                    }}
                    className={`relative rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === 'bliscy' ? 'text-[#0b1426]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bliscy
                    {activeTab === 'bliscy' && (
                      <span className="absolute inset-x-2 bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400" />
                    )}
                  </button>
                </nav>

                <div className="px-6 pb-8">
                  {activeTab === 'pamiatki' && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-inner">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative z-40" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="flex min-w-[220px] items-center justify-between gap-3 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200/60 transition hover:bg-cyan-400"
                          >
                            <span>Dodaj pamiątki</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-[0_24px_55px_-38px_rgba(15,23,42,0.45)] z-40">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Prześlij zdjęcia i filmy</p>
                                <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <PlusIcon className="h-5 w-5 text-cyan-500" />Dodaj pliki
                                </button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Utwórz historie</p>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <PhotoIcon className="h-5 w-5 text-cyan-500" />Dodaj zdjęcia
                                </button>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <VideoCameraIcon className="h-5 w-5 text-cyan-500" />Dodaj film
                                </button>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <GlobeAltIcon className="h-5 w-5 text-cyan-500" />Dodaj stronę
                                </button>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <DocumentTextIcon className="h-5 w-5 text-cyan-500" />Dodaj dokument
                                </button>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-slate-100">
                                  <Squares2X2Icon className="h-5 w-5 text-cyan-500" />Dodaj album
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-600">Zezwól odwiedzającym na pobieranie pamiątek?</span>
                          <label className="relative inline-flex items-center">
                            <input type="checkbox" value="" className="peer sr-only" />
                            <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-cyan-500"></div>
                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={activeTab === 'pamiatki' ? 'mt-8' : 'mt-6'}>
                    {activeTab === 'pamiec' && <PamiecTab />}
                    {activeTab === 'pamiatki' && <PamiatkiTab setIsEditing={setIsEditing} memorialId={parsedId} />}
                    {activeTab === 'bliscy' && <BliscyTab />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-14 text-center text-xs text-[#0b1426]/50">
            © 2025 DlaBliskich. Wszelkie prawa zastrzeżone.
          </footer>
        </div>
      </div>
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1426]/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/15 bg-white/95 shadow-[0_32px_80px_-36px_rgba(15,23,42,0.55)]">
            <div className="flex items-center gap-3 border-b border-white/30 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-4 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/20">
                <LockClosedIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Publikacja strony</p>
                <h3 className="text-lg font-semibold">Czy udostępnić tę stronę publicznie?</h3>
              </div>
              <button
                onClick={() => setIsPublishConfirmOpen(false)}
                className="ml-auto rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
              >
                Zamknij
              </button>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-[#0b1426]/80">
              <p>
                Udostępniając tę stronę jako publiczną, wszystkie inne Twoje publiczne strony zostaną automatycznie ustawione jako prywatne.
                Możesz to zmienić w dowolnym momencie w ustawieniach prywatności.
              </p>
              <div className="rounded-2xl bg-[#ecf2f6] px-4 py-3 text-xs text-[#0b1426]/60">
                <span className="font-semibold text-[#0b1426]">Aktualny status:</span>{' '}
                {pageData.is_public ? 'Strona jest widoczna publicznie.' : 'Strona jest widoczna tylko dla zaproszonych.'}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-white/20 bg-white/90 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsPublishConfirmOpen(false)}
                className="rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
              >
                Anuluj
              </button>
              <button
                onClick={performPublishToggle}
                disabled={isPublishing}
                className={`rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-500/40 ${
                  isPublishing ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isPublishing ? 'Publikowanie…' : 'Udostępnij stronę'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {useLegacyLayout ? legacyLayout : refreshedLayout}
          <EditPageSettingsModal 
            isOpen={isModalOpen} 
            closeModal={closeModal} 
            memorialId={parsedId} 
            pageData={pageData} 
            onRelationsChange={handleRelationsChange}
            defaultTab={modalDefaultTab}
            onUpdate={(newPhotoUrl) => {
              setPhotoLoading(true);
              setPageData((prev: any) => ({ ...prev, photo_url: newPhotoUrl }));
              setTimeout(() => setPhotoLoading(false), 1000);
            }}
            onBannerChange={async (newUrl) => {
              await handleBannerChange(newUrl)
            }}
          />
    </>
  );
}
