'use client'

import { Dialog } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'
import ImageCropper from './ImageCropper'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AddPhotoModalProps {
  isOpen: boolean
  onClose: (newPhoto?: any) => void
  memorialId: string | number
  editingPhoto?: any | null;
}

export default function AddPhotoModal({ isOpen, onClose, memorialId, editingPhoto }: AddPhotoModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [layout, setLayout] = useState<'left' | 'right'>('right');
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Cropper states
  const cropperRef = useRef<any>(null);
  const [isCropping, setIsCropping] = useState(true);
  const [editablePhotoUrl, setEditablePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editingPhoto) {
      const { title, date, description, layout, image_url } = editingPhoto.content || {};
      setTitle(title || '');
      setDate(date || '');
      setDescription(description || '');
      setLayout(layout || 'right');

      if (image_url) {
        fetch(image_url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `photo-from-db-${Date.now()}.jpeg`, { type: blob.type });
            setFile(file);
          });
      }
    } else {
      setTitle('');
      setDate('');
      setDescription('');
      setLayout('right');
      setFile(null);
    }
  }, [editingPhoto]);

  useEffect(() => {
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setEditablePhotoUrl(localUrl);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    let image_url = null;

    // Jeśli edytujemy istniejące zdjęcie i nadpisujemy je nowym, usuń stare
    if (editingPhoto?.content?.image_path && file) {
      const path = editingPhoto.content.image_path;
      const { error: deleteError } = await supabase
        .storage
        .from('memorial-photos')
        .remove([path]);
      if (deleteError) {
        console.error('❌ Błąd usuwania starego zdjęcia:', deleteError.message);
      } else {
        console.log('✅ Usunięto stare zdjęcie:', path);
      }
    }

    let filePath = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${memorialId}/${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(fileName, file);

      if (uploadError) {
        alert('Błąd podczas przesyłania zdjęcia.');
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('memorial-photos')
        .getPublicUrl(fileName);
      const filePathTemp = fileName;
      filePath = filePathTemp;
      image_url = publicUrlData.publicUrl;
    }

    const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId;

    if (editingPhoto) {
      const { error } = await supabase
        .from('memorial_mementos')
        .update({
          content: {
            title,
            date,
            description,
            layout,
            image_url: image_url || editingPhoto.content?.image_url,
            image_path: filePath || editingPhoto.content?.image_path,
          }
        })
        .eq('id', editingPhoto.id);

      if (error) {
        alert('Błąd podczas aktualizacji.');
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from('memorial_mementos').insert({
        memorial_id: parsedId,
        type: 'photo',
        content: {
          title,
          date,
          description,
          layout,
          image_url,
          image_path: filePath,
        },
      });

      if (error) {
        alert('Błąd podczas zapisu do bazy.');
        console.error(error);
        return;
      }
    }

    onClose(); // zamknij modal po zapisaniu
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="z-50 w-[1300px] rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                +
              </div>
              <span className="text-white font-medium">Dodaj zdjęcie</span>
            </div>
            <button
              onClick={() => onClose()}
              className="text-black bg-white rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-200"
            >
              Zamknij
            </button>
          </div>
          <div className="p-6 mt-4">
            <div className="flex gap-6 px-2.5">
              {/* Nagłówek i opis */}
              <div className="w-[600px]">
                <div className="space-y-1 mb-6">
                  <h2 className="text-xl font-semibold">Utwórz historię zdjęcia</h2>
                  <p className="text-gray-600 text-sm">
                    Podkreśl jedno wspomnienie lub wydarzenie z życia za pomocą pojedynczego zdjęcia. Chcesz dodać więcej zdjęć?{' '}
                    <span className="text-cyan-500 underline cursor-pointer">Utwórz historię albumu</span> zamiast tego.
                  </p>
                </div>
                {/* Formularz */}
                <div className="space-y-6 border border-gray-200 rounded-xl p-6 bg-white">
              <div className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative space-y-4`}>
                {file && (
                  <div className="flex items-center gap-4 justify-center bg-white p-4 rounded-md">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 rounded object-cover" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-2 h-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        Zdjęcie zostało dodane
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 text-cyan-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setFile(null)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <input type="file" className="hidden" id="upload" onChange={handleFileChange} />
                  <label htmlFor="upload" className="cursor-pointer inline-block bg-cyan-500 text-white px-4 py-2 rounded-md">
                    + Dodaj plik
                  </label>
                  <p className="text-sm mt-2 text-gray-500">lub przeciągnij tutaj</p>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Co przedstawia to zdjęcie? <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-3 bg-gray-50 placeholder-gray-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Wpisz tytuł zdjęcia"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Kiedy to się wydarzyło? <span className="text-gray-400 text-sm">(opcjonalnie)</span></label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-3 bg-gray-50 placeholder-gray-400"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="dd.mm.rrrr"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Opowiedz historię zdjęcia</label>
                <textarea
                  className="w-full border rounded-lg p-3 bg-gray-50 placeholder-gray-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Opowiedz historię zdjęcia"
                />
              </div>
                </div>
              </div>

            {/* Podgląd i wybór układu */}
            <div className="w-[600px] flex-shrink-0">
              <div className="flex justify-center mt-4">
                <h4 className="text-gray-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">PODGLĄD</h4>
              </div>
              <div className="border-2 border-dashed border-cyan-400 rounded-xl bg-white p-10 space-y-4 text-sm text-gray-600">
                {isEditing ? (
                  <div className="text-center">
                    <div className="w-full flex justify-center">
                      <div className="w-[300px] h-[300px]">
                        {isCropping && editablePhotoUrl && (
                          <ImageCropper
                            ref={cropperRef}
                            imageUrl={editablePhotoUrl}
                            onCropComplete={(blob: Blob) => {
                              const file = new File([blob], `photo-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                              setFile(file);
                              setIsCropping(false);
                              setIsEditing(false);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={async () => {
                          if (cropperRef.current?.getCroppedImage) {
                            const blob = await cropperRef.current.getCroppedImage();
                            if (blob) {
                              const file = new File([blob], `photo-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                              setFile(file);
                            }
                          }
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm"
                      >
                        Zapisz
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-semibold text-black">Wybierz układ</h3>
                    <p className="text-sm">Wybierz sposób wyświetlania tej historii zdjęcia w sekcji Życie i Pamiątki na stronie pamięci.</p>

                    <div
                      className={`p-3 border rounded-lg cursor-pointer flex gap-4 items-center ${layout === 'left' ? 'border-cyan-500' : 'border-gray-200'}`}
                      onClick={() => setLayout('left')}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-cyan-400 mx-2">
                        {layout === 'left' && <div className="w-3 h-3 rounded-full bg-cyan-400"></div>}
                      </div>
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 rounded-xl object-cover border" />
                      ) : (
                        <div className="w-32 h-32 rounded-xl flex items-center justify-center bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">{date ? new Date(date).toLocaleDateString('pl-PL') : "Data"}</p>
                        <p className="font-bold text-base">{title || "Tytuł"}</p>
                        <p className="text-xs text-gray-500">{description || "Twój tekst pojawi się tutaj"}</p>
                      </div>
                    </div>

                    <div
                      className={`p-3 border rounded-lg cursor-pointer flex gap-4 items-center justify-between ${layout === 'right' ? 'border-cyan-500' : 'border-gray-200'}`}
                      onClick={() => setLayout('right')}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-cyan-400 mx-2">
                        {layout === 'right' && <div className="w-3 h-3 rounded-full bg-cyan-400"></div>}
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-sm text-gray-500">{date ? new Date(date).toLocaleDateString('pl-PL') : "Data"}</p>
                        <p className="font-bold text-base">{title || "Tytuł"}</p>
                        <p className="text-xs text-gray-500">{description || "Twój tekst pojawi się tutaj"}</p>
                      </div>
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 rounded-xl object-cover border" />
                      ) : (
                        <div className="w-32 h-32 rounded-xl flex items-center justify-center bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>

          </div>
          <div className="flex justify-end px-6 py-4 border-t bg-[#f9fafb] rounded-b-2xl">
            <button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              disabled={!title.trim()}
            >
              Zapisz
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}