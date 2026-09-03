import React, { useState } from 'react'
import LoginView from './LoginView'
import ForgotPasswordView from './ForgotPasswordView'
import DrAquaLogo from '../ui/DrAquaLogo'
import { ShieldCheck, Droplets } from 'lucide-react'

export default function AuthPortal({ onLoginSuccess }) {
  const [currentView, setCurrentView] = useState('login') // 'login' | 'forgot_password'

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 relative overflow-hidden font-sans">
      {/* Ambient water-tech mesh background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-sky-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Authentication Card */}
      <div className="w-full max-w-[440px] bg-card border border-border/80 rounded-3xl shadow-xl shadow-slate-900/5 p-7 sm:p-9 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Official Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="py-1">
            <DrAquaLogo size="default" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 text-[11px] font-semibold">
            <Droplets className="w-3 h-3 text-cyan-600" />
            <span>Industrial & Domestic Water Intelligence</span>
          </div>
        </div>

        {/* Dynamic Form View */}
        <div>
          {currentView === 'login' ? (
            <LoginView
              onLoginSuccess={onLoginSuccess}
              onNavigateForgotPassword={() => setCurrentView('forgot_password')}
            />
          ) : (
            <ForgotPasswordView onBackToLogin={() => setCurrentView('login')} />
          )}
        </div>

        {/* Minimalist Security Footer */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Terminal</span>
          </div>
          <span>Bahawalpur Operations</span>
        </div>
      </div>

      {/* Subtle Bottom Copyright Tag */}
      <div className="mt-6 text-center text-xs text-muted-foreground/80">
        © 2026 Dr. Aqua Pure Water Solutions • Authorized Personnel Only
      </div>
    </div>
  )
}
