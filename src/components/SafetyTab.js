'use client'
import { useState, useEffect } from 'react'
import TextTabs from './TextTabs'

// Friendlier names for the dataset's crimetype values; anything else is shown
// in sentence case ("STOLEN VEHICLE" -> "Stolen vehicle").
const TYPE_LABELS = {
  'BURG - AUTO': 'Car break-in',
  'BURG - RESIDENTIAL': 'Home burglary',
  'BURG - COMMERCIAL': 'Business burglary',
  'BURG - OTHER': 'Burglary',
  'RECOVERED O/S STOLEN': 'Recovered stolen vehicle',
  'RECOVERED VEHICLE - OAKLAND STOLEN': 'Recovered stolen vehicle',
  'STOLEN AND RECOVERED VEHICLE': 'Stolen and recovered vehicle',
  'DUI': 'DUI',
}

const VIOLENT = ['ASSAULT', 'ROBBERY', 'WEAPONS', 'HOMICIDE', 'RAPE', 'KIDNAPPING', 'DOMESTIC', 'BRANDISHING', 'THREATS']
const PROPERTY = ['THEFT', 'BURG', 'VANDALISM', 'STOLEN', 'ARSON', 'VEHICLE']

function typeLabel(crimetype) {
  if (!crimetype) return 'Other'
  const upper = crimetype.toUpperCase()
  if (TYPE_LABELS[upper]) return TYPE_LABELS[upper]
  const lower = crimetype.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

// Dot color: violent = danger, property and vehicle = safety orange, other = muted
function typeDot(crimetype) {
  const upper = (crimetype || '').toUpperCase()
  if (VIOLENT.some(k => upper.includes(k))) return 'bg-danger'
  if (PROPERTY.some(k => upper.includes(k))) return 'bg-cat-safety'
  return 'bg-muted'
}

const FILTERS = [
  { key: 'all', label: 'All', match: null },
  { key: 'theft', label: 'Theft', match: ['THEFT'] },
  { key: 'assault', label: 'Assault', match: ['ASSAULT'] },
  { key: 'vehicle', label: 'Vehicle', match: ['VEHICLE', 'BURG - AUTO'] },
  { key: 'weapons', label: 'Weapons', match: ['WEAPONS'] },
  { key: 'vandalism', label: 'Vandalism', match: ['VANDALISM'] },
]

function timeAgo(datetime, now) {
  const then = new Date(datetime)
  const mins = Math.max(0, Math.round((now - then) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// "2026-10-01" / "2026-10-08" -> "Oct 1–8"
function periodLabel({ start, end }) {
  const fmt = (s, opts) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...opts })
  const startText = fmt(start, { month: 'short', day: 'numeric' })
  return start === end ? startText : `${startText}–${fmt(end, { day: 'numeric' })}`
}

function Trend({ trend }) {
  const diff = trend.thisMonth - trend.lastMonth
  const compared = periodLabel(trend.lastPeriod)
  return (
    <section className="mt-6" aria-label={`${trend.label} this month`}>
      <p className="text-base text-ink">{trend.label} this month</p>
      <p className="font-display font-extrabold text-5xl text-ink tracking-[-0.02em] mt-1">
        {trend.thisMonth}
      </p>
      <p className="text-sm text-muted mt-1">
        citywide · {periodLabel(trend.thisPeriod)}
      </p>
      <p className="text-sm text-ink mt-1">
        {diff === 0 ? (
          <>Same as {compared}</>
        ) : (
          <>
            <span className={diff < 0 ? 'text-brand' : 'text-danger'} aria-hidden="true">
              {diff < 0 ? '↓' : '↑'}
            </span>{' '}
            {Math.abs(diff)} {diff < 0 ? 'fewer' : 'more'} than {compared}
          </>
        )}
      </p>
    </section>
  )
}

// Fetches /api/crime itself on mount (every time the Safety tab opens).
export default function SafetyTab() {
  const [incidents, setIncidents] = useState([])
  const [trend, setTrend] = useState(null)
  const [now, setNow] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/crime')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.incidents)) {
          setIncidents(data.incidents)
          setTrend(data.trend)
          setNow(Date.now())
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const active = FILTERS.find(f => f.key === filter)
  const filtered = active.match
    ? incidents.filter(c => active.match.some(k => c.crimetype?.toUpperCase().includes(k)))
    : incidents

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl text-ink tracking-[-0.02em]">Safety</h1>
      <p className="text-sm text-muted mt-1">Oakland Police public data · may be delayed a few days</p>

      {loading ? (
        <p className="text-base text-muted py-12 text-center">Loading Oakland crime data...</p>
      ) : error ? (
        <p className="text-base text-muted py-12 text-center">Crime data isn&apos;t available right now</p>
      ) : (
        <>
          {trend && <Trend trend={trend} />}

          <TextTabs tabs={FILTERS} active={filter} onChange={setFilter} className="mt-6" />

          {filtered.length === 0 ? (
            <p className="text-base text-muted py-8 text-center">
              No {active.label.toLowerCase()} incidents in the latest reports.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((crime, i) => (
                <li key={i} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-base font-medium text-ink">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 self-center ${typeDot(crime.crimetype)}`} aria-hidden="true" />
                      {typeLabel(crime.crimetype)}
                    </span>
                    <span className="text-sm text-muted flex-shrink-0">{timeAgo(crime.datetime, now)}</span>
                  </div>
                  <p className="text-sm text-muted mt-0.5 pl-4">{crime.block}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="text-sm text-muted text-center pt-6 pb-4">
        Locations are shown by block, never an exact address.
      </p>
    </div>
  )
}
