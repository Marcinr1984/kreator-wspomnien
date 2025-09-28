'use client';

import { UserCircleIcon } from '@heroicons/react/24/outline';
import { UsersIcon, TagIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

type MemorialPage = {
  id: number;
  first_name: string;
  last_name: string;
  user_id: string;
  photo_url: string | null;
};

export default function KeeperPagesSection() {
  const [keeperPages, setKeeperPages] = useState<MemorialPage[]>([]);
  const [hasPages, setHasPages] = useState(false);
  const router = useRouter();

  const fetchKeeperPages = async (user: any) => {
    console.log('👤 Użytkownik (z subskrypcji lub sesji):', user);

    const { data: keeperLinks, error: keepersError } = await supabase
      .from('memorial_keepers')
      .select('memorial_id')
      .eq('user_id', user.id)
      .eq('role', 'opiekun');

    console.log('🔗 keeperLinks [data]:', keeperLinks);
    console.log('🧨 keeperLinks [error]:', keepersError);
    console.log('📦 keeperLinks (string):', JSON.stringify(keeperLinks, null, 2));

    if (!keeperLinks || keeperLinks.length === 0) {
      console.warn('⚠️ Brak przypisanych stron jako opiekun');
      setKeeperPages([]);
      setHasPages(false);
      return;
    }

    const memorialIds = keeperLinks.map(k => k.memorial_id);
    console.log('🆔 memorialIds:', memorialIds);

    const { data: pages, error: pagesError } = await supabase
      .from('memorial_pages')
      .select('id, first_name, last_name, user_id, photo_url')
      .in('id', memorialIds);

    console.log('📄 pages [data]:', pages);
    console.log('💥 pages [error]:', pagesError);
    console.log('📦 pages (string):', JSON.stringify(pages, null, 2));

    if (!pages || pages.length === 0) {
      console.warn('⚠️ Brak danych stron do wyświetlenia');
      setKeeperPages([]);
      setHasPages(false);
      return;
    }

    setKeeperPages(pages ?? []);
    setHasPages(true);
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) {
        console.warn('❗ Brak sesji lub użytkownika');
        console.log('🧪 sessionError:', userError);
        return;
      }
      fetchKeeperPages(user);
    };

    getInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchKeeperPages(session.user);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!hasPages) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 mt-10 mb-16">
      <div className="bg-white rounded-[28px] shadow-[0_25px_70px_-40px_rgba(15,82,109,0.35)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Strony, których jesteś opiekunem</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Pamiętaj o aktualizacjach i wspólnym budowaniu historii razem z osobami, które powierzyły Ci tę rolę.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-sm text-slate-600">
            <UsersIcon className="w-4 h-4 text-cyan-500" />
            {keeperPages.length} stron pod Twoją opieką
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {keeperPages.map((page) => (
            <button
              key={page.id}
              onClick={() => router.push(`/memorial/${page.id}`)}
              className="relative overflow-hidden rounded-[28px] bg-white border border-slate-100 shadow-[0_25px_60px_-40px_rgba(15,82,109,0.35)] transition transform hover:-translate-y-1 text-left"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/20 z-10" />
                {page.photo_url ? (
                  <img
                    src={page.photo_url}
                    alt={`${page.first_name} ${page.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <UserCircleIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur border border-white/50">
                  Opiekun
                </div>
                <div className="absolute bottom-3 left-4 right-4 z-20">
                  <p className="text-lg font-semibold text-white drop-shadow-sm">
                    {page.first_name} {page.last_name}
                  </p>
                  <p className="text-xs text-white/80">Kliknij, aby otworzyć</p>
                </div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-2 text-slate-600">
                  <TagIcon className="w-4 h-4 text-cyan-500" />
                  #{page.id}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px] tracking-wide">
                  Strona pamięci
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
