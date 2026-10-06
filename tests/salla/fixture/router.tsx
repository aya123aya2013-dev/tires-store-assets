// The hero reads the store language from the route (`/{-$locale}/`); the harness takes it from ?lang.
export function useParams() {
  return { locale: new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : undefined };
}
