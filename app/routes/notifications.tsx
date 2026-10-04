// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { accountRedirectLoader } from '@salla.sa/twilight-theme-engine/routes/seo-redirects';

export const Route = createFileRoute('/{-$locale}/notifications')({
  loader: ({ params, location }) =>
    accountRedirectLoader({
      params: { locale: params.locale },
      page: 'notifications',
      search: location.searchStr,
    }),
});
