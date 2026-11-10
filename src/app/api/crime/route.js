const DATASET = 'https://data.oaklandca.gov/resource/ym6k-rx7a.json'

// Trend shown at the top of the Safety tab. In this dataset "BURG - AUTO" is
// a car break-in; "STOLEN VEHICLE" is a vehicle theft and is not included.
const TREND = {
  label: 'Vehicle break-ins',
  crimetypes: ['BURG - AUTO'],
}

const CACHE = { next: { revalidate: 3600 } }

// "E 14TH ST" -> "E 14th St"
function titleCase(str) {
  return str.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())
}

// "2147 E 14TH ST" -> "2100 block of E 14th St"
function toBlock(address) {
  if (!address) return 'Unknown location'
  const cleaned = address.replace(/\s*\/\s*/, ' ').replace(/\s+/g, ' ').trim()
  const match = cleaned.match(/^(\d+)\s+(.+)$/)
  if (!match) return titleCase(cleaned) // intersections like "BIRDSALL AV & MADERA AV"
  const block = Math.floor(Number(match[1]) / 100) * 100
  const street = titleCase(match[2])
  return block === 0 ? `Unit block of ${street}` : `${block} block of ${street}`
}

async function query(params) {
  const res = await fetch(`${DATASET}?${new URLSearchParams(params)}`, CACHE)
  if (!res.ok) throw new Error(`City data API returned ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows)) throw new Error('Unexpected response from city data API')
  return rows
}

const pad = n => String(n).padStart(2, '0')

// Date.UTC handles overflow (month 0 -> December of the year before, day 32 -> next month)
function dateOnly(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

async function countBetween(start, endExclusive) {
  const types = TREND.crimetypes.map(t => `'${t}'`).join(', ')
  const rows = await query({
    $select: 'count(*) as n',
    $where: `crimetype in (${types}) AND datetime >= '${start}T00:00:00' AND datetime < '${endExclusive}T00:00:00'`,
  })
  return Number(rows[0]?.n) || 0
}

// Month to date vs the same days of last month. The data runs a few days
// behind, so "to date" means up to the newest record in the dataset, and last
// month is cut at the same day so the two periods are the same length.
async function getTrend() {
  const [{ latest }] = await query({ $select: 'max(datetime) as latest' })
  const [y, m, d] = latest.slice(0, 10).split('-').map(Number)
  const daysInLastMonth = new Date(Date.UTC(y, m - 1, 0)).getUTCDate()
  const lastDay = Math.min(d, daysInLastMonth)

  const [thisMonth, lastMonth] = await Promise.all([
    countBetween(dateOnly(y, m, 1), dateOnly(y, m, d + 1)),
    countBetween(dateOnly(y, m - 1, 1), dateOnly(y, m - 1, lastDay + 1)),
  ])

  return {
    label: TREND.label,
    thisMonth,
    lastMonth,
    // Inclusive date ranges, YYYY-MM-DD
    thisPeriod: { start: dateOnly(y, m, 1), end: dateOnly(y, m, d) },
    lastPeriod: { start: dateOnly(y, m - 1, 1), end: dateOnly(y, m - 1, lastDay) },
  }
}

export async function GET() {
  try {
    const [rows, trend] = await Promise.all([
      query({ $limit: '100', $order: 'datetime DESC' }),
      // The incident list still works if the trend counts fail
      getTrend().catch(() => null),
    ])
    // Only send what the UI needs: no case numbers, no exact coordinates
    const incidents = rows.map(row => ({
      crimetype: row.crimetype,
      description: row.description,
      datetime: row.datetime,
      policebeat: row.policebeat,
      block: toBlock(row.address),
    }))
    return Response.json({ incidents, trend })
  } catch {
    return Response.json({ error: 'Failed to fetch crime data' }, { status: 502 })
  }
}
