// app/qr/[slug]/page.tsx
import { supabaseServer } from '../../../utils/supabaseServer';
import PublicMemorialView from './PublicMemorialView';

export const dynamic = 'force-dynamic';

export default async function PublicMemorialPage({ params }: { params: { slug: string } }) {
  console.log('Szukam sluga:', params.slug);

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('memorial_pages')
    .select('*')
    .eq('qr_slug', params.slug)
    .eq('is_public', true)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('Imiona w bazie:', data);

  if (error || !data) {
    console.error('Nie znaleziono strony lub błąd:', error);
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Strona nie została opublikowana</h1>
          <p>Ten profil pamięci nie jest jeszcze dostępny publicznie.</p>
        </div>
      </div>
    );
  }

  return <PublicMemorialView data={data} />;
}