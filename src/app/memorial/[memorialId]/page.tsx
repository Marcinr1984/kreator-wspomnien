'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'

export default function MemorialPage() {
  const params = useParams()
  const memorialId = params.memorialId
  console.log('Parametr memorialId:', memorialId)

  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        <div
          className="relative w-full h-56 md:h-64 lg:h-72 xl:h-80 bg-cover bg-center transition-all duration-300"
          style={{ backgroundImage: `url(${pageData.banner_url || '/banner1.jpg'})` }}
        >
          <div className="absolute top-2 right-2 flex gap-2 bg-white bg-opacity-60 p-2 rounded-md shadow-md">
            {['banner1.jpg', 'banner2.jpg', 'banner3.jpg'].map((file) => (
              <button
                key={file}
                className="w-12 h-12 rounded overflow-hidden border border-gray-300 hover:ring-2 ring-cyan-600 transition-all"
                onClick={() => handleBannerChange(`/${file}`)}
              >
                <img
                  src={`/${file}`}
                  alt={file}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Sekcja z kartą */}
        <div className="bg-white -mt-16 pt-24 max-w-4xl mx-auto rounded-lg shadow-md p-6 relative z-10 flex flex-col items-center">
          <div className="absolute -top-24 left-8 md:left-16 z-20">
            <img
              src={pageData.photo_url}
              alt="Zdjęcie"
              className="w-56 h-56 object-cover rounded-md shadow-md mb-4 border-4 border-white"
            />
          </div>
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