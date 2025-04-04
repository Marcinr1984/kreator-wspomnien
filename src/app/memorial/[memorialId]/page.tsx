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
    if (pageData?.banner_position) {
      const [x, y] = pageData.banner_position.split(' ')
      setPosition({ x: parseFloat(x), y: parseFloat(y) })
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
        supabase
          .from('memorial_pages')
          .update({ banner_position: `${position.x}% ${position.y}%` })
          .eq('id', parsedId);
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
        <div className="group relative w-full h-80 md:h-[22rem] lg:h-[26rem] xl:h-[30rem] overflow-hidden">
          <img
            ref={imageRef}
            src={pageData.banner_url || '/banner1.jpg'}
            className={`w-full h-full object-cover transition-all duration-300 select-none z-0 ${repositionMode ? 'cursor-move pointer-events-auto' : 'pointer-events-none'}`}
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
                <button className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition flex items-center gap-2">
                  <span className="text-cyan-500 text-lg">✏️</span>
                  Zmień zdjęcie w tle
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition flex items-center gap-2"
                  onClick={() => setRepositionMode(true)}
                >
                  <span className="text-cyan-500 text-lg">✏️</span>
                  Zmień pozycję zdjęcia
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
                  onClick={() => {
                    supabase.from('memorial_pages').update({ banner_position: `${position.x}% ${position.y}%` }).eq('id', parsedId)
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
        <div className="bg-white -mt-16 pt-24 max-w-4xl mx-auto rounded-lg shadow-md p-6 relative z-10 flex flex-col md:flex-row">
          <div className="absolute -top-32 left-6 md:left-12 z-20">
            <img
              src={pageData.photo_url}
              alt="Zdjęcie"
              className="w-64 h-64 object-cover rounded-md shadow-md border-4 border-white"
            />
          </div>
          <div className="flex flex-col justify-center items-center text-center w-full mt-36 md:mt-0">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              {pageData.first_name} {pageData.last_name}
            </h1>
            <p className="text-sm text-gray-500">
              {pageData.birth_date} - {pageData.death_date || 'Obecnie'}
            </p>
            <div className="mt-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mr-2">Opublikowano</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">Szkic</span>
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