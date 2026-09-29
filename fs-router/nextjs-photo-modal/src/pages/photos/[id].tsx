import type { PageProps } from 'waku/router';
import { Photo } from '../../components/photo';
import { photoIds } from '../../photos';

export default async function PhotoPage({ id }: PageProps<'/photos/[id]'>) {
  return <Photo id={id} />;
}

// `export const dynamicParams = false` plus generateStaticParams() becomes a
// static render with an explicit list of paths: anything outside it is a 404.
export const getConfig = async () => {
  return {
    render: 'static',
    staticPaths: photoIds,
  } as const;
};
