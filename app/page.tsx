"use client"
import LeaderboardTable from "@/components/leaderboard-table"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FilterButtons from "@/components/filter-buttons"
import { useState, useEffect } from "react"
import { fetchPlayers } from "@/lib/db"

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState("All Teams")
  const [searchTerm, setSearchTerm] = useState("")
  const [compareTeams, setCompareTeams] = useState(["", ""])
  const [isComparing, setIsComparing] = useState(false)
  const [allPlayers, setAllPlayers] = useState([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  useEffect(() => {
    if (isComparing && allPlayers.length === 0) {
      setLoadingPlayers(true)
      fetchPlayers().then(players => {
        setAllPlayers(players)
        setLoadingPlayers(false)
      })
    }
  }, [isComparing, allPlayers.length])

  const handleCompare = () => {
    setIsComparing(true)
    if (allPlayers.length === 0) {
      setLoadingPlayers(true)
      fetchPlayers().then(players => {
        setAllPlayers(players)
        setLoadingPlayers(false)
      })
    }
  }

  const handleExitCompare = () => {
    setIsComparing(false)
    setCompareTeams(["", ""])
  }

  // Compute stats for a team
  const getTeamStats = (teamName) => {
    const players = allPlayers.filter(p => p.team_name === teamName)
    return {
      kills: players.reduce((sum, p) => sum + (p.kills || 0), 0),
      matches: players.reduce((sum, p) => sum + (p.matches || 0), 0),
      mvps: players.reduce((sum, p) => sum + (p.mvps || 0), 0),
      totalPoints: players.reduce((sum, p) => sum + (p.totalPoints || 0), 0),
      players,
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <FilterButtons
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          compareTeams={compareTeams}
          setCompareTeams={setCompareTeams}
          onCompare={handleCompare}
        />
        {isComparing ? (
          <div className="my-8">
            <div className="flex flex-col items-center mb-4">
              <button onClick={handleExitCompare} className="mb-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-white">Exit Comparison</button>
              <h2 className="text-2xl font-bold mb-2 text-red-400">Team Comparison</h2>
            </div>
            {loadingPlayers ? (
              <div className="text-center text-red-500">Loading teams...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[0, 1].map(idx => {
                  const team = compareTeams[idx]
                  if (!team) return <div key={idx} />
                  const stats = getTeamStats(team)
                  return (
                    <div key={team} className="border-2 border-red-700 rounded-xl p-6 bg-black/80 shadow-lg">
                      <h3 className="text-xl font-bold text-red-500 mb-4 text-center">{team}</h3>
                      <div className="mb-4 flex flex-col gap-2 text-center">
                        <div>Kills: <span className="font-bold text-white">{stats.kills}</span></div>
                        <div>Matches: <span className="font-bold text-white">{stats.matches}</span></div>
                        <div>MVPs: <span className="font-bold text-white">{stats.mvps}</span></div>
                        <div>Total Points: <span className="font-bold text-white">{stats.totalPoints}</span></div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-2">Players</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-black text-red-400">
                              <th className="p-2 text-center">Name</th>
                              <th className="p-2 text-center">Kills</th>
                              <th className="p-2 text-center">Matches</th>
                              <th className="p-2 text-center">MVPs</th>
                              <th className="p-2 text-center">Total Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.players.map(player => (
                              <tr key={player.id} className="border-b border-red-900">
                                <td className="p-2 text-center">{player.name}</td>
                                <td className="p-2 text-center">{player.kills}</td>
                                <td className="p-2 text-center">{player.matches}</td>
                                <td className="p-2 text-center">{player.mvps}</td>
                                <td className="p-2 text-center">{player.totalPoints}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <LeaderboardTable selectedTeam={selectedTeam} searchTerm={searchTerm} />
        )}
      </main>
      <footer className="container mx-auto p-6 text-center text-gray-300">
        <p>© 2025 ScarFace | All Rights Reserved</p>
      </footer>
    </div>
  )
}
