import React, { useEffect, useState } from 'react';

// Upewnij się, że userId jest wymagany jako prop
interface PrivacyTabProps {
  pageId: number;
  supabase: any;
  userId: string;
  slug: string;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ pageId, supabase, userId, slug }) => {
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

  const handleToggle = async () => {
    console.log('🔁 TOGGLE start:', { pageId, newStatus: !isPublic });

    try {
      if (!isPublic) {
        const confirmed = window.confirm(
          'Publikując tę stronę jako publiczną, wszystkie inne Twoje strony zostaną ustawione jako prywatne. Czy na pewno chcesz kontynuować?'
        );
        if (!confirmed) return;
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
          .in('id', userPages.map(p => p.id));

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

  return (
    <div className="w-full py-10 text-gray-700">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-lg font-semibold mb-4">Udostępnij stronę publicznie</h2>
        <p className="mb-4">
          Możesz włączyć lub wyłączyć publiczne udostępnienie tej strony pamięci. Dzięki temu kod QR będzie prowadził do tej strony. 
          Uwaga: publikując tę stronę jako publiczną, inne Twoje publiczne strony zostaną automatycznie ustawione jako prywatne.
        </p>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded font-semibold text-white transition-all ${
            isPublic ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Ładowanie...' : isPublic ? 'Wyłącz dostęp publiczny' : 'Udostępnij publicznie'}
        </button>

        {message && <p className="mt-4 text-sm text-cyan-700">{message}</p>}

        <div className="mt-6 text-sm">
          Status: <span className={`font-bold ${isPublic ? 'text-green-600' : 'text-red-600'}`}>
            {isPublic ? 'Publiczna' : 'Prywatna'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTab;
