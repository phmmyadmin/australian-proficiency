import React, { useState, useEffect } from 'react'
import { X, Save, Volume2, Key, Target, CheckCircle2 } from 'lucide-react'
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
          <h3>Platform & Australian AI Settings</h3>
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
              <Key size={16} /> Gemini AI API Key (for Essay/Speaking Grading & Question Generator)
            </label>
            <input
              type="password"
              placeholder="Paste your Gemini API Key..."
              value={settings.geminiApiKey}
              onChange={e =>
                setSettings(s => ({ ...s, geminiApiKey: e.target.value }))
              }
            />
            <small className="form-hint">
              Pre-configured with your project key (`gemini-3.5-flash` / `gemini-3.6-flash`).
            </small>
          </div>

          <div className="form-group">
            <label>
              <Volume2 size={16} /> Preferred Australian English Voice (en-AU)
            </label>
            <div className="voice-select-row">
              <select
                value={settings.preferredVoiceURI}
                onChange={e =>
                  setSettings(s => ({ ...s, preferredVoiceURI: e.target.value }))
                }
              >
                <option value="">Auto-detect Best Australian Voice (en-AU)</option>
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary-small"
                onClick={() =>
                  speakAustralianEnglish(
                    'G’day! Welcome to Australian Proficiency PTE Academic training.'
                  )
                }
              >
                Test Voice
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Audio Speech Speed ({settings.speechRate}x)</label>
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
