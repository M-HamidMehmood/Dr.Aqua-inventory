import React, { useState } from 'react'
import { authenticate } from '../utils/auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Eye, EyeOff, Shield, AlertCircle, Droplets } from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

export default function AuthManager({ onLogin }) {
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const user = authenticate(email, password)
      if (user) {
        onLogin(user)
      } else {
        setError(t('invalidCredentialsError'))
      }
      setIsLoading(false)
    }, 250)
  }

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-primary selection:text-white'>
      {/* Background glow effects */}
      <div className='absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none' />

      {/* Language Switcher in Top Bar */}
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6 z-20'>
        <LanguageSwitcher className='bg-slate-900/80 border-slate-700/80 text-white' />
      </div>

      <div className='w-full max-w-md relative z-10'>
        {/* Brand header */}
        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-elevated mb-3 backdrop-blur-md gap-2.5'>
            <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 text-sky-400'>
              <Droplets className='w-5 h-5' />
            </div>
            <div className='text-left leading-tight'>
              <div className='font-black tracking-wider text-lg text-white'>
                {t('brandTitle')}
              </div>
              <div className='text-[10px] text-slate-400 font-medium tracking-tight uppercase'>
                {t('brandSubtitle')}
              </div>
            </div>
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>
            {t('authWorkspaceTitle')}
          </h1>
          <p className='mt-1 text-sm text-slate-400'>
            {t('authWorkspaceSubtitle')}
          </p>
        </div>

        {/* Auth Card */}
        <Card className='border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-floating text-slate-100'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-base font-semibold text-white'>
              {t('accountCredentials')}
            </CardTitle>
            <CardDescription className='text-xs text-slate-400'>
              {t('authRoleNotice')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <div className='p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4 text-red-400 flex-shrink-0' />
                  <span className='text-red-300 font-medium'>{error}</span>
                </div>
              )}

              <div className='space-y-1.5'>
                <label
                  htmlFor='email'
                  className='block text-xs font-medium text-slate-300'
                >
                  {t('workEmail')}
                </label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  placeholder='admin@draqua.pk'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir='ltr'
                  className='bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary'
                />
              </div>

              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-xs font-medium text-slate-300'
                  >
                    {t('password')}
                  </label>
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer'
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className='w-3 h-3' /> <span>{t('hidePassword')}</span>
                      </>
                    ) : (
                      <>
                        <Eye className='w-3 h-3' /> <span>{t('showPassword')}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className='relative'>
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir='ltr'
                    className={`bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary ${
                      isRTL ? 'pl-10' : 'pr-10'
                    }`}
                  />
                </div>
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full bg-primary hover:bg-primary/90 text-white font-semibold h-10 mt-2 shadow-sm cursor-pointer'
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    <span>{t('signingIn')}</span>
                  </div>
                ) : (
                  <span>{t('signInButton')}</span>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Quick Demo Helper */}
          <CardFooter className='flex flex-col items-start gap-2 pt-4 border-t border-slate-800/80 bg-slate-950/40 rounded-b-xl'>
            <div className='text-[11px] font-medium text-slate-400 flex items-center gap-1.5'>
              <Shield className='w-3.5 h-3.5 text-slate-400' />
              <span>{t('quickDemoAutofill')}</span>
            </div>
            <div className='grid grid-cols-3 gap-1.5 w-full'>
              <button
                type='button'
                onClick={() => fillQuickDemo('admin@draqua.pk', 'admin123')}
                className='px-2 py-1.5 rounded-md text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-center transition-colors cursor-pointer'
              >
                👑 {t('demoAdmin')}
              </button>
              <button
                type='button'
                onClick={() => fillQuickDemo('cashier@draqua.pk', 'cashier123')}
                className='px-2 py-1.5 rounded-md text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-center transition-colors cursor-pointer'
              >
                🧾 {t('demoCashier')}
              </button>
              <button
                type='button'
                onClick={() => fillQuickDemo('technician@draqua.pk', 'tech123')}
                className='px-2 py-1.5 rounded-md text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-center transition-colors cursor-pointer'
              >
                🔧 {t('demoTech')}
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className='text-center text-xs text-slate-500 mt-6'>
          {t('footerInfo')}
        </p>
      </div>
    </div>
  )
}
