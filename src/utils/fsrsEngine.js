/**
 * FSRS-5 Spaced Repetition Engine for Australian Proficiency Flashcards
 * Implements the modern DSR (Difficulty, Stability, Retrievability) memory model.
 */

const W = [
  0.40255, // w0: initial stability for Again
  1.18385, // w1: initial stability for Hard
  3.173,   // w2: initial stability for Good
  15.69105,// w3: initial stability for Easy
  7.1949,  // w4: initial difficulty base
  0.5345,  // w5: initial difficulty scaling
  1.4604,  // w6: difficulty delta scaling
  0.0046,  // w7: mean reversion weight
  1.54575, // w8: stability recall growth factor
  0.1192,  // w9: stability saturation exponent
  1.01925, // w10: retrievability sensitivity on recall
  1.9395,  // w11: forget stability base
  0.11,    // w12: forget difficulty exponent
  0.29605, // w13: forget stability exponent
  2.2698,  // w14: forget retrievability sensitivity
  0.2315,  // w15: Hard penalty multiplier
  2.9898,  // w16: Easy bonus multiplier
  0.51655, // w17: short-term stability weight
  0.6621,  // w18: short-term stability offset
]

const DECAY = -0.5
const FACTOR = 19 / 81
const REQUEST_RETENTION = 0.9

export const Rating = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
}

export const State = {
  New: 0,
  Learning: 1,
  Review: 2,
  Relearning: 3,
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function getRetrievability(elapsedDays, stability) {
  if (!stability || stability <= 0 || elapsedDays <= 0) return 1
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY)
}

function nextInterval(stability) {
  const interval = (stability / FACTOR) * (Math.pow(REQUEST_RETENTION, 1 / DECAY) - 1)
  return Math.max(1, Math.round(interval))
}

function initStability(rating) {
  return Math.max(0.1, W[rating - 1])
}

function initDifficulty(rating) {
  const d = W[4] - Math.exp(W[5] * (rating - 1)) + 1
  return clamp(d, 1, 10)
}

function nextDifficulty(d, rating) {
  const deltaD = -W[6] * (rating - 3)
  const dPrime = d + deltaD * ((10 - d) / 9)
  const d0Easy = initDifficulty(Rating.Easy)
  const nextD = W[7] * d0Easy + (1 - W[7]) * dPrime
  return clamp(nextD, 1, 10)
}

function shortTermStability(s, rating) {
  const sinc = Math.exp(W[17] * (rating - 3 + W[18]))
  return Math.max(0.1, s * sinc)
}

function nextRecallStability(d, s, r, rating) {
  const hardPenalty = rating === Rating.Hard ? W[15] : 1
  const easyBonus = rating === Rating.Easy ? W[16] : 1
  const sInc =
    1 +
    Math.exp(W[8]) *
      (11 - d) *
      Math.pow(s, -W[9]) *
      (Math.exp((1 - r) * W[10]) - 1) *
      hardPenalty *
      easyBonus
  return Math.max(0.1, s * sInc)
}

function nextForgetStability(d, s, r) {
  const sMin = s / Math.exp(W[17] * W[18])
  const sNew =
    W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp((1 - r) * W[14])
  return clamp(sNew, 0.1, Math.max(0.1, sMin))
}

export function initCard(now = Date.now()) {
  return {
    state: State.New,
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    dueDate: now,
    scheduledDays: 0,
  }
}

export function nextState(card, rating, now = Date.now()) {
  const current = card && typeof card.state === 'number' ? { ...card } : initCard(now)
  const MINUTE = 60 * 1000
  const DAY = 24 * 60 * MINUTE

  let elapsedDays = 0
  if (current.lastReview) {
    elapsedDays = Math.max(0, (now - current.lastReview) / DAY)
  }

  let s = current.stability
  let d = current.difficulty
  let state = current.state
  let reps = current.reps + 1
  let lapses = current.lapses
  let dueDate = now
  let scheduledDays = 0

  if (state === State.New) {
    s = initStability(rating)
    d = initDifficulty(rating)

    if (rating === Rating.Again) {
      state = State.Learning
      dueDate = now + 1 * MINUTE
    } else if (rating === Rating.Hard) {
      state = State.Learning
      dueDate = now + 5 * MINUTE
    } else if (rating === Rating.Good) {
      state = State.Learning
      dueDate = now + 10 * MINUTE
    } else {
      state = State.Review
      scheduledDays = nextInterval(s)
      dueDate = now + scheduledDays * DAY
    }
  } else if (state === State.Learning || state === State.Relearning) {
    s = shortTermStability(s, rating)
    d = nextDifficulty(d, rating)

    if (rating === Rating.Again) {
      dueDate = now + 1 * MINUTE
    } else if (rating === Rating.Hard) {
      dueDate = now + 5 * MINUTE
    } else {
      state = State.Review
      scheduledDays = nextInterval(s)
      if (rating === Rating.Easy) {
        scheduledDays = Math.max(scheduledDays + 1, Math.round(scheduledDays * 1.3))
      }
      dueDate = now + scheduledDays * DAY
    }
  } else {
    const r = getRetrievability(elapsedDays, s)
    d = nextDifficulty(d, rating)

    if (rating === Rating.Again) {
      lapses += 1
      state = State.Relearning
      s = nextForgetStability(d, s, r)
      dueDate = now + 5 * MINUTE
    } else {
      state = State.Review
      s = nextRecallStability(d, s, r, rating)
      scheduledDays = nextInterval(s)

      if (rating === Rating.Hard) {
        scheduledDays = Math.max(1, Math.min(scheduledDays, Math.round(current.scheduledDays * 1.2 || 1)))
      } else if (rating === Rating.Easy) {
        scheduledDays = Math.max(scheduledDays + 1, Math.round(scheduledDays * 1.3))
      }
      dueDate = now + scheduledDays * DAY
    }
  }

  return {
    state,
    stability: Number(s.toFixed(4)),
    difficulty: Number(d.toFixed(4)),
    reps,
    lapses,
    lastReview: now,
    dueDate,
    scheduledDays,
  }
}

export function formatIntervalLabel(cardState, nextCardState, now = Date.now()) {
  const diffMs = Math.max(0, nextCardState.dueDate - now)
  const mins = Math.round(diffMs / (60 * 1000))
  if (mins < 60) return `${Math.max(1, mins)}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = nextCardState.scheduledDays || Math.round(hours / 24)
  if (days < 30) return `${days}d`
  const months = (days / 30).toFixed(1)
  return `${months}mo`
}

export function getSchedulingPreview(card, now = Date.now()) {
  const current = card && typeof card.state === 'number' ? card : initCard(now)
  return {
    [Rating.Again]: {
      card: nextState(current, Rating.Again, now),
      label: formatIntervalLabel(current, nextState(current, Rating.Again, now), now),
    },
    [Rating.Hard]: {
      card: nextState(current, Rating.Hard, now),
      label: formatIntervalLabel(current, nextState(current, Rating.Hard, now), now),
    },
    [Rating.Good]: {
      card: nextState(current, Rating.Good, now),
      label: formatIntervalLabel(current, nextState(current, Rating.Good, now), now),
    },
    [Rating.Easy]: {
      card: nextState(current, Rating.Easy, now),
      label: formatIntervalLabel(current, nextState(current, Rating.Easy, now), now),
    },
  }
}

export function isDue(card, now = Date.now()) {
  if (!card || typeof card.state !== 'number') return true
  if (card.state === State.New) return true
  return (card.dueDate || 0) <= now
}
