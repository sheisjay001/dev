import { useState, useEffect } from 'react'
import { useToast } from './components/Toast.jsx'
import { createClient } from './lib/apiClient.js'
import Login from './components/Login.jsx'
import Contacts from './components/Contacts.jsx'
import DealsBoard from './components/DealsBoard.jsx'
import Dashboard from './components/Dashboard.jsx'

const API = import.meta.env.VITE_API_URL || '/api'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [healthy, setHealthy] = useState('checking...')
  const [tab, setTab] = useState('dashboard')
  const toast = useToast()
  const client = createClient({ 
    baseUrl: API, 
    getToken: () => token, 
    toast: (t, type) => toast.push(t, type),
    onUnauthorized: () => {
      setToken(null)
      localStorage.removeItem('token')
      toast.push('Session expired. Please login again.', 'error')
    }
  })

  useEffect(() => {
    fetch(`${API}/health`).then(r=>r.json()).then(()=>setHealthy('ok')).catch(()=>setHealthy('offline'))
  }, [])

  if (!token) return <Login onAuthed={setToken} client={client} />

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20 flex flex-col h-screen overflow-hidden">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-30 border-b border-gray-100 shadow-sm flex-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={()=>setTab('dashboard')}>
            <img src="/logo.svg" className="w-8 h-8 shadow-sm hover:scale-105 transition-transform" alt="CRM Logo" />
            <span className="font-bold text-gray-900 tracking-tight hidden md:inline">CRM</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            <nav className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg shrink-0">
              <button onClick={()=>setTab('dashboard')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab==='dashboard'?'bg-white text-brand-700 shadow-sm ring-1 ring-black/5':'text-gray-500 hover:text-gray-900'}`}>Dashboard</button>
              <button onClick={()=>setTab('contacts')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab==='contacts'?'bg-white text-brand-700 shadow-sm ring-1 ring-black/5':'text-gray-500 hover:text-gray-900'}`}>Contacts</button>
              <button onClick={()=>setTab('deals')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab==='deals'?'bg-white text-brand-700 shadow-sm ring-1 ring-black/5':'text-gray-500 hover:text-gray-900'}`}>Deals</button>
            </nav>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <button onClick={()=>{ setToken(null); localStorage.removeItem('token') }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors whitespace-nowrap pl-2">Sign out</button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 h-full">
          <main className="h-full">
            <AnimatePresence mode="wait">
              {tab==='dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Dashboard token={token} client={client} setTab={setTab} />
                </motion.div>
              )}
              {tab==='contacts' && (
                <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Contacts token={token} client={client} />
                </motion.div>
              )}
              {tab==='deals' && (
                <motion.div key="deals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <DealsBoard token={token} client={client} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
