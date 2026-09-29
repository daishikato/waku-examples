import type { ReactNode } from 'react';
import '@/ui/global.css';

// The original's metadata export used a title template ('%s | Acme Dashboard').
// Waku has no templates, so each page writes its full title, which overrides
// the default declared here.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <title>Acme Dashboard</title>
      <meta
        name="description"
        content="The official Next.js Learn Dashboard built with App Router."
      />
      {children}
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
