import { supabase } from './supabaseClient'

export async function saveMemorialPage(data: any) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Użytkownik nie jest zalogowany.')
  }

  const payload = {
    ...data,
    user_id: user.id
  }

  const { data: result, error } = await supabase
    .from('memorial_pages')
    .insert([payload])

  if (error) {
    throw error
  }

  return result
}