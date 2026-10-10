// Theme override for the thank-you route (`/{-$locale}/thankyou/$orderId`),
// wired in via `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin
// leaves this file alone; the engine's own `thankyou.$orderId.tsx` stays
// generated and unused.
//
// Reuses the engine loader / head / page, and adds the installation-center
// card for "pick up + install" orders.
import { createFileRoute } from '@tanstack/react-router';
import { ThankYou } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import type { ThankYouPageProps } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { TcThankYouNext } from '../components/tires/cart/TcCartParts';

export const Route = createFileRoute('/{-$locale}/thankyou/$orderId')({
  loader: ({ params }): Promise<ThankYouPageProps> =>
    ThankYou.loader({ params: { orderId: params.orderId }, locale: params.locale }),
  head: withHead(ThankYou),
  component: ThankYouComponent,
});

function ThankYouComponent() {
  const data: ThankYouPageProps = Route.useLoaderData();
  return (
    <>
      <ThankYou.Component {...data} />
      <TcThankYouNext orderNo={data.order?.reference_id} />
    </>
  );
}
