// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { ratingRedirectLoader } from '@salla.sa/twilight-theme-engine/routes/seo-redirects';

export const Route = createFileRoute('/{-$locale}/account/rating')({
  loader: ({ params }) =>
    ratingRedirectLoader({
      params: { locale: params.locale },
    }),
});
