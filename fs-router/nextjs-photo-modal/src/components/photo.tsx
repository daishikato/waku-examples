'use client';

import { useState } from 'react';
import { useRouter } from 'waku';
import { hasHydrated } from './navigation-state';

export const Photo = ({ id }: { id: string }) => {
  // Read during render, before any effect has run: on the initial load this is
  // false, and on a navigation from the feed it is true. Kept in state so that
  // the choice never changes underneath an open modal.
  const [asModal] = useState(hasHydrated);

  if (!asModal) {
    return (
      <figure className="photo" data-standalone>
        {id}
      </figure>
    );
  }

  return <PhotoDialog id={id} />;
};

// showModal() puts the dialog in the top layer, above the feed, so it needs no
// portal. Both ways of closing it, the button and Escape, fire `close`.
const PhotoDialog = ({ id }: { id: string }) => {
  const router = useRouter();

  return (
    <dialog
      className="photo-dialog"
      ref={(dialog) => {
        if (dialog && !dialog.open) {
          dialog.showModal();
        }
      }}
      onClose={() => router.back()}
    >
      <figure className="photo">{id}</figure>
      <form method="dialog">
        <button className="photo-dialog-close" aria-label="Close">
          ×
        </button>
      </form>
    </dialog>
  );
};
