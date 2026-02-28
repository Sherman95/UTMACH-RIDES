import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const size = Number(searchParams.get('size') || 192)

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: size * 0.4,
          background: '#204e99',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: size * 0.2,
          color: 'white',
          fontWeight: 700,
        }}
      >
        UT
      </div>
    ),
    { width: size, height: size }
  )
}
