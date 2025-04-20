'use client';

import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useSearchParams } from 'next/navigation';

type MemorialPage = {
  id: number;
  first_name: string;
  last_name: string;
  user_id: string;
};

export default function KeeperPagesSection() {
  const [keeperPages, setKeeperPages] = useState<MemorialPage[]>([]);

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
      return;
    }

    const memorialIds = keeperLinks.map(k => k.memorial_id);
    console.log('🆔 memorialIds:', memorialIds);

    const { data: pages, error: pagesError } = await supabase
      .from('memorial_pages')
      .select('id, first_name, last_name, user_id')
      .in('id', memorialIds);

    console.log('📄 pages [data]:', pages);
    console.log('💥 pages [error]:', pagesError);
    console.log('📦 pages (string):', JSON.stringify(pages, null, 2));

    if (!pages || pages.length === 0) {
      console.warn('⚠️ Brak danych stron do wyświetlenia');
      setKeeperPages([]);
      return;
    }

    setKeeperPages(pages ?? []);
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

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md shadow-gray-300/30 pt-6 px-6 pb-10 mt-8">
      <div className="rounded-lg">
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-semibold mb-4">Opiekun stron</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {keeperPages.length === 0 && (
            <div className="text-gray-500">Nie jesteś opiekunem żadnej strony pamięci.</div>
          )}

          {keeperPages.length > 0 && keeperPages.map(page => (
            <div
              key={page.id}
              className="flex flex-col items-center justify-center border rounded-lg aspect-square text-center text-sm text-gray-600 cursor-pointer"
            >
              <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center w-24 h-24 mb-2">
                <UserCircleIcon className="w-6 h-6 text-cyan-500" />
              </div>
              <div className="text-sm text-gray-800 font-medium">
                {page.first_name} {page.last_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}