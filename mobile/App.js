import React, { useState, useEffect } from 'react'
import { SafeAreaView, Text, TextInput, TouchableOpacity, FlatList, View } from 'react-native'

const API = 'http://localhost:4000'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  async function login() {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await r.json()
    if (r.ok) setToken(data.token)
  }

  async function register() {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email.split('@')[0] })
    })
    const data = await r.json()
    if (r.ok) setToken(data.token)
  }

  async function load() {
    const r = await fetch(`${API}/contacts`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await r.json()
    setItems(data)
  }

  async function add() {
    await fetch(`${API}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email: '', phone })
    })
    setName(''); setPhone('')
    await load()
  }

  useEffect(() => { if (token) load() }, [token])

  if (!token) {
    return (
      <SafeAreaView style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, marginBottom: 12 }}>Sign in</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={login} style={{ flex:1, backgroundColor: '#2563eb', padding: 12 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={register} style={{ flex:1, backgroundColor: '#111827', padding: 12 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Contacts</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, flex: 1, padding: 8 }} />
        <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={{ borderWidth: 1, flex: 1, padding: 8 }} />
        <TouchableOpacity onPress={add} style={{ backgroundColor: '#2563eb', padding: 12 }}>
          <Text style={{ color: '#fff' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{item.name}</Text>
            <Text style={{ color: '#6b7280' }}>{item.phone}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}
