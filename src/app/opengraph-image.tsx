import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'LINE流行語大賞 | トーク履歴解析';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #06C755 0%, #00B900 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            LINE流行語大賞
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 40,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: 900,
              gap: 10,
            }}
          >
            <div>あなたのLINEトーク履歴を解析して</div>
            <div>1年間の流行語大賞を発表します</div>
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 30,
              color: 'rgba(255,255,255,0.8)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '15px 40px',
              borderRadius: 50,
            }}
          >
            プライバシー重視の安全な解析
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
