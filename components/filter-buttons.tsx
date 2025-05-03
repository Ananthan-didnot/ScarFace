"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search } from "lucide-react"
import { fetchTeams } from "@/lib/db"
import { supabase } from "../lib/supabaseClient"

export default function FilterButtons({ selectedTeam, setSelectedTeam, searchTerm, setSearchTerm }: { selectedTeam: string, setSelectedTeam: (team: string) => void, searchTerm: string, setSearchTerm: (term: string) => void }) {
  const [teams, setTeams] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    const loadTeams = async () => {
      const dbTeams = await fetchTeams()
      setTeams(["All Teams", ...dbTeams.map((t: any) => t.name)])
    }
    loadTeams()
  }, [])

  useEffect(() => {
    const fetchLastUpdated = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      console.log('Last updated data:', data, 'Error:', error);
      if (data && data.length > 0 && data[0].updated_at) {
        const date = new Date(data[0].updated_at)
        setLastUpdated(date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }))
      }
    }
    fetchLastUpdated()
  }, [teams])

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
      <div className="flex flex-wrap gap-3 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-red-700 bg-black text-white hover:bg-red-900 hover:text-white">
              {selectedTeam}
              <ChevronDown className="ml-2 h-4 w-4 text-red-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border-red-700">
            {teams.map((team) => (
              <DropdownMenuItem
                key={team}
                onClick={() => setSelectedTeam(team)}
                className="hover:bg-red-900 focus:bg-red-900 text-white"
              >
                {team}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative ml-4" style={{ minWidth: 180 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search player..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-black border border-red-700 text-white p-2 rounded focus:outline-none focus:border-red-400 placeholder-gray-400 w-full"
          />
        </div>
      </div>
      {hasMounted && (
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdated ? lastUpdated : '...'}
        </div>
      )}
    </div>
  )
}
