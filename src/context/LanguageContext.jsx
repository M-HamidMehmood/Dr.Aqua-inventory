import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { TRANSLATIONS } from '../utils/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('draqua-language') || localStorage.getItem('language')
      return saved === 'ur' ? 'ur' : 'en'
    } catch (e) {
      return 'en'
    }
  })

  // Synchronize document dir and lang attributes
  useEffect(() => {
    try {
      localStorage.setItem('draqua-language', language)
      localStorage.setItem('language', language)
    } catch (e) {
      console.warn('Could not save language to localStorage:', e)
    }

    const isUrdu = language === 'ur'
    document.documentElement.lang = language
    document.documentElement.dir = isUrdu ? 'rtl' : 'ltr'

    if (isUrdu) {
      document.body.classList.add('font-urdu')
    } else {
      document.body.classList.remove('font-urdu')
    }
  }, [language])

  const setLanguage = (lang) => {
    if (lang === 'ur' || lang === 'en') {
      setLanguageState(lang)
    }
  }

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ur' : 'en'))
  }

  // Translation helper function with placeholder interpolation
  const t = useMemo(() => {
    return (key, params = {}) => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en
      let str = dict[key] || TRANSLATIONS.en[key] || key

      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
        })
      }

      return str
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isRTL: language === 'ur',
      t,
    }),
    [language, t],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
