import { createClient } from '@supabase/supabase-js'

// Support both standard Vite Supabase naming conventions
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

let localUrl = ''
let localKey = ''
try {
  const savedConfig = localStorage.getItem('ledgerflow_supabase_config')
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig)
    localUrl = parsed.url || ''
    localKey = parsed.anonKey || ''
  }
} catch {
  // localStorage may be unavailable or blocked
}

const activeUrl = envUrl || localUrl
const activeKey = envKey || localKey

export const isSupabaseConfigured = Boolean(
  activeUrl &&
  activeKey &&
  activeUrl.startsWith('https://') &&
  !activeUrl.includes('your-project-id')
)

export const supabase = isSupabaseConfigured
  ? createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function getSupabaseConfigStatus() {
  if (isSupabaseConfigured) {
    return {
      configured: true,
      source: envUrl ? 'environment' : 'browser_storage',
      url: activeUrl ? `${activeUrl.slice(0, 24)}...` : '',
      message: 'Supabase Cloud Connected',
    }
  }
  return {
    configured: false,
    source: 'none',
    message: 'Operating in Verified Demo Mode (Local Storage)',
  }
}
