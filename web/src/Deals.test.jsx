import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'

global.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/health')) return new Response(JSON.stringify({ ok: true }), { status: 200 })
  if (u.includes('/contacts/list')) return new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 5 }), { status: 200 })
  if (u.endsWith('/deals') && (!opts || opts.method === 'GET')) return new Response(JSON.stringify([]), { status: 200 })
  if (u.endsWith('/deals') && opts && opts.method === 'POST') return new Response(JSON.stringify({ id: 1 }), { status: 201 })
  if (u.includes('/deals/') && opts && opts.method === 'PATCH') return new Response(JSON.stringify({ ok: true }), { status: 200 })
  return new Response(JSON.stringify({}), { status: 404 })
}

describe('Deals form', () => {
  it('validates fields and enables add when valid', async () => {
    localStorage.setItem('token', 'test')
    render(<ToastProvider><App /></ToastProvider>)
    await userEvent.click(screen.getByText('Deals'))
    const title = screen.getByPlaceholderText('Deal Title')
    const amount = screen.getByPlaceholderText('Amount')
    const add = screen.getByText('Add Deal')
    expect(add).toBeDisabled()
    await userEvent.type(title, 'Website')
    await userEvent.type(amount, '1000')
    expect(add).not.toBeDisabled()
  })
})
