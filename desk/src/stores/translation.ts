import { defineStore } from 'pinia'
import { ref } from 'vue'
import { desk } from '../utils/desk'

export interface TranslationData {
  [key: string]: string
}

export const useTranslationStore = defineStore('translation', () => {
  const translations = ref<TranslationData>({})
  const currentLang = ref<string>('en')
  const fallbackLang = ref<string>('en')

  /**
   * Load translations from boot data or API
   */
  function loadTranslations(data: TranslationData, lang?: string) {
    translations.value = data || {}
    if (lang) {
      currentLang.value = lang
    }
  }

  /**
   * Get translation for a key
   */
  function getTranslation(key: string, context?: string): string {
    if (!key) return ''

    // With context
    if (context) {
      const contextKey = `${key}:${context}`
      if (translations.value[contextKey]) {
        return translations.value[contextKey]
      }
    }

    // Without context
    return translations.value[key] || key
  }

  /**
   * Set current language
   */
  function setLang(lang: string) {
    currentLang.value = lang
  }

  /**
   * Clear all translations
   */
  function clear() {
    translations.value = {}
  }

  /**
   * Add translations dynamically
   */
  function addTranslations(data: TranslationData) {
    translations.value = { ...translations.value, ...data }
  }

  /**
   * Load translations from API for a specific language
   */
  async function loadTranslationsFromAPI(lang: string) {
    try {
      const response = await desk.call({
        method: 'desktop.api.translations.get_translations',
        args: { lang }
      })

      if (response.message) {
        loadTranslations(response.message.messages || {}, response.message.lang)
      }
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error)
    }
  }

  return {
    translations,
    currentLang,
    fallbackLang,
    loadTranslations,
    getTranslation,
    setLang,
    clear,
    addTranslations,
    loadTranslationsFromAPI
  }
})
