import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { addToCart } from '../../app/components/home/tc/products';
import { useAddToCart } from '../../app/components/home/tc/useAddToCart';

const navigate = vi.fn();
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => navigate }));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({ product: { queries: { list: () => ({}) } } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({}) }));

const tire = { id: 7, url: '/p7', brand: '', name: 'x', size: '', rim: '', type: '', price: 1, image: '' };
type W = { salla?: unknown };

describe('R1-1 add to cart', () => {
  it('rejects when the Salla SDK is not there', async () => {
    delete (window as W).salla;
    await expect(addToCart(1, 1)).rejects.toThrow('cart-unavailable');
  });

  it('says "done" only after Salla accepted it, "failed" when it refuses', async () => {
    (window as W).salla = { cart: { addItem: vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('no')) } };
    const { result } = renderHook(() => useAddToCart());
    await act(() => result.current.add(tire, 4));
    expect(result.current.stateOf(7)).toBe('done');
    await act(() => result.current.add({ ...tire, id: 8 }, 1));
    expect(result.current.stateOf(8)).toBe('failed');
  });

  it('opens the product page for products with required options', async () => {
    const { result } = renderHook(() => useAddToCart());
    await act(() => result.current.add({ ...tire, hasOptions: true }, 1));
    expect(navigate).toHaveBeenCalledWith('/p7');
  });
});
