// types/card.ts

/** 毛色コード（0-11） */
export type ColorCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** 毛の長さコード */
export type FurCode = 0 | 1; // 0: 長毛, 1: 短毛

/** 毛色名称マッピング */
export const COLOR_NAMES: Record<ColorCode, string> = {
  0: '茶トラ',
  1: '三毛',
  2: '白猫',
  3: '黒猫',
  4: '茶白',
  5: 'キジ白',
  6: 'キジトラ',
  7: '白黒',
  8: 'サバトラ',
  9: 'グレー',
  10: 'トビ',
  11: 'サビ',
};

/** 毛の長さ名称マッピング */
export const FUR_NAMES: Record<FurCode, string> = {
  0: '長毛',
  1: '短毛',
};

/** カード情報 */
export interface Card {
  id: number;           // 0-228
  image: string;        // 画像パス（例: '/images/image_000.jpg'）
  color: ColorCode;     // 毛色
  fur: FurCode;         // 毛の長さ
}
