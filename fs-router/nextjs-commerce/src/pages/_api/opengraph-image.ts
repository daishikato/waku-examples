import { opengraphImage } from 'components/opengraph-image';
import { getCollection, getPage, getProduct } from 'lib/shopify';

// app/opengraph-image.tsx and its per-route variants become one endpoint, keyed
// by the handle of the route it draws. The title is looked up rather than taken
// from the URL, so the image can only say what the store says.
const getTitle = async (params: URLSearchParams) => {
  const page = params.get('page');
  if (page) {
    const found = await getPage(page);
    return found && (found.seo?.title || found.title);
  }
  const collection = params.get('collection');
  if (collection) {
    const found = await getCollection(collection);
    return found && (found.seo?.title || found.title);
  }
  const product = params.get('product');
  if (product) {
    return (await getProduct(product))?.title;
  }
  return process.env.SITE_NAME || 'Acme Store';
};

export const GET = async (req: Request) => {
  const title = await getTitle(new URL(req.url).searchParams);
  if (!title) {
    return new Response('Not Found', { status: 404 });
  }
  return opengraphImage(title);
};
