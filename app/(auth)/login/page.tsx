'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async () => {
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      setLoading(false)
      return
    }

    if (mode === 'register') {
      if (!fullName) {
        setError('Nama lengkap wajib diisi.')
        setLoading(false)
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccessMsg('Registrasi berhasil! Silakan cek email kamu untuk verifikasi.')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setError('Email atau password salah.')
      } else {
        router.push('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <main
      data-testid="auth-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Figtree', sans-serif"
      }}
    >
      <div
        data-testid="auth-card"
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          boxShadow: 'rgba(0, 0, 0, 0.08) 0px 6px 28px 0px',
          borderRadius: '4px'
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="160" height="44" viewBox="0 0 160 44" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>TaskFlow</title>
            <rect x="0" y="2" width="40" height="40" rx="10" fill="#0297FF"/>
            <polyline points="9,23 16,30 31,14" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="34" x2="31" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="39" x2="24" y2="39" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
            <text x="50" y="18" fontFamily="'Figtree', sans-serif" fontSize="18" fontWeight="700" fill="#110302" dominantBaseline="middle">Task</text>
            <text x="98" y="18" fontFamily="'Figtree', sans-serif" fontSize="18" fontWeight="400" fill="#0297FF" dominantBaseline="middle">Flow</text>
            <text x="50" y="36" fontFamily="'Figtree', sans-serif" fontSize="9" fontWeight="400" fill="#888888" dominantBaseline="middle">Organize your work, effortlessly.</text>
        </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '25px',
          fontWeight: 700,
          color: '#110302',
          marginBottom: '8px',
          lineHeight: '30px'
        }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{
          fontSize: '15.5px',
          color: '#888888',
          marginBottom: '32px',
          lineHeight: '25px'
        }}>
          {mode === 'login'
            ? 'Sign in to manage your tasks'
            : 'Start organizing your work today'}
        </p>

        {/* Error message */}
        {error && (
          <div
            data-testid="error-message"
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #CF2E2E',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#CF2E2E',
              fontSize: '14px',
              lineHeight: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div
            data-testid="success-message"
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #00D084',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#00D084',
              fontSize: '14px',
              lineHeight: '20px'
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Full name (register only) */}
        {mode === 'register' && (
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: '#110302',
                marginBottom: '8px'
              }}
            >
              Full Name
            </label>
            <input
              id="fullName"
              data-testid="input-fullname"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                padding: '10px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.035)',
                border: '2px solid transparent',
                borderRadius: '0px',
                fontSize: '15px',
                color: '#110302',
                outline: 'none',
                fontFamily: "'Figtree', sans-serif",
                transition: 'all 0.15s ease'
              }}
              onFocus={e => {
                e.target.style.backgroundColor = '#FFFFFF'
                e.target.style.border = '2px solid #0297FF'
              }}
              onBlur={e => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.035)'
                e.target.style.border = '2px solid transparent'
              }}
            />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: '#110302',
              marginBottom: '8px'
            }}
          >
            Email
          </label>
          <input
            id="email"
            data-testid="input-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '10px 14px',
              backgroundColor: 'rgba(0, 0, 0, 0.035)',
              border: '2px solid transparent',
              borderRadius: '0px',
              fontSize: '15px',
              color: '#110302',
              outline: 'none',
              fontFamily: "'Figtree', sans-serif",
              transition: 'all 0.15s ease'
            }}
            onFocus={e => {
              e.target.style.backgroundColor = '#FFFFFF'
              e.target.style.border = '2px solid #0297FF'
            }}
            onBlur={e => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.035)'
              e.target.style.border = '2px solid transparent'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '32px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: '#110302',
              marginBottom: '8px'
            }}
          >
            Password
          </label>
          <input
            id="password"
            data-testid="input-password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%',
              height: '44px',
              padding: '10px 14px',
              backgroundColor: 'rgba(0, 0, 0, 0.035)',
              border: '2px solid transparent',
              borderRadius: '0px',
              fontSize: '15px',
              color: '#110302',
              outline: 'none',
              fontFamily: "'Figtree', sans-serif",
              transition: 'all 0.15s ease'
            }}
            onFocus={e => {
              e.target.style.backgroundColor = '#FFFFFF'
              e.target.style.border = '2px solid #0297FF'
            }}
            onBlur={e => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.035)'
              e.target.style.border = '2px solid transparent'
            }}
          />
        </div>

        {/* Submit button */}
        <button
          data-testid="btn-submit"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            height: '36px',
            backgroundColor: loading ? '#EEEEEE' : '#0297FF',
            color: loading ? '#ABB8C3' : '#FFFFFF',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            lineHeight: '20px',
            transition: 'background-color 0.15s ease',
            marginBottom: '20px'
          }}
          onMouseEnter={e => {
            if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#0073CC'
          }}
          onMouseLeave={e => {
            if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#0297FF'
          }}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15.5px', color: '#888888' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            data-testid="btn-toggle-mode"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
              setSuccessMsg('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0297FF',
              fontSize: '15.5px',
              cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              padding: '0'
            }}
          >
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </main>
  )
}