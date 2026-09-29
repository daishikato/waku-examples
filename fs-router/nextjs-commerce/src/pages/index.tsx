import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { baseUrl } from 'lib/utils';

export default function HomePage() {
  return (
    <>
      <meta
        name="description"
        content="High-performance ecommerce store built with Next.js, Vercel, and Shopify."
      />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${baseUrl}/opengraph-image`} />
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
