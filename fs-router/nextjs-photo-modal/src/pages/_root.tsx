import type { ReactNode } from 'react';
import '../global.css';

export default function RootElement({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>NextGram</title>
        <meta
          name="description"
          content="Photos open in a modal from the feed, and as a page when loaded directly."
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
