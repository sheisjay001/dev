import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((text, type = 'info', ms = 2500) => {
    const id = Math.random().toString(36).slice(2)
    setItems(prev => [...prev, { id, text, type }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), ms)
  }, [])
  const value = useMemo(() => ({ push }), [push])
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 space-y-2 z-50 flex flex-col items-end pointer-events-none">
        {items.map(t => (
          <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm animate-in slide-in-from-right-5 fade-in duration-300 max-w-[calc(100vw-24px)] md:max-w-sm break-words ${t.type==='error'?'bg-red-500':t.type==='success'?'bg-brand-600':'bg-gray-800'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
