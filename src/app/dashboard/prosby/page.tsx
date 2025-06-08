type Invite = {
  id: number;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  memorial_id: number;
  added_by: string;
  memorial_pages?: {
    id: number;
    first_name: string;
    last_name: string;
  };
};
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import TopNavbar from '../../../components/TopNavbar'
import { supabase } from '../../../utils/supabaseClient'

export default function ProsbyPage() {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path
  const [invites, setInvites] = useState<any[]>([])
  // Handler for accepting an invite
  const handleAccept = async (invite: any) => {
    // 1. Mark the invite as accepted
    const { error: err1 } = await supabase
      .from('memorial_invites')
      .update({ status: 'zaakceptowane' })
      .eq('id', invite.id)
    if (err1) {
      console.error('❌ Błąd podczas akceptacji zaproszenia:', err1)
      return
    }

    // 2. Add the user as a keeper
    const { error: err2 } = await supabase
      .from('memorial_keepers')
      .insert({
        user_id: invite.user_id,
        memorial_id: invite.memorial_id,
        role: invite.role,
        added_by: invite.added_by
      })
    if (err2) {
      console.error('❌ Błąd przy dodawaniu opiekuna:', err2)
      return
    }

    // 3. Remove the accepted invite from state
    setInvites(prev => prev.filter(i => i.id !== invite.id))
  }

  useEffect(() => {
    const fetchInvites = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("❌ Błąd pobierania użytkownika:", userError)
        return
      }

      if (!user || !user.id) {
        console.warn("⚠️ Brak użytkownika lub jego ID")
        return
      }
      console.log("🧠 Zalogowany user ID:", user?.id)

      // Zapytanie do memorial_invites z dołączeniem danych memorial_pages (z aliasowaniem relacji)
      const { data: rawInvitesData, error } = await supabase
        .from('memorial_invites')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          memorial_id,
          added_by,
          memorial_pages!invite_page_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'oczekuje')
      console.log("📥 Zapytanie do memorial_invites (z relacją do memorial_pages)");
      console.log("🧾 rawInvitesData:", rawInvitesData);
      console.log("🐞 error:", error);
      console.log("🧾 rawInvitesData:", rawInvitesData)
      console.log("🐞 błąd pobierania zaproszeń:", error)

      const invitesData = (rawInvitesData as Invite[]) || []
      console.log("🧾 invitesData:", invitesData)

      // Pobierz unikalne added_by
      const uniqueUserIds = [...new Set(invitesData.map((i: Invite) => i.added_by))]
      let addedByUsers: any[] = []
      if (uniqueUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('public_users')
          .select('id, first_name, last_name')
          .in('id', uniqueUserIds)
        addedByUsers = usersData || []
      }

      // Mapuj zaproszenia z nazwą użytkownika i danymi strony pamięci
      const invitesWithNames = invitesData.map(invite => {
        const addedByUser = addedByUsers.find(user => user.id === invite.added_by)
        return {
          ...invite,
          added_by_name: addedByUser
            ? `${addedByUser.first_name} ${addedByUser.last_name}`
            : 'Nieznany użytkownik',
          memorial_pages: invite.memorial_pages || null
        }
      })
      console.log('📦 invitesWithNames:', invitesWithNames)
      setInvites(invitesWithNames)
    }

    fetchInvites()
  }, [])

  return (
    <>
      <TopNavbar />
      <nav className="w-full bg-white shadow-xs border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center h-[75px] relative">
          <div className="flex gap-14">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Panel główny
              {isActive('/dashboard') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/prosby')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard/prosby') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Prośby
              {isActive('/dashboard/prosby') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[200%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/zgloszenia')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard/zgloszenia') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Zgłoszenia
              {isActive('/dashboard/zgloszenia') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto py-10 px-6 flex gap-6 text-gray-700">
        {/* LEWA KOLUMNA - FILTRY */}
        <div className="w-1/3 bg-white p-6 rounded-md shadow-xs border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mt-3 ml-3">Filtry</h2>
            <button className="text-sm text-cyan-600 hover:underline mr-3">Wyczyść wszystko</button>
          </div>
          <div className="space-y-4">
            <p className="text-base font-semibold mt-1 ml-3">Typy próśb</p>
            {["Prośba o zostanie opiekunem"].map(label => (
              <div key={label} className="flex items-center gap-2 ml-3">
                <input type="radio" name="requestType" className="accent-gray-400" defaultChecked />
                <label className="text-sm">{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* PRAWA KOLUMNA - LISTA PROŚB */}
        <div className="flex-1 bg-white py-10 px-10 rounded-md shadow-xs border">
          <h2 className="text-xl font-semibold text-gray-800 mb-8">Prośby o zostanie opiekunem</h2>
          <div className="space-y-6">
            {invites.length === 0 ? (
              <div>
                <p className="text-gray-500">Brak oczekujących zaproszeń.</p>
              </div>
            ) : (
              invites.map(invite => (
                <div key={invite.id} className="border border-gray-300 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-semibold mb-1">Zaproszenie</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Zostałeś zaproszony do roli <span className="font-medium">{invite.role}</span> na stronie pamięci:{" "}
                    <span className="font-medium text-gray-800">
                      {invite.memorial_pages?.first_name ?? ''} {invite.memorial_pages?.last_name ?? ''}
                    </span>
                  </p>
                  <pre className="text-xs text-gray-400">{JSON.stringify(invite.memorial_pages)}</pre>
                  <p className="text-sm text-gray-600 mb-4">
                    Od: <span className="font-medium text-gray-800">{invite.added_by_name}</span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(invite)}
                      className="px-4 py-2 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700"
                    >
                      Akceptuj
                    </button>
                    <button className="px-4 py-2 border text-sm rounded hover:bg-gray-100">Odrzuć</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}