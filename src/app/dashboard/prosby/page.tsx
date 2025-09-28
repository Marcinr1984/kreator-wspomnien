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

import React, { useEffect, useMemo, useState } from 'react'
import TopNavbar from '../../../components/TopNavbar'
import { supabase } from '../../../utils/supabaseClient'
import { InboxArrowDownIcon, FunnelIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import DashboardTabs from '../../../components/DashboardTabs'

export default function ProsbyPage() {
  const [invites, setInvites] = useState<any[]>([])
  const stats = useMemo(() => {
    const total = invites.length
    const roles = invites.reduce<Record<string, number>>((acc, invite) => {
      acc[invite.role] = (acc[invite.role] || 0) + 1
      return acc
    }, {})
    return { total, roles }
  }, [invites])
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
          memorial_pages:memorial_id (
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

      const invitesData = (rawInvitesData as any[])?.map(item => ({
        ...item,
        memorial_pages: Array.isArray(item.memorial_pages) ? item.memorial_pages[0] : item.memorial_pages
      })) as Invite[] || []
      console.log("🧾 invitesData:", invitesData)

      // Pobierz unikalne added_by
      const uniqueUserIds = Array.from(new Set(invitesData.map((i: Invite) => i.added_by)))
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
    <div className="min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] pb-16">
      <TopNavbar />
      <DashboardTabs activePath="/dashboard/prosby" />
      <div className="page-fade space-y-6">
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white p-8 shadow-[0_30px_60px_-20px_rgba(29,78,216,0.35)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg">
                <InboxArrowDownIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="uppercase text-xs tracking-widest text-white/70">Prośby</p>
                <h1 className="text-3xl md:text-4xl font-semibold mt-1">Zaproszenia do opieki</h1>
                <p className="text-sm md:text-base text-white/80 mt-2 max-w-xl">
                  Poniżej znajdziesz wszystkie oczekujące zaproszenia na opiekuna stron pamięci. Zdecyduj, które z nich przyjąć i dołącz do wspólnego upamiętniania.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <div className="rounded-2xl bg-white/15 backdrop-blur px-5 py-4 text-left shadow-inner border border-white/10">
                <p className="text-xs uppercase tracking-wide text-white/70">Łącznie próśb</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur px-5 py-4 text-left shadow-inner border border-white/10">
                <p className="text-xs uppercase tracking-wide text-white/70">Rodzaje ról</p>
                <p className="text-sm text-white/80 mt-1 leading-snug">
                  {Object.keys(stats.roles).length > 0
                    ? Object.entries(stats.roles)
                        .map(([role, count]) => `${role} (${count})`)
                        .join(', ')
                    : 'Brak danych'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-[320px_auto] gap-6">
        <aside className="bg-white rounded-[28px] shadow-[0_20px_40px_-30px_rgba(15,82,109,0.4)] p-6 border border-slate-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <FunnelIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Filtry</h2>
            </div>
            <button className="text-xs text-cyan-600 hover:underline">Wyczyść</button>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Typ prośby</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 flex items-center gap-3">
              <input type="radio" name="requestType" className="accent-cyan-500" defaultChecked />
              <span className="text-sm text-slate-600">Prośba o zostanie opiekunem</span>
            </div>
          </div>
        </aside>

        <section className="bg-white rounded-[28px] shadow-[0_25px_70px_-40px_rgba(15,82,109,0.3)] p-6 md:p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Oczekujące zaproszenia</h2>
              <p className="text-sm text-slate-500 mt-1">
                Zareaguj na prośby i dołącz jako opiekun do nowych stron.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {invites.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
                <p>Brak oczekujących zaproszeń. Gdy ktoś zaprosi Cię do roli opiekuna, pojawi się tutaj.</p>
              </div>
            ) : (
              invites.map((invite) => (
                <div
                  key={invite.id}
                  className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_40px_-36px_rgba(15,82,109,0.35)] px-6 py-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-widest">Zaproszenie do roli</p>
                      <h3 className="text-lg font-semibold text-slate-800 mt-1">
                        {invite.role} dla strony {invite.memorial_pages?.first_name} {invite.memorial_pages?.last_name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2">
                        Wysłane przez <span className="font-medium text-slate-700">{invite.added_by_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAccept(invite)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-sm font-medium shadow hover:bg-cyan-700 transition"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Akceptuj
                      </button>
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-sm text-slate-600 font-medium hover:bg-slate-200 transition">
                        <XCircleIcon className="w-4 h-4" />
                        Odrzuć
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      </div>
    </div>
  )
}
