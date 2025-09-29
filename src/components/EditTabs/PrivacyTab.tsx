'use client';
import React, { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

// Upewnij się, że userId jest wymagany jako prop
interface PrivacyTabProps {
  pageId: number;
  supabase: any;
  userId: string;
  slug: string;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ pageId, supabase, userId, slug: _slug }) => {
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchUidAndPrivacyStatus = async () => {
      try {
        console.log('🔍 Sprawdzanie publiczności strony, pageId:', pageId);

        const { data: pageData, error, status } = await supabase
          .from('memorial_pages')
          .select('id, is_public')
          .eq('id', pageId)
          .maybeSingle();

        console.log('🔍 FETCH is_public:', { pageId, pageData, error, status });

        if (pageData?.is_public !== undefined) {
          setIsPublic(pageData.is_public);
        } else {
          console.warn('⚠️ Brak danych lub brak dostępu do rekordu.');
        }
      } catch (err) {
        console.error('❌ Błąd przy pobieraniu statusu publiczności:', err);
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      fetchUidAndPrivacyStatus();
    }
  }, [pageId]);

  const performToggle = async () => {
    console.log('🔁 TOGGLE start:', { pageId, newStatus: !isPublic });

    try {
      if (!isPublic) {
        // Jeśli ustawiamy aktualną stronę jako publiczną – dezaktywuj inne strony tego użytkownika
        const { data: userPages, error: userPagesError } = await supabase
          .from('memorial_pages')
          .select('id')
          .eq('user_id', userId)
          .eq('is_public', true)
          .neq('id', pageId);

        if (userPagesError) {
          console.error('❌ Błąd przy pobieraniu stron do dezaktywacji:', userPagesError);
          alert('Błąd przy aktualizacji innych stron.');
          return;
        }

        const { error: updateError } = await supabase
          .from('memorial_pages')
          .update({ is_public: false })
          .in('id', userPages.map((p: { id: number }) => p.id));

        if (updateError) {
          console.error('❌ Błąd przy ustawianiu innych stron jako prywatne:', updateError);
          alert('Błąd przy aktualizacji innych stron.');
          return;
        }
      }

      const { data: updated, error } = await supabase
        .from('memorial_pages')
        .update({ is_public: !isPublic })
        .eq('id', pageId)
        .select('id, is_public')
        .maybeSingle();

      console.log('🔁 TOGGLE result:', updated, error);

      if (error || !updated) {
        console.error('❌ Błąd zapisu:', error);
        alert(`Błąd zapisu: ${error?.message || 'Brak danych'}`);
        return;
      }

      setIsPublic(updated.is_public);
      setMessage(`Ustawienie zmienione. Strona jest teraz ${updated.is_public ? 'publiczna' : 'prywatna'}.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Błąd ogólny:', err);
      alert('Wystąpił błąd.');
    }
  };

  const handleToggleClick = () => {
    if (!isPublic) {
      setIsConfirmModalOpen(true);
    } else {
      performToggle();
    }
  };

  return (
    <div className="space-y-6 text-slate-700">
      <div className="mx-auto max-w-xl rounded-[24px] border border-slate-100 bg-white/95 p-6 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
        <h2 className="text-lg font-semibold text-slate-900">Udostępnij stronę publicznie</h2>
        <p className="mt-3 text-sm text-slate-500">
          Możesz włączyć lub wyłączyć publiczne udostępnienie tej strony pamięci. Udostępniając ją, kod QR będzie zawsze prowadził do tego miejsca.
          Gdy ustawisz stronę jako publiczną, pozostałe Twoje strony zostaną automatycznie ustawione jako prywatne.
        </p>
        <button
          onClick={handleToggleClick}
          className={`mt-4 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
            isPublic
              ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 hover:shadow-rose-500/50'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-emerald-500/50'
          }`}
          disabled={loading}
        >
          {loading ? 'Ładowanie…' : isPublic ? 'Wyłącz dostęp publiczny' : 'Udostępnij publicznie'}
        </button>

        {message && <p className="mt-4 text-sm font-semibold text-cyan-600">{message}</p>}

        <div className="mt-6 text-sm text-slate-500">
          Status: <span className={`font-semibold ${isPublic ? 'text-emerald-600' : 'text-rose-600'}`}>{isPublic ? 'Publiczna' : 'Prywatna'}</span>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1426]/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500">
                  <TrashIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Udostępnić stronę publicznie?</h3>
                  <p className="mt-2 text-sm text-slate-500">Udostępnienie tej strony spowoduje automatyczne ukrycie innych Twoich publicznych stron. Możesz zmienić tę decyzję w dowolnym momencie.</p>
                </div>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Zamknij
                </button>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    performToggle();
                  }}
                  className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50"
                >
                  Udostępnij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrivacyTab;
