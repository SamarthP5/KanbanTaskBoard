import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
}

export function useTeamMembers(userId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data) setMembers(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const addMember = async (name: string, color: string) => {
    if (!userId) return
    const { data } = await supabase
      .from('team_members')
      .insert({ name, color, user_id: userId })
      .select()
      .single()
    if (data) setMembers(prev => [...prev, data])
  }

  const deleteMember = async (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
    await supabase.from('team_members').delete().eq('id', id)
  }

  return { members, loading, addMember, deleteMember }
}
