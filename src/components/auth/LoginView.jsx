import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { mockAuthAccounts } from '../../data/mock/auth.mock'
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function LoginView({ onLoginSuccess, onNavigateForgotPassword }) {
  const [email, setEmail] = useState('admin@draqua.pk')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberTerminal, setRememberTerminal] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSignIn = (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    setTimeout(() => {
      const account = mockAuthAccounts[email.trim().toLowerCase()]
      if (!account) {
        setErrorMessage('Account not found. Please verify your email.')
        setIsLoading(false)
        return
      }

      if (account.passwordHash !== password) {
        setErrorMessage('Incorrect password. Please verify your credentials.')
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      // The user's role is automatically determined by their authenticated profile
      const userPayload = {
        ...account.user,
        sessionStartedAt: new Date().toISOString(),
      }

      if (rememberTerminal) {
        localStorage.setItem('draqua-user', JSON.stringify(userPayload))
      }

      if (onLoginSuccess) {
        onLoginSuccess(userPayload)
      }
    }, 400)
  }

  return (
    <div className="w-full space-y-5 text-left">
      {/* Minimal Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-outfit text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign in with your email and password to access the terminal.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pure Minimalist Sign In Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="auth-email" className="text-xs font-semibold">
            Email
          </Label>
          <Input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 text-xs rounded-xl border-border/80 bg-muted/20 focus:bg-background transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="auth-password" className="text-xs font-semibold">
              Password
            </Label>
            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 pr-10 font-mono text-xs rounded-xl border-border/80 bg-muted/20 focus:bg-background transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember device checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberTerminal}
              onChange={(e) => setRememberTerminal(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Keep terminal signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer mt-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Authenticating...
            </span>
          ) : (
            <>
              <span>Sign In to Hub</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
