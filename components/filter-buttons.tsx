"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search } from "lucide-react"
import { fetchTeams } from "@/lib/db"
import { supabase } from "../lib/supabaseClient"

export default function FilterButtons({ selectedTeam, setSelectedTeam, searchTerm, setSearchTerm, compareTeams, setCompareTeams, onCompare }: { selectedTeam: string, setSelectedTeam: (team: string) => void, searchTerm: string, setSearchTerm: (term: string) => void, compareTeams: string[], setCompareTeams: (teams: string[]) => void, onCompare: () => void }) {
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
        setLastUpdated(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))
      }
    }
    fetchLastUpdated()
  }, [teams])

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-3 justify-between items-center w-full">
      <div className="flex flex-col sm:flex-row w-full gap-3 items-center justify-between">
        <div className="flex flex-row gap-3 w-full sm:w-auto items-center">
          {/* Team 1 Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-red-700 bg-black text-white hover:bg-red-900 hover:text-white">
                {compareTeams[0] || "Select Team 1"}
                <ChevronDown className="ml-2 h-4 w-4 text-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black border-red-700">
              {teams.filter(t => t !== compareTeams[1]).map((team) => (
                <DropdownMenuItem
                  key={team}
                  onClick={() => setCompareTeams([team, compareTeams[1]])}
                  className="hover:bg-red-900 focus:bg-red-900 text-white"
                >
                  {team}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Team 2 Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-red-700 bg-black text-white hover:bg-red-900 hover:text-white">
                {compareTeams[1] || "Select Team 2"}
                <ChevronDown className="ml-2 h-4 w-4 text-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black border-red-700">
              {teams.filter(t => t !== compareTeams[0]).map((team) => (
                <DropdownMenuItem
                  key={team}
                  onClick={() => setCompareTeams([compareTeams[0], team])}
                  className="hover:bg-red-900 focus:bg-red-900 text-white"
                >
                  {team}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="bg-red-700 hover:bg-red-800 text-white"
            disabled={!compareTeams[0] || !compareTeams[1] || compareTeams[0] === "All Teams" || compareTeams[1] === "All Teams"}
            onClick={onCompare}
          >
            Compare
          </Button>
        </div>
        {/* Regular team filter and search bar */}
        <div className="flex w-full sm:w-auto flex-row sm:flex-wrap gap-3 items-center justify-between sm:justify-start mt-3 sm:mt-0">
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
          <div className="relative flex-1 ml-0 sm:ml-4 min-w-[120px] max-w-xs" style={{maxWidth: 220}}>
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
      </div>
      {hasMounted && (
        <div className="text-sm text-gray-400 mt-2 sm:mt-0 w-full sm:w-auto text-left sm:text-right">
          Last updated: {lastUpdated ? lastUpdated : '...'}
        </div>
      )}
    </div>
  )
}
