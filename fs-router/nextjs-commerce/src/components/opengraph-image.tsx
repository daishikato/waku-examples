import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import LogoIcon from './icons/logo';

// next/og's ImageResponse is satori (JSX to SVG) followed by resvg (SVG to
// PNG), so this calls the two directly. The image has to be a PNG: social
// crawlers do not render an SVG og:image. The font is Inter Bold, as in the
// original, taken from @fontsource/inter because satori cannot read woff2. The
// original's `tw` classes are written as styles: React's types have no `tw`.
export async function opengraphImage(
  title = process.env.SITE_NAME || 'Acme Store',
) {
  const font = await readFile(
    createRequire(import.meta.url).resolve(
      '@fontsource/inter/files/inter-latin-700-normal.woff',
    ),
  );

  const svg = await satori(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 160,
          height: 160,
          border: '1px solid #404040',
          borderRadius: 24,
        }}
      >
        <LogoIcon width="64" height="58" fill="white" />
      </div>
      <p
        style={{ marginTop: 48, fontSize: 60, fontWeight: 700, color: 'white' }}
      >
        {title}
      </p>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: font, style: 'normal', weight: 700 }],
    },
  );

  return new Response(new Uint8Array(new Resvg(svg).render().asPng()), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=3600',
    },
  });
}
