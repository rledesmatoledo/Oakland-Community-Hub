'use client'
import { useState, useEffect } from 'react'

const crimeTypes = {
  'THEFT': { color: 'bg-amber-100 text-amber-700', label: 'Theft' },
  'ASSAULT': { color: 'bg-red-100 text-red-700', label: 'Assault' },
  'ROBBERY': { color: 'bg-red-100 text-red-700', label: 'Robbery' },
  'BURGLARY': { color: 'bg-orange-100 text-orange-700', label: 'Burglary' },
  'VANDALISM': { color: 'bg-purple-100 text-purple-700', label: 'Vandalism' },
  'WEAPONS': { color: 'bg-red-100 text-red-700', label: 'Weapons' },
  'VEHICLE': { color: 'bg-blue-100 text-blue-700', label: 'Vehicle' },
  'DOMESTIC': { color: 'bg-pink-100 text-pink-700', label: 'Domestic' },
}

function getCrimeType(crimetype) {
  if (!crimetype) return { color: 'bg-gray-100 text-gray-700', label: 'Other' }
  const upper = crimetype.toUpperCase()
  for (const [key, val] of Object.entries(crimeTypes)) {
    if (upper.includes(key)) return val
  }
  return { color: 'bg-gray-100 text-gray-700', label: 'Other' }
}

const filters = ['all', 'theft', 'assault', 'vehicle', 'weapons', 'vandalism']

// Formerly CrimeTab in app/page.js. Still fetches /api/crime itself on mount
// (every time the Safety tab opens), as before.
export default function SafetyTab() {
  const [crimes, setCrimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/crime')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCrimes(data)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? crimes : crimes.filter(c =>
    c.crimetype?.toUpperCase().includes(filter.toUpperCase())
  )

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">
      Loading Oakland crime data...
    </div>
  )

  if (error) return (
    <div className="text-center py-12 text-gray-400 text-sm">
      Crime data isn&apos;t available right now
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
        <div className="text-sm font-medium text-red-800">Oakland Crime Reports</div>
        <div className="text-xs text-red-600 mt-1">From Oakland PD public data · may be delayed a few days</div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize flex-shrink-0 ${
              filter === f
                ? 'bg-red-500 text-white border-red-500'
                : 'text-gray-500 border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((crime, i) => {
          const type = getCrimeType(crime.crimetype)
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 border-l-4 border-l-red-400">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.color}`}>
                  {type.label}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(crime.datetime).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 font-medium mb-1">
                {crime.description || crime.crimetype}
              </p>
              <p className="text-xs text-gray-500">
                {crime.block}, Oakland
              </p>
              <p className="text-xs text-gray-400 mt-2">Beat {crime.policebeat}</p>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        Source: City of Oakland Open Data Portal
      </p>
    </div>
  )
}
