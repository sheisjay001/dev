import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

global.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/health')) return new Response(JSON.stringify({ ok: true }), { status: 200 })
  if (u.includes('/auth/login')) return new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 })
  if (u.includes('/contacts/list')) return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
  return new Response(JSON.stringify({ error: 'offline' }), { status: 500 })
}

describe('Login validation UI', () => {
  it('shows helper text for invalid email and password', async () => {
    render(<ToastProvider><App /></ToastProvider>)
    const email = screen.getByPlaceholderText('name@company.com')
    const password = screen.getByPlaceholderText('••••••••')
    await userEvent.type(email, 'bad')
    await userEvent.type(password, '123')
    expect(await screen.findByText('Enter a valid email')).toBeTruthy()
    expect(await screen.findByText('At least 6 characters')).toBeTruthy()
  })

  it('allows user to sign out from dashboard', async () => {
    // Start with token
    localStorage.setItem('token', 'mock-token')
    render(<ToastProvider><App /></ToastProvider>)
    
    // Should see dashboard
    expect(await screen.findByText('Sign out')).toBeTruthy()
    
    // Click sign out
    await userEvent.click(screen.getByText('Sign out'))
    
    // Should see login screen
    expect(await screen.findByText('Welcome back')).toBeTruthy()
    expect(localStorage.getItem('token')).toBeNull()
  })
})
