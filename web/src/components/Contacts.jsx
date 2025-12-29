import { useState, useEffect } from 'react'
import { useToast } from './Toast.jsx'
import { isEmail, isNonEmpty, isPhone } from '../lib/validate.js'
import FieldError from './FieldError.jsx'

export default function Contacts({ token, client }) {
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
                  <div className="font-bold text-gray-900">{c.name}</div>
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
