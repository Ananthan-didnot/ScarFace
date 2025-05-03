"use client"
import LeaderboardTable from "@/components/leaderboard-table"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FilterButtons from "@/components/filter-buttons"
import { useState } from "react"

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState("All Teams")
  const [searchTerm, setSearchTerm] = useState("")
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <FilterButtons selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <LeaderboardTable selectedTeam={selectedTeam} searchTerm={searchTerm} />
      </main>
      <footer className="container mx-auto p-6 text-center text-gray-300">
        <p>© 2025 ScarFace | All Rights Reserved</p>
      </footer>
    </div>
  )
}
