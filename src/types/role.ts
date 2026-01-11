// types/role.ts

/** 役の種別 */
export type RoleType =
  | 'flush'      // フラッシュ系（5枚同色）
  | 'fullHouse'  // フルハウス（同色3枚+別色2枚）
  | 'fur'        // ファー系（5枚同じ毛の長さ）
  | 'fourColor'  // フォーカラー（同色4枚）
  | 'threeColor' // スリーカラー（同色3枚、残り2枚が異なる色）
  | 'twoPair'    // ツーペア（2組のペア）
  | 'onePair'    // ワンペア（同色2枚、残り3枚が異なる色）
  | 'noPair';    // ノーペア

/** 役情報 */
export interface Role {
  type: RoleType;
  name: string;           // 表示名（例: 'サビフラッシュ'）
  points: number;         // ポイント（0-200）
  matchingCardIds: number[]; // 役を構成するカードID
}
