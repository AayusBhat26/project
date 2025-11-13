import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city');

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 });
    }

    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;

    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city}`;
    } else {
      return NextResponse.json({ error: 'Missing location parameters' }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch weather' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
