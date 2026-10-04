/**
 * Delivery choice for the cart ("ship to my address" vs "pick up + install in
 * Riyadh") and the installation centers list.
 *
 * TODO(merchant): replace the sample centers below with the real ones
 * (name, address, working hours, Google Maps link).
 */

export interface InstallCenter {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapUrl: string;
}

export const INSTALL_CENTERS: InstallCenter[] = [
  {
    id: 'riyadh-north',
    name: 'مركز التركيب - شمال الرياض',
    address: 'حي النرجس، طريق الملك سلمان',
    hours: 'من 9 صباحاً إلى 9 مساءً',
    mapUrl: 'https://maps.google.com/?q=Riyadh',
  },
  {
    id: 'riyadh-east',
    name: 'مركز التركيب - شرق الرياض',
    address: 'حي الروضة، شارع خالد بن الوليد',
    hours: 'من 9 صباحاً إلى 9 مساءً',
    mapUrl: 'https://maps.google.com/?q=Riyadh',
  },
];

export type DeliveryMethod = 'shipping' | 'install';

export interface DeliveryChoice {
  method: DeliveryMethod;
  centerId?: string;
}

const STORAGE_KEY = 'tires:delivery-choice';

/** Last choice made in the cart, so the thank-you page can show the center. */
export function readDeliveryChoice(): DeliveryChoice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeliveryChoice) : null;
  } catch {
    return null;
  }
}

export function saveDeliveryChoice(choice: DeliveryChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* storage unavailable (private mode) — the choice just isn't remembered */
  }
}

export function findCenter(id?: string): InstallCenter | undefined {
  return INSTALL_CENTERS.find((center) => center.id === id);
}
