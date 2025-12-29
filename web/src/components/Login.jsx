import { useState } from 'react'
import { useToast } from './Toast.jsx'
import { isEmail } from '../lib/validate.js'
import FieldError from './FieldError.jsx'

export default function Login({ onAuthed, client }) {
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero / Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <img src="/logo.svg" className="w-16 h-16 mb-8 shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500" alt="CRM Logo" />
          <h1 className="text-6xl font-extrabold mb-6 leading-tight tracking-tight">The World's Best CRM Platform</h1>
          <p className="text-xl text-brand-100 max-w-md leading-relaxed font-medium">
            Manage relationships, track deals, and close more sales with our intuitive, powerful, and beautiful interface.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Smart Contacts</h3>
              <p className="text-brand-100 text-sm">Organize all your customer details in one secure place.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Visual Pipeline</h3>
              <p className="text-brand-100 text-sm">Track deals with our interactive Kanban board.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Lightning Fast</h3>
              <p className="text-brand-100 text-sm">Built for speed so you never miss an opportunity.</p>
            </div>
          </div>
        </div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="lg:hidden w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto text-2xl font-bold">C</div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
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
    </div>
  )
}
