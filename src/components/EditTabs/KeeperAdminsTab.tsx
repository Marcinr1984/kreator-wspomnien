"use client";
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
    if (!parsedId || isNaN(parsedId)) return;

    const fetchKeepers = async () => {
      try {
        const { data, error } = await supabase
          .from('memorial_keepers')
          .select(`
            user_id,
            role,
            "auth"."users" (
              email,
              raw_user_meta_data
            )
          `)
          .eq('memorial_id', parsedId)
          .in('role', ['wlasciciel', 'opiekun']);

        if (error) throw error;
        setKeepers(data || []);
        console.log('✅ Pobrani keeperzy:', data);
      } catch (err) {
        console.error('❌ Błąd pobierania keeperów:', err);
      }
    };

    fetchKeepers();
  }, [parsedId]);

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
    <div className="flex w-full flex-col gap-8 text-slate-700 lg:flex-row">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900">Obecni opiekunowie</h3>
        <p className="mt-1 text-sm text-slate-500">
          Strona jest obecnie zarządzana przez:
        </p>
        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-100 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]">
          {/* Właściciel */}
          {keepers
            .filter((k) => k.role === 'wlasciciel')
            .map((keeper, index) => (
              <div key={`owner-${index}`} className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm">
                <p className="font-medium">
                  {keeper['auth.users']?.raw_user_meta_data?.first_name
                    ? `${keeper['auth.users'].raw_user_meta_data.first_name} ${keeper['auth.users'].raw_user_meta_data.last_name || ''}`
                    : keeper.user_id ?? 'Brak danych'}
                </p>
                <p className="text-sm text-slate-500 capitalize">{keeper.role}</p>
              </div>
            ))}

          {/* Opiekunowie */}
          {keepers.filter((k) => k.role === 'opiekun').length > 0 ? (
            <>
              {keepers
                .filter((k) => k.role === 'opiekun')
                .map((keeper, index) => (
                  <div key={`opiekun-${index}`} className="flex gap-3">
                    <div className="flex-1 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm">
                      <p className="font-medium">
                        {keeper['auth.users']?.raw_user_meta_data?.first_name
                          ? `${keeper['auth.users'].raw_user_meta_data.first_name} ${keeper['auth.users'].raw_user_meta_data.last_name || ''}`
                          : keeper.user_id ?? 'Brak danych'}
                      </p>
                      <p className="text-sm text-slate-500 capitalize">{keeper.role}</p>
                    </div>
                    {ownerId === currentUser?.id && (
                    <div className="flex w-[100px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-rose-300 hover:text-rose-500">
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
                        className="flex flex-col items-center gap-2 text-xs font-semibold text-rose-500"
                        >
                          <svg
                            className="h-5 w-5 text-rose-500"
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
            <p className="text-sm text-slate-500">Brak przypisanych opiekunów</p>
          )}
        </div>
      </div>

      {/* RIGHT: Sekcja promująca Keeper Plus */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900">Zaproś opiekuna</h3>
        <p className="mt-1 text-sm text-slate-500">
          Przydziel zaufaną osobę do zarządzania i edycji profilu tej strony pamięci.
        </p>
        <div className="rounded-[24px] border border-slate-100 bg-white/95 p-6 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]">
          <form className="space-y-4"
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
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
          >
            Wyślij zaproszenie
          </button>
          {inviteStatus && <p className="text-sm font-semibold text-cyan-600">{inviteStatus}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default KeeperAdminsTab;