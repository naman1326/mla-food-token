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

export async function recordScan(token, checkpointCode, method = 'qr', deviceLabel = null) {
  const { data, error } = await supabase.rpc('record_scan', {
    p_token: token,
    p_checkpoint_code: checkpointCode,
    p_method: method,
    p_device_label: deviceLabel,
  })
  if (error) {
    console.error('record_scan error:', error)
    return { status: 'network_error' }
  }
  if (data && (data.status === 'confirmed' || data.status === 'duplicate')) {
    const { data: part, error: partError } = await supabase
      .from('participants')
      .select('reg_no')
      .eq('token', token)
      .maybeSingle()
    if (!partError && part) {
      data.reg_no = part.reg_no
    }
  }
  return data
}

export async function searchParticipants(query) {
  if (!query || query.trim().length < 2) return []
  const { data, error } = await supabase
    .from('participants')
    .select('token, name, reg_no')
    .or(`name.ilike.%${query}%,reg_no.ilike.%${query}%`)
    .limit(8)
  if (error) throw error
  return data
}
