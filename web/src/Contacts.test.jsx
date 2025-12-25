import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'

global.fetch = async (url) => {
  const u = String(url)
  if (u.includes('/health')) return new Response(JSON.stringify({ ok: true }), { status: 200 })
  if (u.includes('/contacts/list')) return new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 5 }), { status: 200 })
  if (u.includes('/contacts') && !u.includes('/contacts/list')) return new Response(JSON.stringify({ id: 1 }), { status: 201 })
  return new Response(JSON.stringify({}), { status: 404 })
}

describe('Contacts form', () => {
  it('validates fields and enables add when valid', async () => {
    localStorage.setItem('token', 'test')
    render(<ToastProvider><App /></ToastProvider>)
    const name = screen.getByPlaceholderText('Name')
    const email = screen.getByPlaceholderText('Email')
    const phone = screen.getByPlaceholderText('Phone')
    const add = screen.getByText('Add Contact')
    expect(add).toBeDisabled()
    await userEvent.type(name, 'Alice')
    await userEvent.clear(email)
    await userEvent.type(phone, '0801-111-1111')
    expect(add).not.toBeDisabled()
  })
})
