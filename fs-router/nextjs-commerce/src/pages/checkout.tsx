import Footer from 'components/layout/footer';

export default function CheckoutPage() {
  return (
    <>
      <title>{`Checkout | ${process.env.SITE_NAME || 'Acme Store'}`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="w-full">
        <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
          <h1 className="mb-8 text-5xl font-bold">Checkout</h1>
          <p>
            A Shopify store hands the cart to its hosted checkout here. This
            store runs on fixture data, so the journey ends on this page.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
