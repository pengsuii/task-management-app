'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Priority = 'low' | 'medium' | 'high'
type Status = 'todo' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  due_date: string
  created_at: string
}

const priorityConfig = {
  low: { label: 'Low', bg: '#7BDCB5', color: '#FFFFFF' },
  medium: { label: 'Medium', bg: '#FCB900', color: '#110302' },
  high: { label: 'High', bg: '#CF2E2E', color: '#FFFFFF' }
}

const statusConfig = {
  todo: { label: 'To Do', bg: '#EEEEEE', color: '#050505' },
  in_progress: { label: 'In Progress', bg: '#0297FF', color: '#FFFFFF' },
  done: { label: 'Done', bg: '#00D084', color: '#FFFFFF' }
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [search, setSearch] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Status,
    priority: 'medium' as Priority,
    due_date: ''
  })
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUserEmail(user.email || '')
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    checkUser()
    fetchTasks()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const openAddModal = () => {
    setEditTask(null)
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || ''
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('Title wajib diisi.')
      return
    }
    setFormError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setFormError('User tidak ditemukan, silakan login ulang.')
      return
    }

    if (editTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          due_date: form.due_date || null
        })
        .eq('id', editTask.id)

      if (error) {
        console.error('Update error:', error)
        setFormError(`Gagal update task: ${error.message}`)
        return
      }
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          due_date: form.due_date || null,
          user_id: user.id
        }])

      if (error) {
        console.error('Insert error:', error)
        setFormError(`Gagal membuat task: ${error.message}`)
        return
      }
    }

    setShowModal(false)
    await fetchTasks()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setDeleteConfirm(null)
      fetchTasks()
    }
  }

  const filtered = tasks.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
  }

  return (
    <div data-testid="dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: "'Figtree', sans-serif" }}>

      {/* Navbar */}
      <nav data-testid="navbar" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #EEEEEE', padding: '0 40px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="110" height="30" viewBox="0 0 160 44" role="img" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="2" width="40" height="40" rx="10" fill="#0297FF"/>
            <polyline points="9,23 16,30 31,14" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="34" x2="31" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="39" x2="24" y2="39" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
            <text x="50" y="18" fontFamily="'Figtree', sans-serif" fontSize="18" fontWeight="700" fill="#110302" dominantBaseline="middle">Task</text>
            <text x="98" y="18" fontFamily="'Figtree', sans-serif" fontSize="18" fontWeight="400" fill="#0297FF" dominantBaseline="middle">Flow</text>
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span data-testid="user-email" style={{ fontSize: '14px', color: '#888888' }}>{userEmail}</span>
          <button
            data-testid="btn-logout"
            onClick={handleLogout}
            style={{ height: '36px', padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid #EEEEEE', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#050505', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '25px', fontWeight: 700, color: '#110302', lineHeight: '30px', marginBottom: '4px' }}>My Tasks</h1>
            <p style={{ fontSize: '15.5px', color: '#888888', lineHeight: '25px' }}>{counts.all} total tasks</p>
          </div>
          <button
            data-testid="btn-add-task"
            onClick={openAddModal}
            style={{ height: '36px', padding: '8px 14px', backgroundColor: '#0297FF', color: '#FFFFFF', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0073CC')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0297FF')}
          >
            + Add Task
          </button>
        </div>

        {/* Filter & Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(['all', 'todo', 'in_progress', 'done'] as const).map(f => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                height: '36px', padding: '8px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600,
                backgroundColor: filter === f ? '#0297FF' : '#EEEEEE',
                color: filter === f ? '#FFFFFF' : '#050505',
                transition: 'all 0.15s ease'
              }}
            >
              {f === 'all' ? `All (${counts.all})` : f === 'todo' ? `To Do (${counts.todo})` : f === 'in_progress' ? `In Progress (${counts.in_progress})` : `Done (${counts.done})`}
            </button>
          ))}
          <input
            data-testid="input-search"
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: '36px', padding: '8px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', borderRadius: '12px', fontSize: '14px', fontFamily: "'Figtree', sans-serif", color: '#110302', outline: 'none', minWidth: '200px' }}
            onFocus={e => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.border = '2px solid #0297FF' }}
            onBlur={e => { e.target.style.backgroundColor = 'rgba(0,0,0,0.035)'; e.target.style.border = '2px solid transparent' }}
          />
        </div>

        {/* Task list */}
        {loading ? (
          <div data-testid="loading-state" style={{ textAlign: 'center', padding: '80px', color: '#888888' }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div data-testid="empty-state" style={{ textAlign: 'center', padding: '80px', color: '#888888' }}>
            <p style={{ fontSize: '25px', marginBottom: '8px' }}>📋</p>
            <p style={{ fontSize: '15.5px' }}>No tasks found. Start by adding one!</p>
          </div>
        ) : (
          <div data-testid="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(task => (
              <div
                key={task.id}
                data-testid={`task-card-${task.id}`}
                style={{ backgroundColor: '#FFFFFF', padding: '20px', boxShadow: 'rgba(0,0,0,0.08) 0px 6px 28px 0px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: statusConfig[task.status].bg, color: statusConfig[task.status].color, fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", padding: '4px 8px', borderRadius: '4px' }}>
                      {statusConfig[task.status].label}
                    </span>
                    <span style={{ backgroundColor: priorityConfig[task.priority].bg, color: priorityConfig[task.priority].color, fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", padding: '4px 8px', borderRadius: '4px' }}>
                      {priorityConfig[task.priority].label}
                    </span>
                    {task.due_date && (
                      <span style={{ backgroundColor: '#F9FAFB', color: '#888888', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", padding: '4px 8px', borderRadius: '4px', border: '1px solid #EEEEEE' }}>
                        📅 {new Date(task.due_date).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#110302', marginBottom: '4px', lineHeight: '25px', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p style={{ fontSize: '14px', color: '#888888', lineHeight: '22px' }}>{task.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    data-testid={`btn-edit-${task.id}`}
                    onClick={() => openEditModal(task)}
                    style={{ height: '36px', padding: '8px 14px', backgroundColor: '#F9FAFB', border: '1px solid #EEEEEE', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#050505', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`btn-delete-${task.id}`}
                    onClick={() => setDeleteConfirm(task.id)}
                    style={{ height: '36px', padding: '8px 14px', backgroundColor: '#FEF2F2', border: '1px solid #CF2E2E', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#CF2E2E', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div data-testid="task-modal" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', padding: '32px', borderRadius: '4px', boxShadow: 'rgba(0,0,0,0.16) 0px 14px 40px 0px' }}>
            <h2 style={{ fontSize: '25px', fontWeight: 700, color: '#110302', marginBottom: '24px' }}>
              {editTask ? 'Edit Task' : 'Add New Task'}
            </h2>

            {formError && (
              <div data-testid="modal-error" style={{ backgroundColor: '#FEF2F2', border: '1px solid #CF2E2E', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: '#CF2E2E', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#110302', marginBottom: '8px' }}>Title *</label>
              <input
                data-testid="modal-input-title"
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', fontSize: '15px', color: '#110302', outline: 'none', fontFamily: "'Figtree', sans-serif" }}
                onFocus={e => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.border = '2px solid #0297FF' }}
                onBlur={e => { e.target.style.backgroundColor = 'rgba(0,0,0,0.035)'; e.target.style.border = '2px solid transparent' }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#110302', marginBottom: '8px' }}>Description</label>
              <textarea
                data-testid="modal-input-description"
                placeholder="Optional description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', fontSize: '15px', color: '#110302', outline: 'none', fontFamily: "'Figtree', sans-serif", resize: 'vertical' }}
                onFocus={e => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.border = '2px solid #0297FF' }}
                onBlur={e => { e.target.style.backgroundColor = 'rgba(0,0,0,0.035)'; e.target.style.border = '2px solid transparent' }}
              />
            </div>

            {/* Status & Priority */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#110302', marginBottom: '8px' }}>Status</label>
                <select
                  data-testid="modal-select-status"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Status })}
                  style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', fontSize: '14px', color: '#110302', outline: 'none', fontFamily: "'Figtree', sans-serif", cursor: 'pointer' }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#110302', marginBottom: '8px' }}>Priority</label>
                <select
                  data-testid="modal-select-priority"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                  style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', fontSize: '14px', color: '#110302', outline: 'none', fontFamily: "'Figtree', sans-serif", cursor: 'pointer' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#110302', marginBottom: '8px' }}>Due Date</label>
              <input
                data-testid="modal-input-due-date"
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={{ width: '100%', height: '44px', padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.035)', border: '2px solid transparent', fontSize: '14px', color: '#110302', outline: 'none', fontFamily: "'Figtree', sans-serif" }}
                onFocus={e => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.border = '2px solid #0297FF' }}
                onBlur={e => { e.target.style.backgroundColor = 'rgba(0,0,0,0.035)'; e.target.style.border = '2px solid transparent' }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                data-testid="modal-btn-cancel"
                onClick={() => setShowModal(false)}
                style={{ height: '36px', padding: '8px 14px', backgroundColor: '#F9FAFB', border: '1px solid #EEEEEE', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#050505', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                data-testid="modal-btn-save"
                onClick={handleSave}
                style={{ height: '36px', padding: '8px 14px', backgroundColor: '#0297FF', color: '#FFFFFF', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0073CC')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0297FF')}
              >
                {editTask ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div data-testid="delete-modal" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '360px', padding: '32px', borderRadius: '4px', boxShadow: 'rgba(0,0,0,0.16) 0px 14px 40px 0px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#110302', marginBottom: '8px' }}>Delete Task?</h2>
            <p style={{ fontSize: '15.5px', color: '#888888', marginBottom: '24px', lineHeight: '25px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                data-testid="delete-btn-cancel"
                onClick={() => setDeleteConfirm(null)}
                style={{ height: '36px', padding: '8px 14px', backgroundColor: '#F9FAFB', border: '1px solid #EEEEEE', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#050505', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                data-testid="delete-btn-confirm"
                onClick={() => handleDelete(deleteConfirm)}
                style={{ height: '36px', padding: '8px 14px', backgroundColor: '#CF2E2E', color: '#FFFFFF', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}