import { supabase } from './supabase'
import type { Location } from '../types/location'

export async function listLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from('locations').select('*').order('name')
  if (error) throw error
  return data as Location[]
}

// Skrivoperationer går via /api/locations (inte direkt mot Supabase från
// klienten) eftersom de kräver inloggning – token kommer från Clerks
// useAuth().getToken().

export async function addLocation(name: string, token: string): Promise<Location> {
  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Kunde inte lägga till platsen')
  return data as Location
}

export async function deleteLocation(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/locations?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Kunde inte ta bort platsen')
  }
}
