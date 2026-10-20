import '@testing-library/jest-dom'

if (typeof window !== 'undefined') {
  if (!window.speechSynthesis) {
    window.speechSynthesis = {
      cancel: () => {},
      speak: () => {},
      getVoices: () => [
        { name: 'Karen', lang: 'en-AU', default: true },
        { name: 'Catherine', lang: 'en-AU', default: false },
      ],
      addEventListener: () => {},
      removeEventListener: () => {},
    }
  }
  if (!window.SpeechSynthesisUtterance) {
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text
        this.lang = 'en-AU'
        this.rate = 1
      }
    }
  }
}
