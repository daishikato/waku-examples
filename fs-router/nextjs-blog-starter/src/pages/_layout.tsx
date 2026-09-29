import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CMS_NAME } from "@/lib/constants";
import "@/globals.css";

// The `metadata` export of app/layout.tsx becomes plain tags: Waku hoists any
// <title>, <meta> and <link> it finds in a page or layout into the document head,
// and a page's title and description override the defaults here. og:image can
// repeat, so Waku does not merge it; it stays on the pages that set one.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <title>{`Next.js Blog Example with ${CMS_NAME}`}</title>
      <meta
        name="description"
        content={`A statically generated blog example using Next.js and ${CMS_NAME}.`}
      />
      <link rel="icon" type="image/png" href="/images/favicon.png" />
      <meta name="theme-color" content="#000" />
      <ThemeSwitcher />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
