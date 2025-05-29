import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

const PrivacyTab: React.FC<{ pageId: number }> = ({ pageId }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPrivacyStatus = async () => {
      const { data, error } = await supabase
        .from('memorial_pages')
        .select('is_public')
        .eq('id', pageId)
        .single();

      console.log('🔍 FETCH is_public:', { pageId, data, error });

      if (data) setIsPublic(data.is_public);
      setLoading(false);
    };

    if (pageId) fetchPrivacyStatus();
  }, [pageId]);

  const handleToggle = async () => {
    console.log('🔁 TOGGLE start:', { pageId, newStatus: !isPublic });

    const { data, error } = await supabase
      .from('memorial_pages')
      .update({ is_public: !isPublic })
      .eq('id', pageId);

    console.log('🔁 TOGGLE result:', { data, error });

    if (!error) {
      setIsPublic(!isPublic);
      setMessage(`Ustawienie zmienione. Strona jest teraz ${!isPublic ? 'prywatna' : 'publiczna'}.`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="w-full py-10 text-gray-700">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-lg font-semibold mb-4">Udostępnij stronę publicznie</h2>
        <p className="mb-4">
          Możesz włączyć lub wyłączyć publiczne udostępnienie tej strony pamięci. Dzięki temu kod QR będzie prowadził do tej strony.
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
