import { createClient } from "@supabase/supabase-js"
import { BarrierReport } from "../types"

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://zcemxtjmuliypoekhzcl.supabase.co"
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_dbjefZ3sWoVkZdofA5pZ2g_bIcB6Bhw"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Database sync services with safe fallback
export async function syncReportToSupabase(
  report: BarrierReport,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("barrier_reports").insert([
      {
        id: report.id,
        type: report.type,
        severity: report.severity,
        location: report.location,
        description: report.description,
        status: report.status,
        date: report.date,
        created_at: new Date().toISOString(),
      },
    ])
    if (error) {
      console.warn(
        "Supabase insert notice (falling back to local storage):",
        error.message,
      )
      return false
    }
    return true
  } catch (err) {
    console.warn("Supabase sync notice:", err)
    return false
  }
}

export async function fetchReportsFromSupabase(): Promise<BarrierReport[] | null> {
  try {
    const { data, error } = await supabase
      .from("barrier_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data) return null
    return data.map((item: any) => ({
      id: item.id || `UE-${Math.floor(1000 + Math.random() * 9000)}`,
      type: item.type || "Blocked footpath",
      status: item.status || "Under Review",
      date: item.date || "Today",
      severity: item.severity || "Medium",
      location: item.location || "Bandra West",
      description: item.description || "Reported urban barrier",
    }))
  } catch {
    return null
  }
}

export async function syncPreferencesToSupabase(
  userId: string,
  preferences: string[],
): Promise<void> {
  try {
    await supabase.from("user_profiles").upsert({
      user_id: userId,
      preferences,
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn("Preferences cloud sync notice:", err)
  }
}
