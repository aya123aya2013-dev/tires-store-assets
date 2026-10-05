import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SizeFinder } from '../../app/components/home/SizeFinder';

const navigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => navigate }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));

const width = (c: HTMLElement) => c.querySelector('#tc-in-w') as HTMLInputElement;

describe('size finder combobox', () => {
  it('suggests sizes while typing and picks one', () => {
    const { container } = render(<SizeFinder data={{}} />);
    fireEvent.change(width(container), { target: { value: '22' } });
    const sug = [...container.querySelectorAll('.tc-dd-suggest .tc-dd-o')].map(b => b.textContent);
    expect(sug.slice(0, 2)).toEqual(['225']);
    fireEvent.click(screen.getByText('225', { selector: '.tc-dd-suggest .tc-dd-o' }));
    expect(width(container).value).toBe('225');
  });

  it('Enter accepts an exact typed size; nonsense falls back to the closest suggestion', () => {
    const { container } = render(<SizeFinder data={{}} />);
    fireEvent.change(width(container), { target: { value: '245' } });
    fireEvent.keyDown(width(container), { key: 'Enter' });
    expect(width(container).value).toBe('245');
    fireEvent.change(width(container), { target: { value: 'abc' } });
    expect(width(container).value).toBe(''); // letters other than R are dropped while typing
  });

  it('trucks on by default, buses off; each in its own labelled group', () => {
    const { container } = render(<SizeFinder data={{}} />);
    fireEvent.click(container.querySelector('.tc-dd-arrow')!);
    const heads = [...container.querySelectorAll('.tc-dd-panel .t')].map(e => e.textContent);
    expect(heads.some(h => h?.startsWith('شاحنات'))).toBe(true);
    expect(heads.some(h => h?.startsWith('باصات'))).toBe(false);
  });

  it('a bus size disables the profile box and searches 12R22.5', () => {
    navigate.mockClear();
    const { container } = render(<SizeFinder data={{ show_buses: true, show_trucks: false }} />);
    fireEvent.click(container.querySelector('.tc-dd-arrow')!);
    fireEvent.click(screen.getByText('12', { selector: '.tc-dd-trucks .tc-dd-o' }));
    expect((container.querySelector('#tc-in-r') as HTMLInputElement).disabled).toBe(true);
    const rimArrow = container.querySelectorAll('.tc-dd-arrow')[2];
    fireEvent.click(rimArrow);
    fireEvent.click(screen.getByText('22.5', { selector: '.tc-dd-trucks .tc-dd-o' }));
    fireEvent.submit(container.querySelector('form')!);
    expect(navigate).toHaveBeenCalledWith('/search?q=12R22.5');
  });
});
