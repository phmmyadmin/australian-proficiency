import React, { useState, useEffect } from 'react'
import { X, Save, Volume2, Key, Target, CheckCircle2, Sparkles } from 'lucide-react'
import { getUserSettings, saveUserSettings } from '../utils/aiConfigStore'
import { getAvailableEnglishVoices, speakAustralianEnglish } from '../utils/aussieAudio'

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(getUserSettings())
  const [voices, setVoices] = useState([])
  const [savedBanner, setSavedBanner] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSettings(getUserSettings())
    setVoices(getAvailableEnglishVoices())
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = e => {
    e.preventDefault()
    const updated = saveUserSettings(settings)
    if (onSettingsUpdated) onSettingsUpdated(updated)
    setSavedBanner(true)
    setTimeout(() => {
      setSavedBanner(false)
      onClose()
    }, 600)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Platform & Australian AI Voice Settings</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label>
              <Target size={16} /> Target PTE Academic Score (10–90)
            </label>
            <select
              value={settings.targetScore}
              onChange={e =>
                setSettings(s => ({ ...s, targetScore: Number(e.target.value) }))
              }
            >
              <option value={50}>50+ (Competent English — IELTS 6.0 eq.)</option>
              <option value={65}>65+ (Proficient English — IELTS 7.0 eq. • 10 PR Pts)</option>
              <option value={79}>79+ (Superior English — IELTS 8.0+ eq. • 20 PR Pts)</option>
              <option value={85}>85+ (Elite Academic Distinction)</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <Sparkles size={16} /> Natural AI Voice Engine (Gemini 2.5 Neural TTS)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                style={{ flex: 1 }}
                value={settings.geminiVoice || 'Kore'}
                onChange={e =>
                  setSettings(s => ({ ...s, geminiVoice: e.target.value, useNeuralTts: true }))
                }
              >
                <option value="Kore">Kore — Clear Academic Female (Recommended)</option>
                <option value="Puck">Puck — Natural Academic Male</option>
                <option value="Aoede">Aoede — Warm Broadcast Female</option>
                <option value="Charon">Charon — Deep Lecture Male</option>
              </select>
              <button
                type="button"
                className="btn-secondary-small"
                onClick={() => {
                  saveUserSettings(settings)
                  speakAustralianEnglish(
                    'Postgraduate students must submit their ethics approval forms before commencing fieldwork.',
                    { voiceName: settings.geminiVoice || 'Kore' }
                  )
                }}
              >
                <Volume2 size={15} /> Test AI Voice
              </button>
            </div>
            <small className="subtle-caption">
              Synthesizes realistic human 24kHz audio with Gemini Neural TTS and caches it locally in IndexedDB.
            </small>
          </div>

          <div className="form-group">
            <label>
              <Key size={16} /> Gemini AI API Key
            </label>
            <input
              type="password"
              placeholder="Paste your Gemini API Key..."
              value={settings.geminiApiKey}
              onChange={e =>
                setSettings(s => ({ ...s, geminiApiKey: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>
              <Volume2 size={16} /> Offline Fallback Browser Voice (en-AU)
            </label>
            <select
              value={settings.preferredVoiceURI}
              onChange={e =>
                setSettings(s => ({ ...s, preferredVoiceURI: e.target.value }))
              }
            >
              <option value="">Auto-detect Best System English Voice</option>
              {voices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Default Playback Speed ({settings.speechRate}x)</label>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.speechRate}
              onChange={e =>
                setSettings(s => ({ ...s, speechRate: Number(e.target.value) }))
              }
            />
          </div>

          {savedBanner && (
            <div className="saved-alert">
              <CheckCircle2 size={16} /> Settings saved!
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-submit">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
