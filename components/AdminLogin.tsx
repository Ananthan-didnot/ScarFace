'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else onLogin()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-black/90 border-2 border-red-700 shadow-[0_0_16px_2px_rgba(255,0,0,0.3)] rounded-xl p-8 flex flex-col gap-4 w-full max-w-xs"
      >
        <h2 className="text-2xl font-bold text-red-500 mb-2 text-center">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="bg-black border border-red-700 text-white p-2 rounded focus:outline-none focus:border-red-400 placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="bg-black border border-red-700 text-white p-2 rounded focus:outline-none focus:border-red-400 placeholder-gray-400"
          onKeyDown={e => { if (e.key === 'Enter') { (e.target as HTMLInputElement).form?.requestSubmit(); } }}
        />
        <button
          type="submit"
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded transition-colors"
        >
          Login
        </button>
        {error && <div className="text-red-400 text-center mt-2">{error}</div>}
      </form>
    </div>
  )
} 