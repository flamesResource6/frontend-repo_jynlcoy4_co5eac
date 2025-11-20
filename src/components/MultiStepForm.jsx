import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Upload, CreditCard } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL

const steps = [
  { id: 1, title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Program Selection', description: 'Choose a program and course' },
  { id: 3, title: 'Documents', description: 'Upload your documents' },
  { id: 4, title: 'Fees & Payment', description: 'Review and pay fees' },
  { id: 5, title: 'Review & Submit', description: 'Finalize your application' }
]

export default function MultiStepForm({ token, onSubmitted }) {
  const [active, setActive] = useState(1)
  const [applicationId, setApplicationId] = useState(null)
  const [data, setData] = useState({ personal_info: {}, selection: {}, documents: [], fees: {}, review: {} })
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/applications/start`, { method: 'POST', headers })
      .then(r => r.json())
      .then(res => setApplicationId(res.id))
      .catch(() => {})
  }, [token])

  const saveStep = async () => {
    const payload = { step: active, data: dataForStep() }
    await fetch(`${API}/applications/${applicationId}/step`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    })
  }

  const dataForStep = () => {
    switch (active) {
      case 1: return data.personal_info
      case 2: return data.selection
      case 3: return { documents: data.documents }
      case 4: return data.fees
      case 5: return data.review
      default: return {}
    }
  }

  const submit = async () => {
    await saveStep()
    await fetch(`${API}/applications/${applicationId}/submit`, { method: 'POST', headers })
    onSubmitted?.()
  }

  const StepIndicator = () => (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {steps.map((s, i) => {
        const done = active > s.id
        const current = active === s.id
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className={`size-9 rounded-full border flex items-center justify-center ${done ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : current ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'border-white/20 text-white/60'}`}>
              {done ? <Check size={18} /> : s.id}
            </div>
            <div className="hidden md:block">
              <div className="text-white/90 font-medium">{s.title}</div>
              <div className="text-xs text-white/50">{s.description}</div>
            </div>
            {i < steps.length - 1 && <div className="w-10 h-px bg-white/20" />}
          </div>
        )
      })}
    </div>
  )

  const NextBar = () => (
    <div className="flex items-center justify-between mt-6">
      <button disabled={active===1} onClick={() => setActive(a => Math.max(1, a-1))} className="text-white/70 hover:text-white transition">Back</button>
      {active < 5 ? (
        <button onClick={async ()=>{ await saveStep(); setActive(a=>a+1)}} className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition">
          Next <ArrowRight size={18} />
        </button>
      ) : (
        <button onClick={submit} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition">
          Submit Application <Check size={18} />
        </button>
      )}
    </div>
  )

  return (
    <section className="relative">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <StepIndicator />

        <div className="mt-6 min-h-[220px]">
          <AnimatePresence mode="wait">
            {active === 1 && (
              <motion.div key="s1" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="grid md:grid-cols-2 gap-4">
                  <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Full name" value={data.personal_info.name||''} onChange={e=>setData(d=>({...d, personal_info:{...d.personal_info, name:e.target.value}}))} />
                  <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Phone" value={data.personal_info.phone||''} onChange={e=>setData(d=>({...d, personal_info:{...d.personal_info, phone:e.target.value}}))} />
                  <input className="md:col-span-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Address" value={data.personal_info.address||''} onChange={e=>setData(d=>({...d, personal_info:{...d.personal_info, address:e.target.value}}))} />
                </div>
                <NextBar />
              </motion.div>
            )}

            {active === 2 && (
              <motion.div key="s2" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="grid md:grid-cols-2 gap-4">
                  <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Program Code" value={data.selection.program_code||''} onChange={e=>setData(d=>({...d, selection:{...d.selection, program_code:e.target.value}}))} />
                  <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Course Code" value={data.selection.course_code||''} onChange={e=>setData(d=>({...d, selection:{...d.selection, course_code:e.target.value}}))} />
                </div>
                <NextBar />
              </motion.div>
            )}

            {active === 3 && (
              <motion.div key="s3" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-white/70">
                    <Upload size={18} className="mr-2"/> Upload capability simulated — add document names
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="Document name (e.g., Passport.pdf)" onKeyDown={e=>{ if(e.key==='Enter'){ const v=e.currentTarget.value.trim(); if(v){ setData(d=>({...d, documents:[...d.documents, {name:v}]})); e.currentTarget.value=''} } }} />
                    <div className="text-white/80">
                      {data.documents.map((doc,i)=>(<div key={i} className="text-sm">• {doc.name}</div>))}
                    </div>
                  </div>
                </div>
                <NextBar />
              </motion.div>
            )}

            {active === 4 && (
              <motion.div key="s4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-white/70 text-sm mb-1">Amount (USD)</label>
                    <input type="number" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="500" value={data.fees.amount||''} onChange={e=>setData(d=>({...d, fees:{...d.fees, amount: Number(e.target.value)}}))} />
                  </div>
                  <button className="inline-flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition"><CreditCard size={18}/> Pay</button>
                </div>
                <NextBar />
              </motion.div>
            )}

            {active === 5 && (
              <motion.div key="s5" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="text-white/80 space-y-2">
                  <div className="font-semibold text-white">Review</div>
                  <pre className="bg-black/30 rounded-lg p-4 text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
                </div>
                <NextBar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
