import { useState, useEffect, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from './Toast.jsx'
import { isNonEmpty, isPositiveNumber } from '../lib/validate.js'
import FieldError from './FieldError.jsx'

const STAGES = ['new', 'qualified', 'won', 'lost']
const STAGE_LABELS = {
  new: 'New Lead',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost'
}
const STAGE_COLORS = {
  new: 'bg-gray-100 text-gray-700 border-gray-200',
  qualified: 'bg-blue-50 text-blue-700 border-blue-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200'
}

import { DealModal } from './DealModal.jsx'

function SortableItem({ id, deal, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={() => onClick(deal)}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-2 group relative"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{deal.title}</h4>
      </div>
      <div className="text-xs font-mono text-gray-500">₦{Number(deal.amount || deal.value).toLocaleString()}</div>
    </div>
  )
}

function DroppableColumn({ id, items, total, onDealClick }) {
  const { setNodeRef } = useSortable({ id, data: { type: 'container' } })

  return (
    <div className="flex-1 min-w-[250px] flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-100">
      <div className={`p-3 border-b ${STAGE_COLORS[id]} rounded-t-xl flex justify-between items-center`}>
        <h3 className="font-bold text-xs uppercase tracking-wider">{STAGE_LABELS[id]}</h3>
        <span className="text-xs font-mono opacity-70">₦{total.toLocaleString()}</span>
      </div>
      <div ref={setNodeRef} className="p-2 flex-1 overflow-y-auto min-h-[150px]">
        <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {items.map(deal => (
            <SortableItem key={deal.id} id={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-300 text-xs italic py-10">
            Empty
          </div>
        )}
      </div>
    </div>
  )
}

export default function DealsBoard({ token, client }) {
  const [items, setItems] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Add Deal Form State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [stage, setStage] = useState('new')
  const [selectedDeal, setSelectedDeal] = useState(null)
  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const dealsByStage = useMemo(() => {
    const grouped = { new: [], qualified: [], won: [], lost: [] }
    items.forEach(d => {
      // Ensure compatibility with old 'amount' and new 'value' fields if mixed
      const deal = { ...d, value: d.value || d.amount }
      if (grouped[d.stage]) grouped[d.stage].push(deal)
    })
    return grouped
  }, [items])

  const totalsByStage = useMemo(() => {
    const totals = { new: 0, qualified: 0, won: 0, lost: 0 }
    items.forEach(d => {
      if (totals[d.stage] !== undefined) totals[d.stage] += Number(d.amount || d.value || 0)
    })
    return totals
  }, [items])

  async function load() {
    try {
      const data = await client.get('/deals')
      setItems(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpdateDeal(id, updates) {
    await client.patch(`/deals/${id}`, updates)
    toast.push('Deal updated', 'success')
    await load()
  }

  async function handleDeleteDeal(id) {
    await client.delete(`/deals/${id}`)
    toast.push('Deal deleted', 'success')
    await load()
  }

  useEffect(() => { load() }, [])

  async function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the deal
    const activeDeal = items.find(d => d.id === activeId)
    if (!activeDeal) return

    // Determine new stage
    let newStage = activeDeal.stage
    
    if (STAGES.includes(overId)) {
      // Dropped directly on a column
      newStage = overId
    } else {
      // Dropped on another card
      const overDeal = items.find(d => d.id === overId)
      if (overDeal) {
        newStage = overDeal.stage
      }
    }

    if (activeDeal.stage !== newStage) {
      // Optimistic update
      setItems(items => items.map(d => 
        d.id === activeId ? { ...d, stage: newStage } : d
      ))

      // API Call
      try {
        await client.patch(`/deals/${activeId}/stage`, { stage: newStage })
        toast.push(`Moved to ${STAGE_LABELS[newStage]}`, 'success')
      } catch (err) {
        toast.push('Failed to update stage', 'error')
        load() // Revert on error
      }
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  async function add() {
    if (!isNonEmpty(title) || (amount && !isPositiveNumber(amount))) return
    
    setLoading(true)
    try {
      await client.post('/deals', { title, amount, stage })
      setTitle(''); setAmount(''); setStage('new')
      toast.push('Deal added', 'success')
      await load()
    } catch {
      toast.push('Failed to add deal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const activeDeal = activeId ? items.find(d => d.id === activeId) : null

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
      {/* Header & Add Form */}
      <div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white/50 flex-none">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:flex-1">
            <label className="text-xs font-medium text-gray-500 ml-1">Title</label>
            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" placeholder="New Deal Title" value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-medium text-gray-500 ml-1">Amount</label>
            <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div className="w-full md:w-32">
             <label className="text-xs font-medium text-gray-500 ml-1">Stage</label>
             <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200" value={stage} onChange={e=>setStage(e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
             </select>
          </div>
          <button className="w-full md:w-auto bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95" onClick={add} disabled={loading || !title}>
            Add Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-[1000px] pb-4">
            {STAGES.map(stage => (
              <DroppableColumn 
                key={stage} 
                id={stage} 
                items={dealsByStage[stage]} 
                total={totalsByStage[stage]}
                onDealClick={setSelectedDeal}
              />
            ))}
          </div>
          
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeDeal ? (
              <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xl rotate-2 w-[250px]">
                <h4 className="font-medium text-gray-900 text-sm">{activeDeal.title}</h4>
                <div className="text-xs font-mono text-gray-500">₦{Number(activeDeal.amount || activeDeal.value).toLocaleString()}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <DealModal
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleUpdateDeal}
        onDelete={handleDeleteDeal}
        stages={STAGES.map(s => ({ id: s, label: STAGE_LABELS[s] }))}
      />
    </div>
  )
}
