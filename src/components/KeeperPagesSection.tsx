'use client';

import { UserCircleIcon } from '@heroicons/react/24/outline';
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
    <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md shadow-gray-300/30 pt-6 px-6 pb-10 mt-8">
      <div className="rounded-lg">
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-semibold mb-2">Opiekun stron</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {keeperPages.length === 0 && (
            <div className="text-gray-500">Nie jesteś opiekunem żadnej strony pamięci.</div>
          )}

          {keeperPages.length > 0 && keeperPages.map(page => (
            <div
              key={page.id}
              onClick={() => router.push(`/memorial/${page.id}`)}
              className="bg-white rounded-2xl text-center px-6 pt-6 pb-2 relative cursor-pointer"
            >
              <div className="w-[130px] h-[130px] rounded-xl overflow-hidden mx-auto mb-5 bg-gray-100 flex items-center justify-center border-[6px] border-white shadow">
                {page.photo_url ? (
                  <img
                    src={page.photo_url}
                    alt={`${page.first_name} ${page.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-10 h-10 text-cyan-500" />
                )}
              </div>
              <div className="text-sm font-semibold text-zinc-900 leading-none">
                {page.first_name} {page.last_name}
              </div>
             
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}