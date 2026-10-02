import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { CartProvider } from 'components/cart/cart-context';
import { StorefrontErrorBoundary } from 'components/error-boundary';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { getCart } from 'lib/shopify';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <>
      <title>{process.env.SITE_NAME || 'Acme Store'}</title>
      <CartProvider cartPromise={cart}>
        <Navbar />
        <main>
          <StorefrontErrorBoundary>{children}</StorefrontErrorBoundary>
          <Toaster closeButton />
          <WelcomeToast />
        </main>
      </CartProvider>
    </>
  );
}

// The layout reads the cart cookie, so it cannot be prerendered.
export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
