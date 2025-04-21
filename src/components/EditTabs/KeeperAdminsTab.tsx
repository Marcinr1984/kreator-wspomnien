import React, { useEffect, useState, useRef } from 'react';
// import { TrashIcon } from '@heroicons/react/24/outline';
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
    <div className="w-full flex flex-col md:flex-row gap-16 items-start">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-8">Obecni opiekunowie</h3>
        <p className="text-sm text-gray-500 mb-6">
          Strona jest obecnie zarządzana przez:
        </p>
        <div className="bg-gray-100 p-8 rounded-xl">
          {/* Właściciel */}
          {keepers
            .filter((k) => k.role === 'wlasciciel')
            .map((keeper, index) => (
              <div key={`owner-${index}`} className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm mb-6">
                <p className="font-medium">
                  {keeper.first_name ? `${keeper.first_name} ${keeper.last_name || ''}` : keeper.user_id ?? 'Brak danych'}
                </p>
                <p className="text-sm text-gray-500">Właściciel</p>
              </div>
            ))}

          {/* Opiekunowie */}
          {keepers.filter((k) => k.role === 'opiekun').length > 0 ? (
            <>
              {keepers
                .filter((k) => k.role === 'opiekun')
                .map((keeper, index) => (
                  <div key={`opiekun-${index}`} className="flex gap-4 mb-2">
                    <div className="flex-1 bg-white border border-gray-300 p-4 rounded-lg shadow-sm">
                      <p className="font-medium">
                        {keeper.first_name ? `${keeper.first_name} ${keeper.last_name || ''}` : keeper.user_id ?? 'Brak danych'}
                      </p>
                      <p className="text-sm text-gray-500">Opiekun</p>
                    </div>
                    {ownerId === currentUser?.id && (
                    <div className="w-[80px] flex flex-col justify-center items-center bg-white border border-gray-300 p-2 rounded-lg shadow-sm transition-colors duration-200 hover:border-cyan-600">
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
                        className="text-cyan-600 text-sm flex flex-col items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5 text-cyan-600 mr-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                            />
                          </svg>
                          Usuń
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </>
          ) : (
            <p className="text-sm text-gray-500">Brak przypisanych opiekunów</p>
          )}
        </div>
      </div>

      {/* RIGHT: Sekcja promująca Keeper Plus */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-8">Zaproś opiekuna</h3>
        <p className="text-sm text-gray-500 mb-6">
          Przydziel zaufaną osobę do zarządzania i edycji profilu tej strony pamięci.
        </p>
        <div className="border border-cyan-600 p-8 rounded-xl min-h-[250px] flex flex-col items-center justify-center text-center">
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
          className="space-y-6"
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
    </div>
  );
};

export default KeeperAdminsTab;