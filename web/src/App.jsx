import { useEffect, useState } from 'react'
import { useToast } from './components/Toast.jsx'
import { isEmail, isNonEmpty, isPhone, isPositiveNumber } from './lib/validate.js'
import { createClient } from './lib/apiClient.js'
import FieldError from './components/FieldError.jsx'

const API = import.meta.env.VITE_API_URL || '/api'

function Login({ onAuthed, client }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const emailValid = isEmail(email)
  const passwordValid = password.length >= 6
  const emailInvalid = email && !emailValid
  const passwordInvalid = password && !passwordValid

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!isEmail(email) || password.length < 6) {
        setError('Invalid credentials')
        toast.push('Invalid email or password', 'error')
        setLoading(false)
        return
      }
      const data = await client.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      onAuthed(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  async function register() {
    setLoading(true)
    setError('')
    try {
      if (!isEmail(email) || password.length < 6) {
        setError('Invalid credentials')
        toast.push('Invalid email or password', 'error')
        setLoading(false)
        return
      }
      const data = await client.post('/auth/register', { email, password, name: email.split('@')[0] })
      localStorage.setItem('token', data.token)
      onAuthed(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/80 backdrop-blur p-8 rounded-2xl shadow-xl border border-white/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto text-2xl font-bold">C</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 ml-1">Email</label>
            <input className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all ${emailInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="name@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <FieldError show={emailInvalid}>Enter a valid email</FieldError>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 ml-1">Password</label>
            <input className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all ${passwordInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <FieldError show={passwordInvalid}>At least 6 characters</FieldError>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className={`rounded-lg px-4 py-2.5 font-medium transition-all ${loading || !emailValid || !passwordValid ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg active:scale-95'}`} disabled={loading || !emailValid || !passwordValid}>{loading ? '...' : 'Login'}</button>
          <button type="button" className={`rounded-lg px-4 py-2.5 font-medium transition-all ${loading || !emailValid || !passwordValid ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 hover:border-brand-300 active:scale-95'}`} disabled={loading || !emailValid || !passwordValid} onClick={register}>Register</button>
        </div>
      </form>
    </div>
  )
}

function Contacts({ token, client }) {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const nameValid = isNonEmpty(name)
  const emailValid2 = !email || isEmail(email)
  const phoneValid = !phone || isPhone(phone)
  const nameInvalid = name && !nameValid
  const emailInvalid = email && !emailValid2
  const phoneInvalid = phone && !phoneValid

  let controller
  async function load() {
    setLoading(true)
    try {
      if (controller) controller.abort()
      controller = new AbortController()
      const data = await client.get(`/contacts/list?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`, { signal: controller.signal })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  async function add() {
    try {
      if (!isNonEmpty(name) || !isPhone(phone) || (email && !isEmail(email))) {
        toast.push('Invalid contact details', 'error')
        return
      }
      await client.post('/contacts', { name, email, phone })
      setName(''); setEmail(''); setPhone('')
      toast.push('Contact added', 'success')
      await load()
    } catch {
      toast.push('Network error', 'error')
    }
  }

  useEffect(() => { load() }, [search, page, limit])
  const totalPages = Math.max(1, Math.ceil(total / limit))
  function goto(n) {
    setPage(Math.min(totalPages, Math.max(1, n)))
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          <div className="flex gap-2">
             <input className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all w-64" placeholder="Search contacts..." value={search} onChange={e=>{ setPage(1); setSearch(e.target.value) }} />
             <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
               <option value="5">5 per page</option>
               <option value="10">10 per page</option>
               <option value="20">20 per page</option>
             </select>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-3 space-y-1">
              <input className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all ${nameInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
              <FieldError show={nameInvalid}>Required</FieldError>
            </div>
            <div className="col-span-4 space-y-1">
              <input className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all ${emailInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
              <FieldError show={emailInvalid}>Invalid email</FieldError>
            </div>
            <div className="col-span-3 space-y-1">
              <input className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all ${phoneInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
              <FieldError show={phoneInvalid}>Invalid phone</FieldError>
            </div>
            <button className={`col-span-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${loading || !(nameValid && emailValid2 && phoneValid) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow active:scale-95'}`} onClick={add} disabled={loading || !(nameValid && emailValid2 && phoneValid)}>Add Contact</button>
          </div>
        </div>

        <div className="space-y-2">
          {items.map(c => (
            <div key={c.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 border border-transparent hover:border-brand-100 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    {c.email && <span>{c.email}</span>}
                    {c.email && c.phone && <span>·</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-10 text-gray-400">No contacts found</div>}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page<=1 || loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} disabled={page<=1 || loading} onClick={()=>goto(page-1)}>Previous</button>
          <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">Page {page} of {totalPages} · {total} results</span>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page>=totalPages || loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} disabled={page>=totalPages || loading} onClick={()=>goto(page+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [healthy, setHealthy] = useState('checking...')
  const [tab, setTab] = useState('contacts')
  const toast = useToast()
  const client = createClient({ baseUrl: API, getToken: () => token, toast: (t, type) => toast.push(t, type) })
  useEffect(() => {
    fetch(`${API}/health`).then(r=>r.json()).then(()=>setHealthy('ok')).catch(()=>setHealthy('offline'))
  }, [])
  if (!token) return <Login onAuthed={setToken} client={client} />

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-gray-900 tracking-tight">CRM</span>
          </div>
          <button onClick={()=>{ setToken(null); localStorage.removeItem('token') }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">Sign out</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <nav className="flex space-x-1 bg-white/50 p-1 rounded-xl backdrop-blur border border-gray-200/50 w-fit">
          <button onClick={()=>setTab('contacts')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab==='contacts'?'bg-white text-brand-700 shadow-sm ring-1 ring-black/5':'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>Contacts</button>
          <button onClick={()=>setTab('deals')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab==='deals'?'bg-white text-brand-700 shadow-sm ring-1 ring-black/5':'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>Deals</button>
        </nav>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tab==='contacts' ? <Contacts token={token} client={client} /> : <Deals token={token} client={client} />}
        </main>
      </div>
    </div>
  )
}

function Deals({ token, client }) {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [stage, setStage] = useState('new')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const titleValid = isNonEmpty(title)
  const amountValid = !amount || isPositiveNumber(amount)
  const titleInvalid = title && !titleValid
  const amountInvalid = amount && !amountValid

  async function load() {
    const data = await client.get('/deals')
    setItems(data)
  }
  async function add() {
    setLoading(true)
    try {
      if (!isNonEmpty(title) || (amount && !isPositiveNumber(amount))) {
        toast.push('Invalid deal details', 'error')
        return
      }
      await client.post('/deals', { title, amount, stage })
      setTitle(''); setAmount(''); setStage('new')
      toast.push('Deal added', 'success')
      await load()
    } finally {
      setLoading(false)
    }
  }
  async function updateStage(id, s) {
    setLoading(true)
    try {
      await client.patch(`/deals/${id}/stage`, { stage: s })
      toast.push('Stage updated', 'success')
      await load()
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Deals</h2>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-5 space-y-1">
              <input className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all ${titleInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="Deal Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <FieldError show={titleInvalid}>Required</FieldError>
            </div>
            <div className="col-span-3 space-y-1">
              <input className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all ${amountInvalid?'border-red-500 focus:ring-red-200':''}`} placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
              <FieldError show={amountInvalid}>Positive number</FieldError>
            </div>
            <div className="col-span-2">
              <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" value={stage} onChange={e=>setStage(e.target.value)}>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <button className={`col-span-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${loading || !(titleValid && amountValid) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow active:scale-95'}`} onClick={add} disabled={loading || !(titleValid && amountValid)}>Add Deal</button>
          </div>
        </div>

        <div className="space-y-2">
          {items.map(d => (
            <div key={d.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 border border-transparent hover:border-brand-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-2 h-10 rounded-full ${d.stage==='won'?'bg-brand-500':d.stage==='lost'?'bg-red-500':d.stage==='qualified'?'bg-blue-500':'bg-gray-300'}`}></div>
                <div>
                  <div className="font-medium text-gray-900">{d.title}</div>
                  <div className="text-sm text-gray-500 font-mono">₦{Number(d.amount).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <select className={`text-xs font-bold uppercase tracking-wide border-none bg-transparent outline-none cursor-pointer rounded px-2 py-1 ${d.stage==='won'?'text-brand-700 bg-brand-50':d.stage==='lost'?'text-red-700 bg-red-50':d.stage==='qualified'?'text-blue-700 bg-blue-50':'text-gray-600 bg-gray-100'}`} value={d.stage} onChange={e=>updateStage(d.id, e.target.value)} disabled={loading}>
                  <option value="new">New</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-10 text-gray-400">No deals found</div>}
        </div>
      </div>
    </div>
  )
}
