import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Missing Supabase credentials — copy .env.example to .env.local and fill in your project URL and anon key.'
    : null

export const supabase = configError ? null : createClient(supabaseUrl, supabaseAnonKey)

export async function fetchCheckpoints() {
  const { data, error } = await supabase
    .from('checkpoints')
    .select('code, label')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data
}

export async function recordScan(token,
  checkpointCode,
  method = 'qr',
  deviceLabel = null,
  regNoParam = null) {
  const cleanToken = token ? String(token).trim() : ''
  const { data, error } = await supabase.rpc('record_scan', {
    p_token: cleanToken,
    p_checkpoint_code: checkpointCode,
    p_method: method,
    p_device_label: deviceLabel,
    p_reg_no: regNoParam,
  })
  if (error) {
    console.error('record_scan error:', error)
    return { status: 'network_error' }
  }
  if (data && (data.status === 'confirmed' || data.status === 'duplicate')) {
    let resolvedRegNo =
      data.reg_no ||
      data.participant_reg_no ||
      data.reg_number ||
      data.registration_no ||
      data.registration_number ||
      data.participant?.reg_no ||
      data.participant?.reg_number ||
      regNoParam ||
      null

    if (!resolvedRegNo && supabase && cleanToken) {
      try {
        const { data: part, error: partErr } = await supabase
          .from('participants')
          .select('reg_no, name')
          .eq('token', cleanToken)
          .maybeSingle()

        if (!partErr && part?.reg_no) {
          resolvedRegNo = part.reg_no
          if (!data.name && part.name) data.name = part.name
        }
      } catch (e) {
        console.warn('Error fetching participant by token:', e)
      }
    }

    if (!resolvedRegNo && supabase && cleanToken) {
      try {
        const { data: part, error: partErr } = await supabase
          .from('participants')
          .select('reg_no, name')
          .eq('reg_no', cleanToken)
          .maybeSingle()

        if (!partErr && part?.reg_no) {
          resolvedRegNo = part.reg_no
          if (!data.name && part.name) data.name = part.name
        }
      } catch (e) {
        console.warn('Error fetching participant by reg_no:', e)
      }
    }

    if (!resolvedRegNo && supabase && cleanToken) {
      try {
        const { data: searchData } = await supabase.rpc('attendant_search_participants', {
          p_query: cleanToken,
        })
        if (Array.isArray(searchData) && searchData.length > 0) {
          const match = searchData.find((p) => p.token === cleanToken || p.reg_no === cleanToken) || searchData[0]
          if (match?.reg_no) {
            resolvedRegNo = match.reg_no
            if (!data.name && match.name) data.name = match.name
          }
        }
      } catch (e) {
        console.warn('attendant_search_participants fallback failed:', e)
      }
    }

    data.reg_no = resolvedRegNo
    data.name = data.name ?? data.participant?.name ?? null
    data.checkpoint = data.checkpoint?.label ?? data.checkpoint
  }
  return data
}

export async function searchParticipants(query) {
  if (!query || query.trim().length < 2) return []

  const { data, error } = await supabase.rpc(
    "attendant_search_participants",
    {
      p_query: query.trim()
    }
  )

  if (error) throw error

  return data
}
