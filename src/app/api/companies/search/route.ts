import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.trim().length === 0) {
    return NextResponse.json([])
  }

  try {
    // Supabaseデータベースから企業を検索
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        location,
        employee_count
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name')
      .limit(limit)

    if (error) {
      console.error('Database search error:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(companies || [])

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
}