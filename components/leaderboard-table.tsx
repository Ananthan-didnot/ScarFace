"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, Crown, Medal, Award, ArrowUpDown } from "lucide-react"
import { PlayerStats } from "@/lib/types"
import { fetchPlayers } from "@/lib/db"
import { cn } from "@/lib/utils"

type SortField = "name" | "team_name" | "kills" | "matches" | "mvps" | "totalPoints"
type SortDirection = "asc" | "desc"

export default function LeaderboardTable({ selectedTeam, searchTerm }: { selectedTeam: string, searchTerm: string }) {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [sortField, setSortField] = useState<SortField>("totalPoints")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      const data = await fetchPlayers()
      setPlayers(data)
      setError(null)
    } catch (error) {
      console.error('Error loading players:', error)
      setError('Failed to load players. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection(field === "name" || field === "team_name" ? "asc" : "desc")
    }
  }

  // Compute global rank for all players
  const globalRankedPlayers = [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((player, idx) => ({ ...player, globalRank: idx + 1 }))

  let filteredPlayers = globalRankedPlayers;
  let showGlobalRank = true;

  if (!searchTerm && selectedTeam && selectedTeam !== 'All Teams') {
    // Team filter only, show team rank
    filteredPlayers = globalRankedPlayers.filter(p => p.team_name === selectedTeam)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((player, idx) => ({ ...player, teamRank: idx + 1 }));
    showGlobalRank = false;
  } else if (searchTerm) {
    // Search active, show global rank
    filteredPlayers = globalRankedPlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    showGlobalRank = true;
  }

  const sortedData = [...filteredPlayers].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
  }).map((player, idx) => ({ ...player, computedRank: idx + 1 }))

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="rounded-xl border-2 border-red-700 shadow-[0_0_16px_2px_rgba(255,0,0,0.3)] bg-black/90 p-8 text-center">
        <div className="text-xl text-red-500">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-700 shadow-[0_0_16px_2px_rgba(255,0,0,0.3)] bg-black/90 p-8 text-center">
        <div className="text-xl text-red-500">{error}</div>
        <button 
          onClick={loadPlayers}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="rounded-xl border-2 border-red-700 shadow-[0_0_16px_2px_rgba(255,0,0,0.3)] bg-black/90 p-8 text-center">
        <div className="text-xl text-red-500">No players found</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-red-700 shadow-[0_0_16px_2px_rgba(255,0,0,0.3)] bg-black/90 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800/50">
              <TableHead className="text-center w-[80px] cursor-pointer" onClick={() => handleSort("totalPoints")}>
                <div className="flex items-center justify-center">
                  Rank
                  {getSortIcon("totalPoints")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center justify-center">
                  Player
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("team_name")}>
                <div className="flex items-center justify-center">
                  Team
                  {getSortIcon("team_name")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("kills")}>
                <div className="flex items-center justify-center">
                  Kills
                  {getSortIcon("kills")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("matches")}>
                <div className="flex items-center justify-center">
                  Matches
                  {getSortIcon("matches")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("mvps")}>
                <div className="flex items-center justify-center">
                  MVPs
                  {getSortIcon("mvps")}
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("totalPoints")}>
                <div className="flex items-center justify-center">
                  Total Points
                  {getSortIcon("totalPoints")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((player) => (
              <TableRow
                key={player.id}
                className={cn(
                  "border-gray-800 transition-colors",
                  player.computedRank <= 3
                    ? "bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-800 hover:to-gray-900"
                    : "hover:bg-gray-800/50",
                )}
              >
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {getRankIcon(showGlobalRank ? player.globalRank : player.teamRank)}
                    <span className={cn(
                      (showGlobalRank ? player.globalRank : player.teamRank) === 1 && "text-yellow-400",
                      (showGlobalRank ? player.globalRank : player.teamRank) === 2 && "text-gray-300",
                      (showGlobalRank ? player.globalRank : player.teamRank) === 3 && "text-amber-600",
                    )}>
                      #{showGlobalRank ? player.globalRank : player.teamRank}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span>{player.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{player.team_name}</TableCell>
                <TableCell className="text-center">{player.kills}</TableCell>
                <TableCell className="text-center">{player.matches}</TableCell>
                <TableCell className="text-center">{player.mvps}</TableCell>
                <TableCell className="text-center">{player.totalPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
