const DATASET_URL =
  'https://data.oaklandca.gov/resource/ym6k-rx7a.json?$limit=20&$order=datetime%20DESC'

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

export async function GET() {
  try {
    const res = await fetch(DATASET_URL, { next: { revalidate: 3600 } })
    if (!res.ok) {
      return Response.json({ error: `City data API returned ${res.status}` }, { status: 502 })
    }
    const rows = await res.json()
    if (!Array.isArray(rows)) {
      return Response.json({ error: 'Unexpected response from city data API' }, { status: 502 })
    }
    // Only send what the UI needs: no case numbers, no exact coordinates
    const crimes = rows.map(row => ({
      crimetype: row.crimetype,
      description: row.description,
      datetime: row.datetime,
      policebeat: row.policebeat,
      block: toBlock(row.address),
    }))
    return Response.json(crimes)
  } catch {
    return Response.json({ error: 'Failed to fetch crime data' }, { status: 502 })
  }
}
