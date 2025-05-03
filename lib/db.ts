import { supabase } from './supabase'
import type { PlayerStats } from './types'

export async function fetchPlayers(): Promise<any[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*, teams(name)')
    .order('rank', { ascending: true })

  if (error) {
    console.error('Error fetching players:', error.message, error.details, error.hint)
    return []
  }

  // Map team name to player.team_name for easier access
  return (data || []).map((p: any) => ({ ...p, team_name: p.teams?.name || '' }))
}

export async function updatePlayer(player: PlayerStats): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .update(player)
    .eq('id', player.id)

  if (error) {
    console.error('Error updating player:', error.message, error.details, error.hint)
    return false
  }

  return true
}

export async function addPlayer(player: Omit<PlayerStats, 'id'>): Promise<PlayerStats | null> {
  console.log('Attempting to add player:', player)
  
  const { data, error } = await supabase
    .from('players')
    .insert([player])
    .select()
    .single()

  if (error) {
    console.error('Error adding player:', error.message, error.details, error.hint)
    return null
  }

  console.log('Successfully added player:', data)
  return data
}

export async function deletePlayer(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting player:', error.message, error.details, error.hint)
    return false
  }

  return true
}

export async function fetchTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching teams:', error.message, error.details, error.hint);
    return [];
  }
  return data || [];
} 