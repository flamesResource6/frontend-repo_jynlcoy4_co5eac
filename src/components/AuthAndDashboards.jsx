import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, LayoutDashboard, Shield } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token')||'')
  const [me, setMe] = useState(null)
  const headers = useMemo(()=>({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(()=>{
    if(!token){ setMe(null); return }
    fetch(`${API}/auth/me`, { headers })
      .then(r=>r.json()).then(setMe).catch(()=>{})
  }, [token])

  const login = async (email, password) => {
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
    if(!r.ok) throw new Error('Login failed')
    const res = await r.json(); localStorage.setItem('token', res.token); setToken(res.token)
  }

  const register = async (email, password, name) => {
    const r = await fetch(`${API}/auth/register`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password, name }) })
    if(!r.ok) throw new Error('Register failed')
    await login(email, password)
  }

  const logout = async () => {
    if(!token) return; await fetch(`${API}/auth/logout`, { method: 'POST', headers }); localStorage.removeItem('token'); setToken('')
  }

  return { token, me, login, register, logout, headers }
}

function StudentDashboard({ me, headers }){
  const [apps, setApps] = useState([])
  const [payments, setPayments] = useState([])
  useEffect(()=>{
    if(!me) return
    fetch(`${API}/applications/me`, { headers }).then(r=>r.json()).then(setApps)
    fetch(`${API}/payments/me`, { headers }).then(r=>r.json()).then(setPayments)
  }, [me])
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold mb-3">Applications</div>
        {apps.map(a=> (
          <div key={a.id} className="flex items-center justify-between bg-black/30 rounded-lg p-3 mb-2">
            <div className="text-white/80">#{a.id.slice(-6)} — {a.status}</div>
            <div className="text-xs text-white/50">Step {a.step}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold mb-3">Payments</div>
        {payments.map(p => (
          <div key={p.id} className="text-white/80 text-sm">#{p.id.slice(-6)} — {p.amount} {p.currency} • {p.status}</div>
        ))}
      </div>
    </div>
  )
}

function AdminDashboard({ headers }){
  const [stats, setStats] = useState(null)
  useEffect(()=>{
    fetch(`${API}/admin/stats`, { headers }).then(r=>r.json()).then(setStats).catch(()=>{})
  }, [])
  if(!stats) return <div className="text-white/70">Loading admin stats…</div>
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {Object.entries(stats).map(([k,v])=> (
        <div key={k} className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-4 text-white">
          <div className="text-white/60 text-sm mb-1">{k}</div>
          <div className="text-3xl font-extrabold">{v}</div>
        </div>
      ))}
    </div>
  )
}

export default function AuthAndDashboards(){
  const { token, me, login, register, logout, headers } = useAuth()
  const [mode, setMode] = useState('login')

  if(!token || !me){
    return (
      <section className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 text-white/80 mb-6"><LogIn size={18}/> Secure Access</div>
          <div className="flex gap-2 mb-6">
            <button onClick={()=>setMode('login')} className={`px-3 py-1 rounded-lg ${mode==='login'?'bg-cyan-500 text-slate-900':'bg-white/10 text-white/80'}`}>Login</button>
            <button onClick={()=>setMode('register')} className={`px-3 py-1 rounded-lg ${mode==='register'?'bg-cyan-500 text-slate-900':'bg-white/10 text-white/80'}`}>Register</button>
          </div>
          <AuthForm mode={mode} onLogin={login} onRegister={register} />
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <LayoutDashboard />
          <div className="font-semibold">Welcome, {me.name || me.email}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-white/60 text-sm">Role: {me.role}</div>
          <button onClick={logout} className="px-3 py-1 rounded-lg bg-white/10 text-white/80 hover:text-white">Logout</button>
        </div>
      </div>

      {me.role === 'admin' ? (
        <div>
          <div className="flex items-center gap-2 text-white/80 mb-4"><Shield size={18}/> Admin Dashboard</div>
          <AdminDashboard headers={headers} />
        </div>
      ) : (
        <div className="space-y-8">
          <MultiCTA token={token} headers={headers} />
          <StudentDashboard me={me} headers={headers} />
        </div>
      )}
    </section>
  )
}

function AuthForm({ mode, onLogin, onRegister }){
  const [email, setEmail] = useState('student@example.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try{
      if(mode==='login') await onLogin(email, password)
      else await onRegister(email, password, name)
    }catch(e){ setErr(e.message) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode==='register' && (
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
      )}
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition">{mode==='login'?'Login':'Create account'}</button>
    </form>
  )
}

function MultiCTA({ token, headers }){
  const [started, setStarted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-6">
      <div className="text-white text-lg font-semibold mb-2">Start your application</div>
      <div className="text-white/70 mb-4">A guided, multi-step experience with save points and a final review.</div>
      <div className="flex flex-wrap gap-3">
        <button onClick={()=>setShowForm(true)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg">Begin</button>
        <a href="#" className="text-white/70 hover:text-white">View programs</a>
      </div>
      {showForm && (
        <div className="mt-6">
          <DynamicForm token={token} onDone={()=>setShowForm(false)} />
        </div>
      )}
    </div>
  )
}

function DynamicForm({ token, onDone }){
  const [submitted, setSubmitted] = useState(false)
  return (
    <div>
      {submitted ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">
          Submitted! You can see the status in your dashboard.
        </div>
      ) : (
        <div>
          <MultiStepForm token={token} onSubmitted={()=>{ setSubmitted(true); onDone?.() }} />
        </div>
      )}
    </div>
  )
}

import MultiStepForm from './MultiStepForm'
