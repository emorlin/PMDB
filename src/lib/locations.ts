import { supabase } from './supabase'
import type { Location } from '../types/location'

export async function listLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from('locations').select('*').order('name')
  if (error) throw error
  return data as Location[]
}

export async function addLocation(name: string): Promise<Location> {
  const { data, error } = await supabase.from('locations').insert({ name }).select().single()
  if (error) throw error
  return data as Location
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Kan inte ta bort platsen – den används av minst en film i samlingen.')
    }
    throw error
  }
}
