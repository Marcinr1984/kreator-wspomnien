'use client'

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
}

import { Fragment, useState, useEffect, useRef, CSSProperties } from 'react'
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../utils/supabaseClient'
import { Dialog, Transition } from '@headlessui/react'

interface AddMapModalProps {
  isOpen: boolean
  onClose: (newMap?: any) => void
  memorialId: string | number
  editingMap?: any | null;
}

export default function AddMapModal({ isOpen, onClose, memorialId, editingMap }: AddMapModalProps) {
  const [mapTitle, setMapTitle] = useState('');
  const [mapStory, setMapStory] = useState('');
  const [mapAddress, setMapAddress] = useState('');
  const [loading, setLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 50.7284, //domyslny dzierzoniow
    longitude: 16.6517,
    zoom: 10,
  });
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);

  const mapRef = useRef<any>(null);

useEffect(() => {
    if (editingMap) {
      setMapTitle(editingMap.content?.title || '');
      setMapStory(editingMap.content?.story || '');
      setMapAddress(editingMap.content?.address || '');
      setCoordinates({
        lat: editingMap.content?.lat || 0,
        lng: editingMap.content?.lng || 0,
      });
    }
  }, [editingMap]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!mapAddress || mapAddress.length < 3) {
        setCoordinates(null);
        return;
      }
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapAddress)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&types=address,place,postcode,locality&limit=5&language=pl&country=pl`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCoordinates({ lat, lng });
          if (mapRef.current && mapRef.current.flyTo) {
            mapRef.current.flyTo({
              center: [lng, lat],
              zoom: 14,
              duration: 2000,
              essential: true,
            });
          }
        }
      } catch (e) {
        setCoordinates(null);
      }
    };
    const fetchSuggestions = async () => {
      if (!mapAddress || mapAddress.length < 3) return;
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapAddress)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&types=address,place,postcode,locality&limit=5&language=pl&country=pl`
        );
        const data = await response.json();
        if (data.features) {
          const suggestions = data.features
            .filter((f: any) => !f.place_type?.includes('region'))
            .map((f: any) => {
              const placeParts = [];

              if (f.address) placeParts.push(f.text + ' ' + f.address);
              else placeParts.push(f.text);

              if (f.context) {
                const contextFiltered = f.context.filter(
                  (c: any) => !c.id.startsWith('region') && !c.id.startsWith('district')
                );
                contextFiltered.forEach((c: any) => {
                  placeParts.push(c.text);
                });
              }

              return placeParts.join(', ');
            });
          setAddressSuggestions(suggestions);
        }
      } catch (e) {
        setAddressSuggestions([]);
      }
    };
    const timeout = setTimeout(() => {
      fetchCoordinates();
      fetchSuggestions();
    }, 600);
    return () => {
      clearTimeout(timeout);
      setCoordinates(null);
      setAddressSuggestions([]);
    };
  }, [mapAddress]);

  const handleSave = async () => {
    if (!mapTitle.trim() && !mapStory.trim() && !mapAddress.trim()) {
      alert('Proszę wpisać nazwę miejsca, historię lub adres.');
      return;
    }
    setLoading(true);

    const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId;

    // Przygotowanie struktury danych (bez zapisu)
    const content = {
      title: mapTitle,
      story: mapStory,
      address: mapAddress,
    };

    // Tutaj można dodać zapis do bazy danych, gdy będzie gotowy
    if (coordinates) {
      console.log('Próba zapisu do memorial_maps z:', {
        memorial_id: parsedId,
        title: mapTitle,
        story: mapStory,
        address: mapAddress,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      let error = null;

      if (editingMap) {
        const res = await supabase.from('memorial_maps').update({
          title: mapTitle,
          story: mapStory,
          address: mapAddress,
          lat: coordinates.lat,
          lng: coordinates.lng,
        }).eq('id', parseInt(editingMap.id.replace('map-', '')));
        error = res.error;
      } else {
        const res = await supabase.from('memorial_maps').insert({
          memorial_id: parsedId,
          title: mapTitle,
          story: mapStory,
          address: mapAddress,
          lat: coordinates.lat,
          lng: coordinates.lng,
        });
        error = res.error;
      }

      if (error) {
        console.error('Błąd zapisu do memorial_maps:', error);
      } else {
        console.log('Zapis udany do memorial_maps');
      }
    } else {
      console.warn('Brak współrzędnych – zapis pominięty');
    }

    setLoading(false);
    onClose({
      id: `map-${Date.now()}`,
      type: 'map',
      content: {
        title: mapTitle,
        story: mapStory,
        address: mapAddress,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
      },
    });
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={() => onClose()}>
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
              <Dialog.Panel className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-lg font-semibold">
                        +
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Dodaj miejsce na mapie</Dialog.Title>
                        <p className="mt-1 max-w-xl text-sm text-white/85">Opowiedz historię ważnego punktu i przypnij go do mapy pamięci, aby odwiedzający mogli łatwo go odnaleźć.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onClose()}
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-10 bg-white/95 px-6 py-8 sm:px-10">
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-[#0b1426]">Informacje o miejscu</h3>
                        <p className="text-sm text-[#0b1426]/70">Uzupełnij nazwę, krótką historię oraz adres, a następnie zaznacz lokalizację na mapie.</p>
                      </div>
                      <div className="rounded-[28px] border border-[#dde5ec] bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)] space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#0b1426] mb-2">Nazwa miejsca</label>
                          <input
                            type="text"
                            value={mapTitle}
                            onChange={(e) => setMapTitle(e.target.value)}
                            className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            placeholder="Wprowadź nazwę miejsca"
                            maxLength={100}
                          />
                          <div className="text-right text-xs text-[#0b1426]/40 mt-1">{100 - mapTitle.length} znaków pozostało</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0b1426] mb-2">Historia miejsca</label>
                          <textarea
                            value={mapStory}
                            onChange={(e) => setMapStory(e.target.value)}
                            className="min-h-[140px] w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            placeholder="Opisz znaczenie umieszczanego miejsca"
                            maxLength={1000}
                          />
                          <div className="text-right text-xs text-[#0b1426]/40 mt-1">{1000 - mapStory.length} znaków pozostało</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0b1426] mb-2">Adres</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={mapAddress}
                              onChange={(e) => setMapAddress(e.target.value)}
                              onBlur={() => setTimeout(() => setAddressSuggestions([]), 100)}
                              className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                              placeholder="Wprowadź adres lub nazwę miejscowości"
                              maxLength={200}
                            />
                            {addressSuggestions.length > 0 && (
                              <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#dce4ed] bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                                {addressSuggestions
                                  .filter((suggestion) => suggestion !== mapAddress)
                                  .map((suggestion, index) => (
                                    <li
                                      key={index}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setMapAddress(suggestion);
                                        setAddressSuggestions([]);
                                      }}
                                      className="flex items-start gap-3 px-4 py-3 text-sm text-[#0b1426]/80 transition hover:bg-cyan-50 cursor-pointer"
                                    >
                                      <svg className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0L5.05 13.95a7 7 0 010-9.9zm2.828 2.828a3 3 0 104.244 4.244 3 3 0 00-4.244-4.244z" clipRule="evenodd" />
                                      </svg>
                                      <span className="leading-snug">{suggestion}</span>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40 text-center lg:text-left">Podgląd mapy</div>
                      <div className="overflow-hidden rounded-[28px] border border-[#dce4ed] bg-white/90 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)]">
                        <div className="px-6 pt-6 text-center">
                          <p className="text-base font-semibold text-[#0b1426] line-clamp-3 min-h-[60px]">
                            {mapTitle || 'Nazwa miejsca'}
                          </p>
                          <p className="mt-2 text-xs text-[#0b1426]/60 line-clamp-3 min-h-[42px]">
                            {mapStory || 'Krótki opis pojawi się tutaj po wypełnieniu formularza.'}
                          </p>
                        </div>
                        <div className="mt-6 h-[320px] border-t border-[#dce4ed] bg-[#f6f9fc]">
                          <Map
                            ref={mapRef}
                            reuseMaps={true}
                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                            initialViewState={{ latitude: 50.7284, longitude: 16.6517, zoom: 10 }}
                            mapStyle="mapbox://styles/mapbox/streets-v11"
                            style={{ width: '100%', height: '100%' }}
                          >
                            {coordinates && (
                              <Marker latitude={coordinates.lat} longitude={coordinates.lng} color="#06b6d4" />
                            )}
                          </Map>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/30 bg-white/90 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    onClick={() => onClose()}
                    className="rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 ${
                      loading ? 'cursor-wait opacity-80' : ''
                    }`}
                  >
                    {loading ? 'Zapisywanie…' : 'Zapisz miejsce'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
