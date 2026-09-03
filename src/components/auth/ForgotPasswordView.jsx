import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { InputOTP } from '../ui/input-otp'
import { Badge } from '../ui/badge'
import {
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function ForgotPasswordView({ onBackToLogin }) {
  const [step, setStep] = useState(1) // 1: Contact, 2: OTP, 3: New Password, 4: Success
  const [recoveryMethod, setRecoveryMethod] = useState('email')
  const [contactInput, setContactInput] = useState('admin@draqua.pk')
  const [otpValue, setOtpValue] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(45)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setIsTimerActive(false)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timerSeconds])

  // Step 1: Send OTP
  const handleSendOTP = (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (!contactInput.trim()) {
      setErrorMessage('Please enter your email or registered phone.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(2)
      setTimerSeconds(45)
      setIsTimerActive(true)
    }, 450)
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (otpValue.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(3)
    }, 450)
  }

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(4)
    }, 500)
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: '' }
    if (newPassword.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-600' }
    if (newPassword.length < 10) return { score: 2, label: 'Moderate', color: 'bg-amber-500 text-amber-600' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-600' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="w-full space-y-5 text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
        <Badge variant="outline" className="text-[10px] font-semibold">
          Step {step} of 3
        </Badge>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CONTACT INTAKE */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-outfit text-foreground tracking-tight">
              Reset Password
            </h3>
            <p className="text-xs text-muted-foreground">
              Enter your email or phone to receive a 6-digit recovery code.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRecoveryMethod('email')
                setContactInput('admin@draqua.pk')
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                recoveryMethod === 'email'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/25 font-bold'
                  : 'border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoveryMethod('phone')
                setContactInput('+92 334 7071759')
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                recoveryMethod === 'phone'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/25 font-bold'
                  : 'border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp / SMS</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recovery-contact" className="text-xs font-semibold">
              {recoveryMethod === 'email' ? 'Corporate Email' : 'Mobile Number'}
            </Label>
            <Input
              id="recovery-contact"
              type={recoveryMethod === 'email' ? 'email' : 'text'}
              required
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={recoveryMethod === 'email' ? 'admin@draqua.pk' : '+92 3XX XXXXXXX'}
              className="h-10 text-xs rounded-xl border-border/80 bg-muted/20 focus:bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer mt-1"
          >
            {isSubmitting ? 'Sending Code...' : 'Send 6-Digit Code'}
          </Button>
        </form>
      )}

      {/* STEP 2: 6-DIGIT OTP INPUT */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-outfit text-foreground tracking-tight">
              Enter Verification Code
            </h3>
            <p className="text-xs text-muted-foreground">
              Dispatched to <strong className="text-foreground">{contactInput}</strong>
            </p>
          </div>

          <div className="py-2">
            <InputOTP value={otpValue} onChange={setOtpValue} maxLength={6} />
            <div className="text-center text-[11px] text-muted-foreground pt-2">
              Hint: Enter code{' '}
              <button
                type="button"
                onClick={() => setOtpValue('482019')}
                className="font-mono font-bold text-primary underline cursor-pointer"
              >
                482019
              </button>
            </div>
          </div>

          {/* Resend timer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {isTimerActive ? (
              <span>Resend in <strong className="font-mono text-foreground">00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTimerSeconds(45)
                  setIsTimerActive(true)
                }}
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend code</span>
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || otpValue.length < 6}
            className="w-full h-11 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer mt-1"
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-outfit text-foreground tracking-tight">
              Set New Password
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose a strong password with at least 6 characters.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pass" className="text-xs font-semibold">New Password</Label>
            <Input
              id="new-pass"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs font-mono rounded-xl border-border/80 bg-muted/20 focus:bg-background"
            />
          </div>

          {/* Strength bar */}
          {newPassword && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Strength:</span>
                <span className="font-semibold">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-muted'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-muted'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-muted'}`} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass" className="text-xs font-semibold">Confirm Password</Label>
            <Input
              id="confirm-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs font-mono rounded-xl border-border/80 bg-muted/20 focus:bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer mt-1"
          >
            {isSubmitting ? 'Updating...' : 'Save New Password'}
          </Button>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="space-y-4 text-center py-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-outfit text-foreground">Password Reset Complete</h3>
            <p className="text-xs text-muted-foreground">
              Your credentials have been updated. You can now sign in.
            </p>
          </div>
          <Button
            onClick={onBackToLogin}
            className="w-full h-11 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
