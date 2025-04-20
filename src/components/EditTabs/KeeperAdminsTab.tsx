import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useParams } from 'next/navigation';

const KeeperAdminsTab: React.FC = () => {
  const [keepers, setKeepers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const parsedId = Number(params?.memorialId);
  console.log('params:', params);
  const owner = keepers.find(k => k.role?.toLowerCase() === 'wlasciciel');
  // Fallback to currentUser as owner if no 'wlasciciel' record exists
  const ownerId = owner?.user_id;
  console.log('🍺 ownerId:', ownerId, '— currentUser.id:', currentUser?.id);

  useEffect(() => {
    console.log('params:', params);
    console.log('parsedId:', parsedId);
    if (!parsedId || isNaN(parsedId) || !currentUser) return;

    const fetchKeepers = async () => {
      console.log("🔍 Wysyłam zapytanie o keeperów dla memorial_id:", parsedId);

      const { data, error } = await supabase
        .from('full_memorial_keepers')
        .select('user_id, memorial_id, role, first_name, last_name')
                          .eq('memorial_id', Number(parsedId));

      if (error) {
        console.error('❌ Błąd pobierania keeperów:', error);
      } else {
        console.log('✅ Keeperzy z bazy:', data);
        setKeepers(data);
      }
    };

    fetchKeepers();
  }, [params?.memorialId, currentUser]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      const { data: session } = await supabase.auth.getSession();
      console.log("🧾 Rola użytkownika:", session?.session?.user?.role);
    };
    fetchCurrentUser();
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* LEFT: Lista aktualnych keeperów */}
      <div className="flex-1 bg-gray-100 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Obecni opiekunowie</h3>
        <p className="text-sm text-gray-600 mb-4">
          Strona jest obecnie zarządzana przez:
        </p>
        
        {/* Właściciel */}
        {keepers
          .filter((k) => k.role === 'wlasciciel')
          .map((keeper, index) => (
            <div key={`owner-${index}`} className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm mb-2">
              <p className="font-medium">
                {keeper.first_name ? `${keeper.first_name} ${keeper.last_name || ''}` : keeper.user_id ?? 'Brak danych'}
              </p>
              <p className="text-sm text-gray-500">właściciel</p>
            </div>
          ))}

        {/* Opiekunowie */}
        {keepers.filter((k) => k.role === 'opiekun').length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mt-4 mb-2">Udostępnione opiekunom:</p>
            {keepers
              .filter((k) => k.role === 'opiekun')
              .map((keeper, index) => (
                <div key={`opiekun-${index}`} className="relative bg-white border border-gray-300 p-4 rounded-lg shadow-sm mb-2">
                  <p className="font-medium">
                    {keeper.first_name ? `${keeper.first_name} ${keeper.last_name || ''}` : keeper.user_id ?? 'Brak danych'}
                  </p>
                  <p className="text-sm text-gray-500">Opiekun</p>
                  {ownerId === currentUser?.id && (
                    <button
                      onClick={async () => {
                        try {
                          console.log('🧪 Usuwam opiekuna:', keeper.user_id, 'dla memorial_id:', parsedId);
                          
                          const { data: userData, error: sessionError } = await supabase.auth.getUser();
                          const user = userData?.user;

                          if (!user) {
                            console.warn("⚠️ Brak sesji lub użytkownika");
                            console.log("sessionError:", sessionError);
                            return;
                          }

                          console.log("👤 Zalogowany user.id:", user.id);

                          const { error: keeperError } = await supabase.rpc('delete_keeper_if_owner', {
                            keeper_id_input: keeper.user_id,
                            memorial_id_input: parsedId,
                          });

                          if (keeperError) {
                            console.error('❌ Błąd RPC usuwania:', keeperError);
                          } else {
                            console.log('✅ Opiekun usunięty z aplikacji');
                            setKeepers(prev => prev.filter(k => k.user_id !== keeper.user_id));
                          }
                        } catch (err) {
                          console.error('❌ Wyjątek podczas usuwania opiekuna:', err);
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Usuń dostęp
                    </button>
                  )}
                </div>
              ))}
          </>
        ) : (
          <p className="text-sm text-gray-500">Brak przypisanych opiekunów</p>
        )}
      </div>

      {/* RIGHT: Sekcja promująca Keeper Plus */}
      <div className="flex-1 border border-cyan-600 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Zaproś opiekuna</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setInviteStatus('⏳ Szukam użytkownika...');

            const { data: userId, error: userError } = await supabase
              .rpc('get_user_id_by_email', { input_email: inviteEmail });

            console.log('📤 Szukam użytkownika o emailu:', inviteEmail);
            console.log('📊 Zapytanie poszło do tabeli public.users');
            console.log('📥 userId z RPC:', userId);
            console.log('📛 error z RPC:', userError);

            if (userError || !userId) {
              setInviteStatus('❌ Użytkownik nie istnieje.');
              return;
            }

            const {
              data: { user: currentUser },
            } = await supabase.auth.getUser();

            const { error } = await supabase.from('memorial_invites').insert([
              {
                user_id: userId,
                memorial_id: parsedId,
                role: 'opiekun',
                status: 'oczekuje',
                added_by: currentUser?.id,
              },
            ]);

            if (error) {
              setInviteStatus('❌ Błąd podczas zapraszania.');
            } else {
              setInviteStatus('✅ Zaproszenie wysłane!');
              setInviteEmail('');
              emailInputRef.current?.blur();
            }
          }}
          className="space-y-4"
        >
          <input
            type="email"
            required
            placeholder="Adres e-mail użytkownika"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            ref={emailInputRef}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md font-medium shadow"
          >
            Wyślij zaproszenie
          </button>
          {inviteStatus && <p className="text-sm text-gray-600">{inviteStatus}</p>}
        </form>
      </div>
    </div>
  );
};

export default KeeperAdminsTab;