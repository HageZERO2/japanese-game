export type Category =
  | 'animals'
  | 'food'
  | 'drinks'
  | 'furniture'
  | 'nature'
  | 'transport'
  | 'buildings'
  | 'clothing'
  | 'technology'
  | 'household'
  | 'activities'
  | 'culture'
  | 'people'
  | 'stationery';

export interface Word {
  id: string;
  /** Japanese as normally written (kanji / katakana / hiragana). */
  jp: string;
  /** Full reading in hiragana (katakana words: hiragana transliteration). */
  kana: string;
  romaji: string;
  en: string;
  category: Category;
  /** Example sentence in Japanese. */
  ex: string;
  /** Example sentence in romaji. */
  exRomaji: string;
  /** Example sentence translation. */
  exEn: string;
}

export type ZoneId = 'main' | 'shopping' | 'traditional' | 'cafe' | 'residential';
export type InteriorId = 'konbini' | 'ramen' | 'house' | 'cafe' | 'bookstore';
export type LocationId = 'outside' | InteriorId;
