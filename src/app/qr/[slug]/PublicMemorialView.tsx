'use client'
import React from 'react'
import PamiatkiTab from '../../../components/MemorialTab/PamiatkiTab';

export default function PublicMemorialView({ data }: { data: any }) {
  if (!data) {
    return <div className="p-8">Nie znaleziono strony pamięci.</div>
  }

  const parsedId = data?.id;

  return (
    <div className="bg-[#f8fbfa] min-h-screen w-full">
      {/* Baner */}
      <div className="w-full h-80 md:h-[22rem] lg:h-[26rem] xl:h-[28rem] overflow-hidden">
        <img
          src={data.banner_url || '/banner1.jpg'}
          className="w-full h-full object-cover"
          style={{
            objectPosition: data.banner_position || '50% 50%',
          }}
          alt="Baner"
        />
      </div>

      {/* Karta z informacjami */}
      <div className="bg-white -mt-20 max-w-6xl mx-auto rounded-lg shadow-md p-6 relative z-10">
        <div className="flex flex-wrap md:flex-nowrap gap-6 w-full">
          {/* Zdjęcie profilowe */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center mt-[4rem] md:mt-[6rem] relative items-center">
            <div className="absolute -top-[185px] z-20">
              <div className="bg-gray-100 rounded-2xl p-1 shadow-md">
                {data.photo_url ? (
                  <img
                    src={data.photo_url}
                    alt="Zdjęcie"
                    className="w-[280px] aspect-square sm:w-[320px] md:w-[360px] object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-[280px] aspect-square sm:w-[320px] md:w-[360px] bg-gray-100 flex items-center justify-center rounded-2xl">
                    <span className="text-gray-400">Brak zdjęcia</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dane */}
          <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center items-center text-center mt-[135px] md:mt-[60px] mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              {data.first_name} {data.last_name}
            </h1>
            <p className="text-base text-gray-600">
              {data.birth_date} - {data.death_date || 'Obecnie'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mt-[-6rem] bg-white max-w-6xl mx-auto rounded-lg shadow-md p-2 pb-2 pt-0 overflow-hidden">
        <PamiatkiTab memorialId={parsedId} isEditing={false} setIsEditing={() => {}} isPublicView={true} />
      </div>

      {/* Stopka */}
      <footer className="text-center text-xs text-gray-400 mt-8 mb-6">
        © 2025 DlaBliskich. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  )
}