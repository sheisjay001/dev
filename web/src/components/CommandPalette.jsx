import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { 
  Search, 
  Home, 
  Users, 
  Trello, 
  LogOut, 
  Command as CommandIcon,
  Moon,
  Sun
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CommandPalette({ setTab, onLogout }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
          >
            <Command className="w-full">
              <div className="flex items-center border-b border-gray-100 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input 
                  placeholder="Type a command or search..."
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
                
                <Command.Group heading="Navigation" className="px-2 pb-2 text-xs font-medium text-gray-500">
                  <Command.Item 
                    onSelect={() => { setTab('dashboard'); setOpen(false) }}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-gray-700 aria-selected:bg-accent-50 aria-selected:text-accent-700"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-aria-selected:opacity-100">G D</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { setTab('contacts'); setOpen(false) }}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-gray-700 aria-selected:bg-accent-50 aria-selected:text-accent-700"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Contacts</span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-aria-selected:opacity-100">G C</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { setTab('deals'); setOpen(false) }}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-gray-700 aria-selected:bg-accent-50 aria-selected:text-accent-700"
                  >
                    <Trello className="mr-2 h-4 w-4" />
                    <span>Deals Board</span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-aria-selected:opacity-100">G B</span>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-gray-100" />

                <Command.Group heading="System" className="px-2 pb-2 text-xs font-medium text-gray-500">
                  <Command.Item 
                    onSelect={() => { onLogout(); setOpen(false) }}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-red-600 aria-selected:bg-red-50 aria-selected:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
            
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CommandIcon className="h-3 w-3" />
                <span>+ K to open</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Select</span>
                <kbd className="rounded border bg-white px-1 font-sans">↵</kbd>
                <span>Navigate</span>
                <kbd className="rounded border bg-white px-1 font-sans">↓</kbd>
                <kbd className="rounded border bg-white px-1 font-sans">↑</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
