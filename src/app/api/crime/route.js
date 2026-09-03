export async function GET() {
  try {
    const res = await fetch(
      'https://data.oaklandca.gov/resource/ppgh-7dqv.json?$limit=20&$order=datetime DESC',
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch crime data' }, { status: 500 })
  }
}