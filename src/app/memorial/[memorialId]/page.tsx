'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'

export default function MemorialPage() {
  const params = useParams()
  const memorialId = params.memorialId
  console.log('Parametr memorialId:', memorialId)

  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [repositionMode, setRepositionMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

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

  if (loading) {
    return <div className="p-8">Ładowanie...</div>
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
          <div className="absolute top-16 inset-x-0 flex justify-center transition-opacity duration-300 group-hover:opacity-100 z-20">
            {!repositionMode && (
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white px-4 py-2 rounded-full shadow-md hover:bg-cyan-100 transition flex items-center gap-2">
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

        {/* Przywrócone zdjęcie profilowe */}
        <div className="absolute top-[20rem] left-[35%] transform -translate-x-[calc(50%-70px)] z-30">
            <div className="bg-gray-100 rounded-2xl p-1 shadow-md">
            <img
              src={pageData.photo_url}
              alt="Zdjęcie"
              className="w-80 h-80 object-cover rounded-xl"
            />
          </div>
        </div>
        {/* Sekcja z kartą */}
        <div className="bg-white -mt-20 max-w-6xl mx-auto rounded-lg shadow-md p-6 relative z-10">
          <div className="flex flex-wrap md:flex-nowrap gap-6 w-full">
            {/* Lewa kolumna */}
            <div className="w-full md:w-1/2 flex justify-center -ml-[2.325rem] mt-[18rem] md:mt-50">
              <div className="bg-gray-100 rounded-xl p-4 shadow-sm w-80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Opiekunowie pamięci (1)</span>
                  <a href="#" className="text-sm text-cyan-600 hover:underline">Zobacz więcej</a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                    MR
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Marcin rud <span className="text-xs text-gray-500">(ty)</span></p>
                    <p className="text-xs text-gray-500">Dziecko</p>
                  </div>
                </div>
              </div>
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
                <div className="flex items-center justify-center bg-gradient-to-r from-cyan-400 to-rose-400 text-white text-sm font-medium rounded-full px-6 py-3 w-fit shadow-md relative">
                  <span className="mr-4">Opublikowano</span>
                  <span className="opacity-70">Szkic</span>
                  <span className="absolute -top-2 -right-2 bg-slate-800 p-1 rounded-full text-white text-xs">
                    🔒
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sekcja przycisków */}
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm shadow-sm">Podgląd</button>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm">Ustawienia strony</button>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm">Udostępnij</button>
        </div>

        {/* Sekcja wspomnień */}
        <div className="bg-white mt-6 max-w-4xl mx-auto rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Wspomnienia</h2>
          <p className="text-sm text-gray-600">Tutaj będą szczegóły, wspomnienia itd...</p>
        </div>

        {/* Sekcja upamiętnień */}
        <div className="bg-white mt-6 max-w-4xl mx-auto rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Upamiętnienia</h2>
          <p className="text-sm text-gray-500 italic">Brak wiadomości. Bądź pierwszym, który coś doda.</p>
          <div className="mt-4">
            <textarea
              placeholder="Napisz wiadomość, wspomnienie, kondolencje..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
            />
            <div className="flex justify-between mt-2">
              <button className="text-cyan-600 text-sm hover:underline">Dodaj zdjęcia i filmy</button>
              <button className="bg-cyan-600 text-white px-4 py-1 rounded-md text-sm">Opublikuj</button>
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