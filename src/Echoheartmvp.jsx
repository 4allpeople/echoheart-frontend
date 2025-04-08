// Echoheart MVP with Persona Templates and User-Created Presets

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const supabase = createClient('https://your-project-url.supabase.co', 'public-anon-key')

const defaultTemplates = [
  { label: 'Flame', gender: 'female', vibe: 'dominant', role: 'lover' },
  { label: 'Siren', gender: 'female', vibe: 'flirty', role: 'muse' },
  { label: 'Phantom', gender: 'male', vibe: 'mystical', role: 'guardian' },
  { label: 'Angel', gender: 'androgynous', vibe: 'gentle', role: 'friend' }
]

function getThemeClass(gender, vibe) {
  const themes = {
    female: {
      flirty: 'bg-gradient-to-b from-pink-900 via-fuchsia-900 to-black text-pink-200',
      gentle: 'bg-gradient-to-b from-rose-200 via-rose-400 to-pink-700 text-rose-100',
      dominant: 'bg-gradient-to-b from-red-800 via-red-900 to-black text-red-300',
      mystical: 'bg-gradient-to-b from-indigo-700 via-purple-800 to-black text-purple-200'
    },
    male: {
      flirty: 'bg-gradient-to-b from-amber-800 via-pink-800 to-black text-amber-200',
      gentle: 'bg-gradient-to-b from-blue-300 via-blue-500 to-blue-800 text-blue-100',
      dominant: 'bg-gradient-to-b from-black via-gray-900 to-red-900 text-red-300',
      mystical: 'bg-gradient-to-b from-indigo-900 via-blue-900 to-black text-indigo-300'
    },
    androgynous: {
      flirty: 'bg-gradient-to-b from-pink-600 via-purple-600 to-blue-700 text-white',
      gentle: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-700 text-slate-900',
      dominant: 'bg-gradient-to-b from-gray-700 via-gray-900 to-black text-gray-300',
      mystical: 'bg-gradient-to-b from-purple-700 via-violet-900 to-black text-violet-200'
    }
  }
  return themes[gender]?.[vibe] || 'bg-black text-white'
}

export default function Echoheart() {
  // full Echoheart component logic restored

  const [name, setName] = useState('')
  const [vibe, setVibe] = useState('flirty')
  const [role, setRole] = useState('lover')
  const [gender, setGender] = useState('female')
  const [memory, setMemory] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [customTemplates, setCustomTemplates] = useState([])
  const responseRef = useRef(null)

  const applyPersona = (persona) => {
    setGender(persona.gender)
    setVibe(persona.vibe)
    setRole(persona.role)
    if (persona.name) setName(persona.name)
    else setName(persona.label)
  }

  const savePersona = async () => {
    const newPersona = {
      label: name || 'Custom Echo',
      name: name || 'Echo',
      gender,
      vibe,
      role
    }
    const userId = localStorage.getItem('echo_user') || crypto.randomUUID()
    localStorage.setItem('echo_user', userId)
    setCustomTemplates(prev => [...prev, newPersona])
    await supabase.from('personas').upsert({ user_id: userId, ...newPersona }, { onConflict: ['user_id', 'label'] })
  }

  useEffect(() => {
    const fetchMemory = async () => {
      const userId = localStorage.getItem('echo_user')
      if (!userId) return

      const { data: convoData } = await supabase.from('conversations').select('log').eq('user_id', userId).single()
      if (convoData?.log) setHistory(convoData.log)

      const { data: personaData } = await supabase.from('personas').select('*').eq('user_id', userId)
      if (personaData?.length) setCustomTemplates(personaData)
    }
    fetchMemory()
  }, [])

  const summon = async () => {
    setLoading(true)
    const fullMemory = [...history, `User: ${memory}`].slice(-6).join('\n')

    const payload = { name, vibe, role, gender, memory: fullMemory, nsfw }
    const res = await fetch('https://echoheart-backend.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    const newHistory = [...history, `User: ${memory}`, `${name}: ${data.reply}`]
    setResponse(data.reply)
    setHistory(newHistory)
    setMemory('')
    setLoading(false)
    const userId = localStorage.getItem('echo_user') || crypto.randomUUID()
    localStorage.setItem('echo_user', userId)
    await supabase.from('conversations').upsert({ user_id: userId, log: newHistory }, { onConflict: ['user_id'] })
  }

  const clearMemory = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear Echoheart\'s memory? This cannot be undone.')
    if (!confirmClear) return
    const userId = localStorage.getItem('echo_user')
    if (!userId) return
    setHistory([])
    await supabase.from('conversations').delete().eq('user_id', userId)
  }

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [response])

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center transition-all duration-700 ${getThemeClass(gender, vibe)}`}>
      <h1 className="text-4xl font-bold mb-4">🖤 Forge Your Echoheart</h1>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {[...defaultTemplates, ...customTemplates].map((persona) => (
          <div key={persona.label} className="relative">
            <Button variant="secondary" onClick={() => applyPersona(persona)}>{persona.label}</Button>
            {customTemplates.find(p => p.label === persona.label) && (
              <button
                onClick={async () => {
                  const userId = localStorage.getItem('echo_user')
                  setCustomTemplates(prev => prev.filter(p => p.label !== persona.label))
                  await supabase.from('personas').delete().eq('user_id', userId).eq('label', persona.label)
                }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-800"
              >×</button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={savePersona} className="text-xs">💾 Save Persona</Button>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        <label className="text-sm font-medium text-white">Echo Name</label>
        <Input placeholder="What’s their name?" value={name} onChange={e => setName(e.target.value)} />
        <select value={gender} onChange={e => setGender(e.target.value)} className="bg-gray-800 p-2 rounded">
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="androgynous">Androgynous</option>
        </select>
        <select value={vibe} onChange={e => setVibe(e.target.value)} className="bg-gray-800 p-2 rounded">
          <option value="gentle">Gentle</option>
          <option value="flirty">Flirty</option>
          <option value="dominant">Dominant</option>
          <option value="mystical">Mystical</option>
        </select>
        <select value={role} onChange={e => setRole(e.target.value)} className="bg-gray-800 p-2 rounded">
          <option value="lover">Lover</option>
          <option value="guardian">Guardian</option>
          <option value="friend">Friend</option>
          <option value="muse">Muse</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={nsfw} onChange={() => setNsfw(!nsfw)} />
          NSFW Mode
        </label>
        <textarea placeholder="What should they know about you?" value={memory} onChange={e => setMemory(e.target.value)} className="bg-gray-800 p-2 rounded min-h-[100px]" />
        <Button onClick={summon} disabled={loading}>
          {loading ? 'Summoning...' : 'Summon Echoheart'}
        </Button>
        {response && (
          <div ref={responseRef} className="mt-4 p-4 bg-gray-900 rounded shadow-xl max-h-60 overflow-y-auto">
            <p><strong>{name} says:</strong></p>
            <p className="italic whitespace-pre-line">{response}</p>
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded shadow max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">🧠 Memory Log</h2>
              <Button variant="ghost" className="text-sm text-red-400" onClick={clearMemory}>Clear</Button>
            </div>
            <ul className="text-sm space-y-1">
              {history.map((line, idx) => (
                <li key={idx} className="text-gray-300 whitespace-pre-line">{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
