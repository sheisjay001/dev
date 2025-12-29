import { useState, useEffect } from 'react'
import { useToast } from './Toast.jsx'

export default function Dashboard({ token, client, setTab }) {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, pipelineValue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch contacts count
        const contactsData = await client.get('/contacts/list?limit=1')
        
        // Fetch deals for calculation
        const dealsData = await client.get('/deals')
        const totalValue = dealsData.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0)

        setStats({
          contacts: contactsData.total || 0,
          deals: dealsData.length || 0,
          pipelineValue: totalValue
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">Welcome to Your Dashboard</h1>
          <p className="text-brand-100 text-base md:text-lg max-w-2xl font-medium">
            Here's what's happening in your CRM today. You have <span className="font-bold text-white">{stats.deals} active deals</span> and <span className="font-bold text-white">{stats.contacts} contacts</span>.
          </p>
          <div className="mt-8 flex flex-col md:flex-row gap-3">
             <button onClick={()=>setTab('deals')} className="bg-white text-brand-700 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
               <span>View Pipeline</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             </button>
             <button onClick={()=>setTab('contacts')} className="bg-brand-500/30 backdrop-blur border border-white/20 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-500/40 transition-all active:scale-95 text-center">
               Manage Contacts
             </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Contacts</div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.contacts}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Active Deals</div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.deals}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Pipeline Value</div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '...' : `₦${stats.pipelineValue.toLocaleString()}`}</div>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">What you can do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={()=>setTab('contacts')}>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Contacts</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Add, edit, and organize your contacts. Keep track of emails and phone numbers in one centralized database.
            </p>
          </div>

          <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={()=>setTab('deals')}>
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Track Deals</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Visualize your sales pipeline with our drag-and-drop Kanban board. Move deals from 'New' to 'Won' seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
