import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Brak konfiguracji Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const bucket = typeof body?.bucket === 'string' ? body.bucket : null
    const pathsInput: unknown[] = Array.isArray(body?.paths) ? body.paths : []

    if (!bucket || !pathsInput.length) {
      return NextResponse.json({ deleted: [], missing: [], attempted: [] }, { status: 200 })
    }

    const normalize = (value: unknown) => {
      if (typeof value !== 'string') return null
      return value.replace(/^\/+/, '').replace(/\/+$/, '')
    }

    const normalizedPaths = Array.from(
      new Set<string>(
        pathsInput
          .map(normalize)
          .filter((path): path is string => Boolean(path))
      )
    )

    if (!normalizedPaths.length) {
      return NextResponse.json({ deleted: [], missing: [], attempted: [] }, { status: 200 })
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).remove(normalizedPaths)

    if (error) {
      return NextResponse.json({ error: error.message, attempted: normalizedPaths }, { status: 500 })
    }

    const deletedPaths = Array.isArray(data)
      ? data
          .map((item: any) => item?.path ?? item?.Key ?? item?.name ?? null)
          .filter((path): path is string => Boolean(path))
      : []

    const missingPaths = normalizedPaths.filter((path: string) => {
      if (deletedPaths.includes(path)) return false
      const withoutPublic = path.startsWith('public/') ? path.slice('public/'.length) : null
      if (withoutPublic && deletedPaths.includes(withoutPublic)) return false
      const withPublic = path.startsWith('public/') ? path : `public/${path}`
      if (deletedPaths.includes(withPublic)) return false
      return true
    })

    return NextResponse.json(
      {
        deleted: deletedPaths,
        missing: missingPaths,
        attempted: normalizedPaths
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Unexpected error' }, { status: 500 })
  }
}
