// Theme-only route: the help & installation page (`/{-$locale}/help`), wired in
// via `app/routes.ts`. NOT `// @auto-generated`. Static content, no loader.
import { createFileRoute } from '@tanstack/react-router';
import { HelpPage } from '../components/tires/HelpPage';

export const Route = createFileRoute('/{-$locale}/help')({
  head: () => ({ meta: [{ title: 'المساعدة والتركيب' }] }),
  component: HelpPage,
});
