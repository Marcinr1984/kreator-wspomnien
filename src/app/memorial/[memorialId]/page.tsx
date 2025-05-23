'use client'

import { useEffect, useRef, useState } from 'react'
import EditPageSettingsModal from '../../../components/EditPageSettingsModal';
import {
  LockClosedIcon,
  PlusIcon,
  PhotoIcon,
  VideoCameraIcon,
  GlobeAltIcon,
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

  const [pageData, setPageData] = useState<any>(null)
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [repositionMode, setRepositionMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('pamiec')
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    setPageData((prev: any) => ({ ...prev, banner_url: newUrl }))
    await supabase
      .from('memorial_pages')
      .update({ banner_url: newUrl })
      .eq('id', parsedId)
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

  return (
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
            <button className="bg-white px-4 py-2.5 rounded-md shadow-md hover:bg-gray-100 text-sm font-medium text-gray-800 pointer-events-auto flex items-center gap-2">
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
                    <p className="text-sm font-medium text-gray-800">Marcin rud <span className="text-xs text-gray-500">(ty)</span></p>
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
                <div className="flex items-center justify-center bg-gradient-to-r from-cyan-400 to-rose-400 text-white text-sm font-medium rounded-full px-6 py-4 w-fit shadow-md relative">
                  <span className="mr-4">Opublikowano</span>
                  <span className="opacity-70">Szkic</span>
                  <span className="absolute -top-2 -right-2 bg-slate-800 p-1.5 rounded-full text-white text-xs border-4 border-white">
                    <LockClosedIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

          </div>
          
        </div>
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
          />
          
      </div>
    </div>
  )
}