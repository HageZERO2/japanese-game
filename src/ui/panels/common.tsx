import type { ReactNode } from 'react';
import type { Category } from '../../types';

export const CATEGORY_LABEL: Record<Category, string> = {
  animals: 'Animals',
  food: 'Food',
  drinks: 'Drinks',
  furniture: 'Furniture',
  nature: 'Nature',
  transport: 'Transport',
  buildings: 'Buildings',
  clothing: 'Clothing',
  technology: 'Technology',
  household: 'Household',
  activities: 'Activities',
  culture: 'Culture',
  people: 'People',
  stationery: 'Stationery',
  phrases: 'Phrases',
};

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export function Bar({ value, max = 1, tone = 'pink' }: { value: number; max?: number; tone?: 'pink' | 'blue' | 'orange' }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="pn-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`pn-bar-fill pn-tone-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Icon({ name }: { name: 'close' | 'star' | 'starOn' | 'speaker' | 'trash' | 'check' | 'plus' | 'chevron' }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  const star = 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z';
  switch (name) {
    case 'close':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'star':
      return <svg {...p}><path d={star} /></svg>;
    case 'starOn':
      return <svg {...p} fill="currentColor"><path d={star} /></svg>;
    case 'speaker':
      return <svg {...p}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="M15.5 9a4 4 0 010 6M18 6.5a8 8 0 010 11" /></svg>;
    case 'trash':
      return <svg {...p}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></svg>;
    case 'check':
      return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'chevron':
      return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
  }
}

export function Section({ title, jp, children }: { title: string; jp?: string; children: ReactNode }) {
  return (
    <section className="pn-section">
      <h3 className="pn-h3">
        {title}
        {jp && <span className="pn-h3-jp">{jp}</span>}
      </h3>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="pn-empty">{children}</div>;
}
