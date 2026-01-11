// カードデータ生成スクリプト
// images/map.yml からカードデータを読み込み、TypeScript ファイルを生成する

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MapYaml {
  color: Record<number, string>;
  fur: Record<number, string>;
  images: Record<string, [number, number]>;
}

function generateCardData() {
  const mapPath = path.join(__dirname, '../images/map.yml');
  const content = fs.readFileSync(mapPath, 'utf-8');
  const data = yaml.load(content) as MapYaml;

  // 画像ファイル名をソートして配列に変換
  const cardEntries = Object.entries(data.images).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const cardData = cardEntries.map(([_filename, [color, fur]]) => ({
    color,
    fur,
  }));

  // TypeScript ファイルとして出力
  const output = `// 自動生成ファイル - 直接編集しないでください
// 生成元: images/map.yml
// 生成コマンド: npm run generate:card-data

import type { ColorCode, FurCode } from '../types';

/** カードデータ（229枚） */
export const CARD_DATA: Array<{ color: ColorCode; fur: FurCode }> = ${JSON.stringify(cardData, null, 2)};
`;

  const outputPath = path.join(__dirname, '../src/data/cardData.ts');

  // ディレクトリが存在しない場合は作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, output);
  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   Total cards: ${cardData.length}`);
}

generateCardData();
