'use client'

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
}

import { useState, useEffect, useRef } from 'react'
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../utils/supabaseClient'
import { Dialog } from '@headlessui/react'

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
    longitude: 19.9449799, // Krakow domyślna
    latitude: 50.0646501,
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
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 14,
            duration: 2000,
            essential: true,
          });
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
    return () => clearTimeout(timeout);
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
      mapTitle,
      mapStory,
      mapAddress,
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
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="z-50 w-[1100px] h-[730px] flex flex-col overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
          <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                +
              </div>
              <span className="text-white font-medium">Dodaj miejsce na mapie</span>
            </div>
            <button
              onClick={onClose}
              className="text-black bg-white rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-200"
            >
              Zamknij
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 gap-8 flex">
            <div className="w-[550px] flex-shrink-0 flex flex-col justify-between">
              <div>
                <div className="w-full mb-8">
                  <h3 className="text-lg font-semibold mb-2">Dodaj miejsce na mapie</h3>
                  <p className="text-gray-600 text-sm">
                    Opowiedz historię miejsca, dodaj jego nazwę oraz adres.
                  </p>
                </div>
                <div className="border p-8 rounded-xl bg-white space-y-8">
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Nazwa miejsca
                    </label>
                    <input
                      type="text"
                      value={mapTitle}
                      onChange={(e) => setMapTitle(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                      placeholder="Wprowadź nazwę miejsca"
                      maxLength={100}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{100 - mapTitle.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">Historia miejsca</label>
                    <textarea
                      value={mapStory}
                      onChange={(e) => setMapStory(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50 resize-y"
                      placeholder="Wprowadź historię miejsca"
                      maxLength={1000}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{1000 - mapStory.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Adres
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={mapAddress}
                        onChange={(e) => setMapAddress(e.target.value)}
                        onBlur={() => setTimeout(() => setAddressSuggestions([]), 100)}
                        className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                        placeholder="Wprowadź adres"
                        maxLength={200}
                      />
                      {addressSuggestions.length > 0 && (
                        <ul className="absolute z-50 bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-y-auto w-full shadow-xl">
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
                                className="flex items-start gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 cursor-pointer transition-all"
                              >
                                <svg className="w-4 h-4 mt-1 text-cyan-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0L5.05 13.95a7 7 0 010-9.9zm2.828 2.828a3 3 0 104.244 4.244 3 3 0 00-4.244-4.244z" clipRule="evenodd" />
                                </svg>
                                <span className="block text-left leading-snug">{suggestion}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[430px] flex flex-col">
              <h4 className="text-gray-400 text-xs font-medium mb-4 text-center w-full uppercase" style={{ letterSpacing: '2px' }}>Podgląd mapy</h4>
              <div className="border border-[2px] border-dashed border-cyan-400 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-500 overflow-hidden space-y-0">
                <div className="text-center text-lg font-semibold text-gray-800 break-words whitespace-pre-wrap w-full max-w-[300px] min-h-[50px] overflow-hidden line-clamp-3">
                  {mapTitle || "Nazwa miejsca"}
                </div>
                
                <div className="mt-6 w-full h-[300px] bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 rounded-lg">
                  <Map
                    ref={mapRef}
                    reuseMaps={true}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    initialViewState={{
                      latitude: 50.0646501,
                      longitude: 19.9449799,
                      zoom: 10,
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {coordinates && (
                      <Marker latitude={coordinates.lat} longitude={coordinates.lng} color="red" />
                    )}
                  </Map>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}