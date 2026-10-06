/**
 * Card "add to cart" for the product sections. A product with options the shopper must pick
 * (size, quantity…) opens its page instead; otherwise it adds through the Salla SDK and only
 * says "added" after Salla accepted it. One request at a time per product.
 */
import { useState } from 'react';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { addToCart } from './products';
import type { TcProduct } from './products';

export type AddState = 'idle' | 'busy' | 'done' | 'failed';

export function useAddToCart() {
  const navigate = useNavigate();
  const [state, setState] = useState<Record<number, AddState>>({});
  const set = (id: number, s: AddState) => setState(prev => ({ ...prev, [id]: s }));

  const add = async (p: TcProduct, quantity: number) => {
    if (state[p.id] === 'busy') return;
    if (p.hasOptions) {
      navigate(p.url);
      return;
    }
    set(p.id, 'busy');
    try {
      await addToCart(p.id, quantity);
      set(p.id, 'done');
    } catch {
      set(p.id, 'failed');
    }
  };

  return { add, stateOf: (id: number): AddState => state[id] ?? 'idle' };
}
