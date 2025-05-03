"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { PlayerStats } from "@/lib/types"
import { fetchPlayers, updatePlayer, addPlayer, deletePlayer, fetchTeams } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { supabase } from '../../lib/supabaseClient'
import AdminLogin from '../../components/AdminLogin'
import { Pencil, Trash2, Search } from 'lucide-react'

export default function AdminPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<PlayerStats>>({})
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerLoading, setNewPlayerLoading] = useState(false)
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false)
  const [editPlayerId, setEditPlayerId] = useState<number | null>(null)
  const [editPlayerName, setEditPlayerName] = useState('')
  const [editPlayerLoading, setEditPlayerLoading] = useState(false)
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false)
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null)
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null)
  const [editPlayerRank, setEditPlayerRank] = useState(0)
  const [editPlayerKills, setEditPlayerKills] = useState(0)
  const [editPlayerMatches, setEditPlayerMatches] = useState(0)
  const [editPlayerMvps, setEditPlayerMvps] = useState(0)
  const [editPlayerTotalPoints, setEditPlayerTotalPoints] = useState(0)
  const [adminSearchTerm, setAdminSearchTerm] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSessionChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => listener?.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadPlayers()
      loadTeams()
    }
  }, [session])

  useEffect(() => {
    if (adminSearchTerm) {
      const match = players.find(p => p.name.toLowerCase().includes(adminSearchTerm.toLowerCase()));
      if (match && activeTeamId !== match.team_id) {
        setActiveTeamId(match.team_id);
      }
    }
    // Do not auto-change team if search is cleared
    // eslint-disable-next-line
  }, [adminSearchTerm, players]);

  const loadPlayers = async () => {
    try {
      const data = await fetchPlayers()
      setPlayers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTeams = async () => {
    try {
      const data = await fetchTeams()
      setTeams(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
    }
  }

  const startEdit = (id: number) => {
    setEditing(id)
    setForm(players.find(p => p.id === id) || {})
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({})
  }

  const saveEdit = async () => {
    if (!editing) return

    try {
      const success = await updatePlayer({ ...form, id: editing } as PlayerStats)
      if (success) {
        setPlayers(players.map(p => p.id === editing ? { ...p, ...form } as PlayerStats : p))
        toast({
          title: "Success",
          description: "Player updated successfully",
        })
        cancelEdit()
      } else {
        throw new Error("Failed to update player")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const success = await deletePlayer(id)
      if (success) {
        setPlayers(players.filter(p => p.id !== id))
        if (editing === id) cancelEdit()
        toast({
          title: "Success",
          description: "Player deleted successfully",
        })
      } else {
        throw new Error("Failed to delete player")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      })
    }
  }

  const handleAddPlayer = async () => {
    const newPlayer = {
      name: newPlayerName,
      team_id: Number(selectedTeamId),
      rank: 0,
      kills: 0,
      matches: 0,
      mvps: 0,
      totalPoints: 0,
    }

    try {
      const addedPlayer = await addPlayer(newPlayer)
      if (addedPlayer) {
        setPlayers([...players, addedPlayer])
        toast({
          title: "Success",
          description: "Player added successfully",
        })
      } else {
        throw new Error("Failed to add player")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const confirmDelete = (id: number) => {
    setPlayerToDelete(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (playerToDelete !== null) {
      await handleDelete(playerToDelete)
      setShowDeleteModal(false)
      setPlayerToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setPlayerToDelete(null)
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      toast({ title: 'Error', description: 'Team name is required', variant: 'destructive' });
      return;
    }
    try {
      const { error: insertError } = await supabase.from('teams').insert([{ name: teamName }]);
      if (insertError) throw insertError;
      setShowTeamModal(false);
      setTeamName('');
      toast({ title: 'Success', description: 'Team created successfully!' });
      loadTeams();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create team', variant: 'destructive' });
    }
  };

  const openAddPlayerModal = (teamId: number) => {
    setSelectedTeamId(teamId);
    setShowAddPlayerModal(true);
    setNewPlayerName('');
  };

  const handleAddPlayerToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !newPlayerName) {
      toast({ title: 'Error', description: 'Player name is required', variant: 'destructive' });
      return;
    }
    setNewPlayerLoading(true);
    try {
      const newPlayer = {
        name: newPlayerName,
        team_id: Number(selectedTeamId),
        rank: 0,
        kills: 0,
        matches: 0,
        mvps: 0,
        totalPoints: 0,
      };
      const addedPlayer = await addPlayer(newPlayer);
      if (addedPlayer) {
        toast({ title: 'Success', description: 'Player added successfully!' });
        setShowAddPlayerModal(false);
        setNewPlayerName('');
        loadPlayers();
      } else {
        throw new Error('Failed to add player');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add player', variant: 'destructive' });
    } finally {
      setNewPlayerLoading(false);
    }
  };

  const openEditPlayerModal = (player: any) => {
    setEditPlayerId(player.id);
    setEditPlayerName(player.name);
    setEditPlayerRank(player.rank);
    setEditPlayerKills(player.kills);
    setEditPlayerMatches(player.matches);
    setEditPlayerMvps(player.mvps);
    setEditPlayerTotalPoints(player.totalPoints);
    setShowEditPlayerModal(true);
  };

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlayerId || !editPlayerName) {
      toast({ title: 'Error', description: 'Player name is required', variant: 'destructive' });
      return;
    }
    setEditPlayerLoading(true);
    try {
      const player = players.find(p => p.id === editPlayerId);
      if (!player) throw new Error('Player not found');
      const newTotalPoints = editPlayerKills * 1 + editPlayerMvps * 2;
      const updated = await updatePlayer({
        id: player.id,
        name: editPlayerName,
        team_id: player.team_id,
        rank: editPlayerRank,
        kills: editPlayerKills,
        matches: editPlayerMatches,
        mvps: editPlayerMvps,
        totalPoints: newTotalPoints,
      });
      if (updated) {
        toast({ title: 'Success', description: 'Player updated successfully!' });
        setShowEditPlayerModal(false);
        setEditPlayerId(null);
        setEditPlayerName('');
        loadPlayers();
      } else {
        throw new Error('Failed to update player');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update player', variant: 'destructive' });
    } finally {
      setEditPlayerLoading(false);
    }
  };

  const openDeletePlayerModal = (playerId: number) => {
    setPlayerToDelete(playerId);
    setShowDeletePlayerModal(true);
  };

  const handleDeletePlayerConfirmed = async () => {
    if (!playerToDelete) return;
    await handleDelete(playerToDelete);
    setShowDeletePlayerModal(false);
    setPlayerToDelete(null);
    loadPlayers();
  };

  const openDeleteTeamModal = (teamId: number) => {
    setTeamToDelete(teamId);
    setShowDeleteTeamModal(true);
  };

  const handleDeleteTeamConfirmed = async () => {
    if (!teamToDelete) return;
    // Delete all players in this team first
    await supabase.from('players').delete().eq('team_id', teamToDelete);
    // Then delete the team
    const { error } = await supabase.from('teams').delete().eq('id', teamToDelete);
    if (!error) {
      toast({ title: 'Success', description: 'Team deleted successfully!' });
      setShowDeleteTeamModal(false);
      setTeamToDelete(null);
      loadTeams();
      loadPlayers();
    } else {
      toast({ title: 'Error', description: error.message || 'Failed to delete team', variant: 'destructive' });
    }
  };

  // Get user info from session
  const user = session?.user;

  if (!sessionChecked) {
    return null
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header title="Admin Panel" />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <AdminLogin onLogin={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white" suppressHydrationWarning>
      <Header
        title="Admin Panel"
        userEmail={user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email}
        userInitial={
          user?.user_metadata?.name
            ? user.user_metadata.name[0].toUpperCase()
            : user?.user_metadata?.full_name
              ? user.user_metadata.full_name[0].toUpperCase()
              : user?.email
                ? user.email[0].toUpperCase()
                : '?'
        }
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-red-500">Admin Leaderboard Editor</h1>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowTeamModal(true)}
            className="bg-red-700 hover:bg-red-800 mr-4 flex items-center gap-2 px-4 py-2 rounded text-white font-semibold"
          >
            <span className="text-xl">+</span> New Team
          </button>
          <div className="relative" style={{ minWidth: 180 }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search player..."
              value={adminSearchTerm}
              onChange={e => setAdminSearchTerm(e.target.value)}
              className="pl-9 bg-black border border-red-700 text-white p-2 rounded focus:outline-none focus:border-red-400 placeholder-gray-400 w-full"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setActiveTeamId(team.id)}
                className={`px-6 py-2 rounded border-2 font-bold text-lg transition-colors ${activeTeamId === team.id ? 'bg-red-700 border-red-700 text-white' : 'bg-black border-red-700 text-red-400 hover:bg-red-900 hover:text-white'}`}
              >
                {team.name}
              </button>
            ))}
          </div>
          {activeTeamId && (
            <div className="w-full bg-black/90 border-2 border-red-700 rounded-xl p-6 flex flex-col items-center shadow-lg">
              <div className="text-2xl font-bold text-red-400 mb-4">
                {teams.find(t => t.id === activeTeamId)?.name}
              </div>
              <button
                onClick={() => openAddPlayerModal(activeTeamId)}
                className="mb-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-white font-semibold"
              >
                Add Player
              </button>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-black text-red-400">
                      <th className="p-2 text-center">Name</th>
                      <th className="p-2 text-center">Kills</th>
                      <th className="p-2 text-center">Matches</th>
                      <th className="p-2 text-center">MVPs</th>
                      <th className="p-2 text-center">Total Points</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const teamPlayers = players.filter(p => p.team_id === activeTeamId && p.name.toLowerCase().includes(adminSearchTerm.toLowerCase()));
                      const sortedPlayers = [...teamPlayers].sort((a, b) => (b.kills * 1 + b.mvps * 2) - (a.kills * 1 + a.mvps * 2));
                      return (
                        sortedPlayers.map((player) => (
                          <tr key={player.id} className="border-b border-red-900">
                            <td className="p-2 text-center">{player.name}</td>
                            <td className="p-2 text-center">{player.kills}</td>
                            <td className="p-2 text-center">{player.matches}</td>
                            <td className="p-2 text-center">{player.mvps}</td>
                            <td className="p-2 text-center">{player.kills * 1 + player.mvps * 2}</td>
                            <td className="p-2 text-center flex gap-2 justify-center">
                              <Button onClick={() => openEditPlayerModal(player)} className="bg-red-700 hover:bg-red-800">Edit</Button>
                              <Button onClick={() => openDeletePlayerModal(player.id)} className="bg-gray-700 hover:bg-gray-800">Delete</Button>
                            </td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => openDeleteTeamModal(activeTeamId)}
                className="mt-6 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-sm"
              >
                Delete Team
              </button>
            </div>
          )}
        </div>
      </main>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h2>
            <p className="text-white mb-6 text-center">Are you sure you want to delete this player? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <form
            onSubmit={handleCreateTeam}
            className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center gap-4"
          >
            <h2 className="text-xl font-bold text-red-500 mb-2">Create New Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              required
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold"
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <form
            onSubmit={handleAddPlayerToTeam}
            className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center gap-4"
          >
            <h2 className="text-xl font-bold text-red-500 mb-2">Add Player</h2>
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              required
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={newPlayerLoading}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
              >
                {newPlayerLoading ? 'Adding...' : 'Add Player'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {showEditPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <form
            onSubmit={handleEditPlayer}
            className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center gap-4"
          >
            <h2 className="text-xl font-bold text-red-500 mb-2">Edit Player</h2>
            <label className="w-full text-left text-white font-semibold">Name</label>
            <input
              type="text"
              placeholder={editPlayerName || "Player Name"}
              value={editPlayerName}
              onChange={e => setEditPlayerName(e.target.value)}
              required
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <label className="w-full text-left text-white font-semibold">Matches</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              placeholder={editPlayerMatches.toString()}
              value={editPlayerMatches === 0 ? "" : editPlayerMatches}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setEditPlayerMatches(val === "" ? 0 : Number(val));
              }}
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <label className="w-full text-left text-white font-semibold">Kills</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              placeholder={editPlayerKills.toString()}
              value={editPlayerKills === 0 ? "" : editPlayerKills}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setEditPlayerKills(val === "" ? 0 : Number(val));
              }}
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <label className="w-full text-left text-white font-semibold">MVPs</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              placeholder={editPlayerMvps.toString()}
              value={editPlayerMvps === 0 ? "" : editPlayerMvps}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setEditPlayerMvps(val === "" ? 0 : Number(val));
              }}
              className="bg-black border border-red-700 text-white p-2 rounded w-full focus:outline-none focus:border-red-400 placeholder-gray-400"
            />
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={editPlayerLoading}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
              >
                {editPlayerLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditPlayerModal(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {showDeletePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h2>
            <p className="text-white mb-6 text-center">Are you sure you want to delete this player? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDeletePlayerConfirmed}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePlayerModal(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black border-2 border-red-700 rounded-xl p-8 shadow-lg w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h2>
            <p className="text-white mb-6 text-center">Are you sure you want to delete this team? All its players will also be deleted. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteTeamConfirmed}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteTeamModal(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 