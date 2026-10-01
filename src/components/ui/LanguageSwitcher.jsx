import React from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Languages } from './Icons'

export function LanguageSwitcher({ className = '', variant = 'segmented', size = 'default' }) {
  const { language, setLanguage, toggleLanguage } = useLanguage()

  if (variant === 'button') {
    return (
      <button
        type='button'
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/80 hover:bg-muted text-xs font-semibold transition-all cursor-pointer shadow-subtle ${className}`}
        aria-label='Toggle language'
        title={language === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
      >
        <Languages className='w-3.5 h-3.5 text-primary' />
        <span>{language === 'en' ? 'اردو' : 'English'}</span>
      </button>
    )
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg p-0.5 bg-muted/70 border border-border text-xs ${className}`}
      dir='ltr'
    >
      <button
        type='button'
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-card text-foreground shadow-subtle'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title='English'
      >
        EN
      </button>
      <button
        type='button'
        onClick={() => setLanguage('ur')}
        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer font-urdu ${
          language === 'ur'
            ? 'bg-primary text-primary-foreground shadow-subtle'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title='اردو'
      >
        اردو
      </button>
    </div>
  )
}

export default LanguageSwitcher
