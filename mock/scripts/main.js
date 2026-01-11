// =====================
// Card Data
// =====================
const colorNames = {
  0: '茶トラ', 1: '三毛', 2: '白猫', 3: '黒猫', 4: '茶白', 5: 'キジ白',
  6: 'キジトラ', 7: '白黒', 8: 'サバトラ', 9: 'グレー', 10: 'トビ', 11: 'サビ'
};
const furNames = { 0: '長毛', 1: '短毛' };

// Card data from map.yml
const cardData = {
  "image_000.jpg": [4, 1], "image_001.jpg": [9, 1], "image_002.jpg": [6, 1], "image_003.jpg": [4, 1],
  "image_004.jpg": [8, 1], "image_005.jpg": [4, 1], "image_006.jpg": [4, 1], "image_007.jpg": [3, 1],
  "image_008.jpg": [10, 1], "image_009.jpg": [4, 1], "image_010.jpg": [5, 1], "image_011.jpg": [7, 1],
  "image_012.jpg": [5, 1], "image_013.jpg": [8, 1], "image_014.jpg": [2, 1], "image_015.jpg": [0, 1],
  "image_016.jpg": [1, 0], "image_017.jpg": [6, 1], "image_018.jpg": [9, 1], "image_019.jpg": [3, 1],
  "image_020.jpg": [0, 0], "image_021.jpg": [0, 1], "image_022.jpg": [2, 1], "image_023.jpg": [2, 0],
  "image_024.jpg": [7, 1], "image_025.jpg": [0, 1], "image_026.jpg": [4, 0], "image_027.jpg": [6, 0],
  "image_028.jpg": [11, 1], "image_029.jpg": [0, 1], "image_030.jpg": [4, 1], "image_031.jpg": [9, 1],
  "image_032.jpg": [0, 1], "image_033.jpg": [4, 1], "image_034.jpg": [11, 1], "image_035.jpg": [4, 1],
  "image_036.jpg": [4, 0], "image_037.jpg": [1, 1], "image_038.jpg": [8, 1], "image_039.jpg": [2, 0],
  "image_040.jpg": [8, 1], "image_041.jpg": [4, 1], "image_042.jpg": [7, 1], "image_043.jpg": [5, 1],
  "image_044.jpg": [6, 1], "image_045.jpg": [0, 1], "image_046.jpg": [1, 1], "image_047.jpg": [2, 1],
  "image_048.jpg": [4, 1], "image_049.jpg": [7, 1], "image_050.jpg": [0, 1], "image_051.jpg": [8, 1],
  "image_052.jpg": [10, 1], "image_053.jpg": [3, 1], "image_054.jpg": [6, 1], "image_055.jpg": [6, 1],
  "image_056.jpg": [2, 0], "image_057.jpg": [6, 1], "image_058.jpg": [10, 0], "image_059.jpg": [6, 1],
  "image_060.jpg": [11, 1], "image_061.jpg": [2, 1], "image_062.jpg": [8, 1], "image_063.jpg": [4, 1],
  "image_064.jpg": [9, 0], "image_065.jpg": [9, 1], "image_066.jpg": [8, 1], "image_067.jpg": [4, 1],
  "image_068.jpg": [9, 0], "image_069.jpg": [3, 1], "image_070.jpg": [6, 1], "image_071.jpg": [7, 1],
  "image_072.jpg": [4, 1], "image_073.jpg": [3, 0], "image_074.jpg": [4, 1], "image_075.jpg": [5, 1],
  "image_076.jpg": [6, 1], "image_077.jpg": [2, 1], "image_078.jpg": [0, 1], "image_079.jpg": [5, 1],
  "image_080.jpg": [1, 0], "image_081.jpg": [9, 1], "image_082.jpg": [3, 1], "image_083.jpg": [6, 0],
  "image_084.jpg": [6, 0], "image_085.jpg": [7, 0], "image_086.jpg": [9, 0], "image_087.jpg": [6, 0],
  "image_088.jpg": [0, 0], "image_089.jpg": [8, 1], "image_090.jpg": [4, 1], "image_091.jpg": [0, 1],
  "image_092.jpg": [2, 1], "image_093.jpg": [7, 1], "image_094.jpg": [4, 1], "image_095.jpg": [3, 1],
  "image_096.jpg": [1, 1], "image_097.jpg": [6, 0], "image_098.jpg": [10, 1], "image_099.jpg": [8, 0],
  "image_100.jpg": [3, 1], "image_101.jpg": [5, 1], "image_102.jpg": [7, 1], "image_103.jpg": [0, 1],
  "image_104.jpg": [7, 1], "image_105.jpg": [1, 1], "image_106.jpg": [2, 1], "image_107.jpg": [4, 1],
  "image_108.jpg": [6, 1], "image_109.jpg": [3, 1], "image_110.jpg": [0, 1], "image_111.jpg": [9, 0],
  "image_112.jpg": [5, 1], "image_113.jpg": [10, 1], "image_114.jpg": [1, 0], "image_115.jpg": [7, 0],
  "image_116.jpg": [1, 1], "image_117.jpg": [10, 0], "image_118.jpg": [5, 1], "image_119.jpg": [5, 1],
  "image_120.jpg": [1, 1], "image_121.jpg": [6, 1], "image_122.jpg": [5, 1], "image_123.jpg": [0, 1],
  "image_124.jpg": [0, 1], "image_125.jpg": [5, 1], "image_126.jpg": [9, 1], "image_127.jpg": [9, 1],
  "image_128.jpg": [10, 1], "image_129.jpg": [9, 1], "image_130.jpg": [4, 1], "image_131.jpg": [3, 1],
  "image_132.jpg": [0, 1], "image_133.jpg": [10, 1], "image_134.jpg": [5, 1], "image_135.jpg": [4, 0],
  "image_136.jpg": [10, 1], "image_137.jpg": [2, 1], "image_138.jpg": [3, 1], "image_139.jpg": [7, 1],
  "image_140.jpg": [6, 1], "image_141.jpg": [4, 0], "image_142.jpg": [10, 0], "image_143.jpg": [10, 1],
  "image_144.jpg": [8, 1], "image_145.jpg": [7, 1], "image_146.jpg": [9, 1], "image_147.jpg": [3, 1],
  "image_148.jpg": [0, 1], "image_149.jpg": [0, 0], "image_150.jpg": [8, 1], "image_151.jpg": [6, 1],
  "image_152.jpg": [6, 1], "image_153.jpg": [0, 1], "image_154.jpg": [5, 1], "image_155.jpg": [9, 0],
  "image_156.jpg": [6, 1], "image_157.jpg": [9, 1], "image_158.jpg": [7, 0], "image_159.jpg": [6, 1],
  "image_160.jpg": [6, 0], "image_161.jpg": [0, 1], "image_162.jpg": [4, 1], "image_163.jpg": [10, 0],
  "image_164.jpg": [11, 1], "image_165.jpg": [6, 1], "image_166.jpg": [3, 1], "image_167.jpg": [9, 1],
  "image_168.jpg": [0, 1], "image_169.jpg": [6, 1], "image_170.jpg": [0, 0], "image_171.jpg": [3, 1],
  "image_172.jpg": [1, 1], "image_173.jpg": [9, 1], "image_174.jpg": [4, 1], "image_175.jpg": [6, 1],
  "image_176.jpg": [11, 1], "image_177.jpg": [9, 1], "image_178.jpg": [0, 1], "image_179.jpg": [8, 0],
  "image_180.jpg": [4, 0], "image_181.jpg": [0, 1], "image_182.jpg": [8, 1], "image_183.jpg": [7, 1],
  "image_184.jpg": [5, 1], "image_185.jpg": [8, 1], "image_186.jpg": [1, 0], "image_187.jpg": [9, 1],
  "image_188.jpg": [7, 0], "image_189.jpg": [4, 1], "image_190.jpg": [7, 1], "image_191.jpg": [2, 1],
  "image_192.jpg": [8, 0], "image_193.jpg": [9, 0], "image_194.jpg": [2, 1], "image_195.jpg": [11, 1],
  "image_196.jpg": [7, 1], "image_197.jpg": [7, 0], "image_198.jpg": [11, 1], "image_199.jpg": [9, 0],
  "image_200.jpg": [11, 1], "image_201.jpg": [6, 1], "image_202.jpg": [0, 1], "image_203.jpg": [5, 1],
  "image_204.jpg": [5, 1], "image_205.jpg": [1, 0], "image_206.jpg": [5, 1], "image_207.jpg": [6, 1],
  "image_208.jpg": [5, 1], "image_209.jpg": [5, 1], "image_210.jpg": [8, 1], "image_211.jpg": [4, 1],
  "image_212.jpg": [5, 1], "image_213.jpg": [2, 1], "image_214.jpg": [4, 1], "image_215.jpg": [0, 0],
  "image_216.jpg": [10, 1], "image_217.jpg": [9, 1], "image_218.jpg": [5, 0], "image_219.jpg": [9, 0],
  "image_220.jpg": [4, 1], "image_221.jpg": [4, 0], "image_222.jpg": [5, 1], "image_223.jpg": [3, 1],
  "image_224.jpg": [8, 1], "image_225.jpg": [7, 1], "image_226.jpg": [5, 1], "image_227.jpg": [9, 1],
  "image_228.jpg": [0, 0]
};

const allCards = Object.entries(cardData).map(([filename, attrs], index) => ({
  id: index,
  image: `../images/${filename}`,
  color: attrs[0],
  fur: attrs[1]
}));

// Role definitions - Updated with new point system (0-300)
const roles = {
  flushes: {
    11: { name: 'サビフラッシュ', points: 300 },
    1: { name: '三毛フラッシュ', points: 299 },
    10: { name: 'トビフラッシュ', points: 298 },
    2: { name: '白猫フラッシュ', points: 296 },
    3: { name: '黒猫フラッシュ', points: 295 },
    8: { name: 'サバトラフラッシュ', points: 288 },
    7: { name: '白黒フラッシュ', points: 282 },
    5: { name: 'キジ白フラッシュ', points: 258 },
    9: { name: 'グレーフラッシュ', points: 250 },
    0: { name: '茶トラフラッシュ', points: 226 },
    6: { name: 'キジトラフラッシュ', points: 225 },
    4: { name: '茶白フラッシュ', points: 198 }
  },
  fur: {
    0: { name: 'ロングファー', points: 100 },
    1: { name: 'ショートファー', points: 1 }
  },
  // Four of a color - points by color
  fourColor: {
    11: { name: 'サビフォーカラー', points: 277 },
    1: { name: '三毛フォーカラー', points: 213 },
    10: { name: 'トビフォーカラー', points: 197 },
    2: { name: '白猫フォーカラー', points: 180 },
    3: { name: '黒猫フォーカラー', points: 166 },
    8: { name: 'サバトラフォーカラー', points: 143 },
    7: { name: '白黒フォーカラー', points: 123 },
    5: { name: 'キジ白フォーカラー', points: 98 },
    9: { name: 'グレーフォーカラー', points: 92 },
    0: { name: '茶トラフォーカラー', points: 80 },
    6: { name: 'キジトラフォーカラー', points: 79 },
    4: { name: '茶白フォーカラー', points: 63 }
  },
  // Three of a color - points by color
  threeColor: {
    11: { name: 'サビスリーカラー', points: 112 },
    1: { name: '三毛スリーカラー', points: 70 },
    10: { name: 'トビスリーカラー', points: 60 },
    2: { name: '白猫スリーカラー', points: 50 },
    3: { name: '黒猫スリーカラー', points: 42 },
    8: { name: 'サバトラスリーカラー', points: 35 },
    7: { name: '白黒スリーカラー', points: 29 },
    5: { name: 'キジ白スリーカラー', points: 22 },
    9: { name: 'グレースリーカラー', points: 19 },
    0: { name: '茶トラスリーカラー', points: 18 },
    6: { name: 'キジトラスリーカラー', points: 17 },
    4: { name: '茶白スリーカラー', points: 16 }
  },
  // Two pair - points by color combination
  twoPairPoints: function(color1, color2) {
    // Rarity order (rarest to common): 11, 1, 10, 2, 3, 8, 7, 5, 9, 0, 6, 4
    const rarityScore = { 11: 12, 1: 11, 10: 10, 2: 9, 3: 8, 8: 7, 7: 6, 5: 5, 9: 4, 0: 3, 6: 2, 4: 1 };
    const score = rarityScore[color1] + rarityScore[color2];
    // Map score (2-24) to points (23-154)
    return Math.round(23 + (score - 2) * (154 - 23) / 22);
  },
  // Full house - points by color combination (3 of color1 + 2 of color2)
  fullHousePoints: function(color1, color2) {
    // Rarity order (rarest to common): 11, 1, 10, 2, 3, 8, 7, 5, 9, 0, 6, 4
    const rarityScore = { 11: 12, 1: 11, 10: 10, 2: 9, 3: 8, 8: 7, 7: 6, 5: 5, 9: 4, 0: 3, 6: 2, 4: 1 };
    // Weight the 3-of-a-kind color more heavily
    const score = rarityScore[color1] * 2 + rarityScore[color2];
    // Map score (3-36) to points (105-294)
    return Math.round(105 + (score - 3) * (294 - 105) / 33);
  },
  // One pair - points by color
  onePair: {
    11: { name: 'サビワンペア', points: 21 },
    1: { name: '三毛ワンペア', points: 15 },
    10: { name: 'トビワンペア', points: 13 },
    2: { name: '白猫ワンペア', points: 12 },
    3: { name: '黒猫ワンペア', points: 11 },
    8: { name: 'サバトラワンペア', points: 10 },
    7: { name: '白黒ワンペア', points: 8 },
    5: { name: 'キジ白ワンペア', points: 7 },
    9: { name: 'グレーワンペア', points: 6 },
    0: { name: '茶トラワンペア', points: 5 },
    6: { name: 'キジトラワンペア', points: 4 },
    4: { name: '茶白ワンペア', points: 2 }
  },
  noPair: { name: 'ノーペア', points: 0 }
};

// =====================
// Game State
// =====================
let gameState = {
  mode: 'solo', // 'solo' or 'battle'
  round: 1,
  score: 0,
  hand: [],
  dealerHand: [],
  selectedCards: [],
  exchanged: false,
  history: []
};

// =====================
// Screen Navigation
// =====================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function goToTitle() {
  showScreen('title-screen');
}

// =====================
// Card Functions
// =====================
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function drawCards(count, exclude = []) {
  const available = allCards.filter(c => !exclude.includes(c.id));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
}

function createCardElement(card, isBack = false, handId = 'solo-hand', animationType = 'deal') {
  // animationType: 'deal' = initial deal animation, 'enter' = exchange enter animation, 'none' = no animation
  const wrapper = document.createElement('div');
  wrapper.className = 'card-wrapper';
  wrapper.dataset.cardId = card.id;

  // Apply wrapper animation class for enter animation
  if (animationType === 'enter') {
    wrapper.classList.add('entering-in');
  }

  const cardDiv = document.createElement('div');
  if (animationType === 'deal') {
    cardDiv.className = 'card dealing';
  } else if (animationType === 'enter') {
    cardDiv.className = 'card entering';
  } else {
    cardDiv.className = 'card';
  }

  if (isBack) {
    cardDiv.classList.add('card-back');
    wrapper.appendChild(cardDiv);
    // Empty info area for back cards to maintain spacing
    const infoDiv = document.createElement('div');
    infoDiv.className = 'card-info';
    infoDiv.innerHTML = '<span class="card-color">&nbsp;</span><span class="card-fur">&nbsp;</span>';
    wrapper.appendChild(infoDiv);
  } else {
    const colorName = colorNames[card.color];
    const furName = furNames[card.fur];
    cardDiv.innerHTML = `<img src="${card.image}" alt="${colorName}の${furName}猫">`;
    wrapper.appendChild(cardDiv);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'card-info';
    infoDiv.innerHTML = `
      <span class="card-color">${colorNames[card.color]}</span>
      <span class="card-fur">${furNames[card.fur]}</span>
    `;
    wrapper.appendChild(infoDiv);

    // Only allow selection for player cards (not dealer)
    if (handId !== 'dealer-hand') {
      // Accessibility: add role, tabindex, and aria-selected
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('aria-selected', 'false');
      wrapper.setAttribute('aria-label', `${colorName}の${furName}猫を選択`);

      wrapper.onclick = () => toggleCardSelection(card.id, handId);
      wrapper.style.cursor = 'pointer';

      // Keyboard support: Enter and Space to toggle selection
      wrapper.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCardSelection(card.id, handId);
        }
      };
    } else {
      wrapper.style.cursor = 'default';
    }
  }

  return wrapper;
}

function renderHand(cards, containerId, showCards = true, exchangedCardIds = null) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  cards.forEach((card, index) => {
    // Determine animation type:
    // - null: initial deal, use 'deal' animation for all cards
    // - array: exchange mode, use 'enter' for exchanged cards, 'none' for others
    let animationType;
    if (exchangedCardIds === null) {
      animationType = 'deal';
    } else if (exchangedCardIds.includes(card.id)) {
      animationType = 'enter';
    } else {
      animationType = 'none';
    }
    const cardEl = createCardElement(card, !showCards, containerId, animationType);
    container.appendChild(cardEl);
  });
}

function toggleCardSelection(cardId, handId) {
  if (gameState.exchanged) return;

  const wrapper = document.querySelector(`#${handId} .card-wrapper[data-card-id="${cardId}"]`);
  const index = gameState.selectedCards.indexOf(cardId);

  if (index > -1) {
    gameState.selectedCards.splice(index, 1);
    wrapper.classList.remove('selected');
    wrapper.setAttribute('aria-selected', 'false');
  } else {
    gameState.selectedCards.push(cardId);
    wrapper.classList.add('selected');
    wrapper.setAttribute('aria-selected', 'true');
  }

  updateSelectedCount();
}

function updateSelectedCount() {
  const countId = gameState.mode === 'solo' ? 'solo-selected-count' : 'battle-selected-count';
  const clearBtnId = gameState.mode === 'solo' ? 'solo-clear-selection' : 'battle-clear-selection';

  document.getElementById(countId).textContent = gameState.selectedCards.length;

  // Show/hide clear selection button
  const clearBtn = document.getElementById(clearBtnId);
  if (clearBtn) {
    clearBtn.style.display = gameState.selectedCards.length > 0 ? 'inline-block' : 'none';
  }
}

function clearSelection(mode) {
  const handId = mode === 'solo' ? 'solo-hand' : 'battle-hand';

  // Deselect all cards
  gameState.selectedCards.forEach(cardId => {
    const wrapper = document.querySelector(`#${handId} .card-wrapper[data-card-id="${cardId}"]`);
    if (wrapper) {
      wrapper.classList.remove('selected');
      wrapper.setAttribute('aria-selected', 'false');
    }
  });

  gameState.selectedCards = [];
  updateSelectedCount();
}

// =====================
// Role Calculation
// =====================
function calculateRole(cards) {
  // Collect all possible roles, then return the one with highest points
  const candidates = [];

  // Count colors
  const colorCounts = {};
  cards.forEach(c => {
    colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
  });

  // Count fur types
  const furCounts = { 0: 0, 1: 0 };
  cards.forEach(c => {
    furCounts[c.fur]++;
  });

  const counts = Object.values(colorCounts).sort((a, b) => b - a);

  // Check flush (5 same color)
  for (const color in colorCounts) {
    if (colorCounts[color] === 5) {
      const roleData = roles.flushes[parseInt(color)];
      if (roleData) {
        candidates.push({
          name: roleData.name,
          points: roleData.points,
          matchingCardIds: cards.map(c => c.id)
        });
      }
    }
  }

  // Check fur roles
  if (furCounts[0] === 5) {
    candidates.push({
      name: roles.fur[0].name,
      points: roles.fur[0].points,
      matchingCardIds: cards.map(c => c.id)
    });
  }
  if (furCounts[1] === 5) {
    candidates.push({
      name: roles.fur[1].name,
      points: roles.fur[1].points,
      matchingCardIds: cards.map(c => c.id)
    });
  }

  // Four of a color
  if (counts[0] >= 4) {
    const matchColor = parseInt(Object.keys(colorCounts).find(c => colorCounts[c] >= 4));
    const roleData = roles.fourColor[matchColor];
    if (roleData) {
      candidates.push({
        name: roleData.name,
        points: roleData.points,
        matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id)
      });
    }
  }

  // Full house (3 of one color + 2 of another)
  if (counts[0] === 3 && counts[1] === 2) {
    const threeColor = parseInt(Object.keys(colorCounts).find(c => colorCounts[c] === 3));
    const twoColor = parseInt(Object.keys(colorCounts).find(c => colorCounts[c] === 2));
    const points = roles.fullHousePoints(threeColor, twoColor);
    candidates.push({
      name: `${colorNames[threeColor]}×${colorNames[twoColor]}フルハウス`,
      points: points,
      matchingCardIds: cards.map(c => c.id)
    });
  }

  // Three of a color (only if remaining 2 cards are different colors)
  if (counts[0] === 3 && counts[1] === 1 && counts[2] === 1) {
    const matchColor = parseInt(Object.keys(colorCounts).find(c => colorCounts[c] === 3));
    const roleData = roles.threeColor[matchColor];
    if (roleData) {
      candidates.push({
        name: roleData.name,
        points: roleData.points,
        matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id)
      });
    }
  }

  // Two pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairColors = Object.keys(colorCounts)
      .filter(c => colorCounts[c] === 2)
      .map(c => parseInt(c))
      .sort((a, b) => a - b);
    const points = roles.twoPairPoints(pairColors[0], pairColors[1]);
    candidates.push({
      name: `${colorNames[pairColors[0]]}×${colorNames[pairColors[1]]}ツーペア`,
      points: points,
      matchingCardIds: cards.filter(c => pairColors.includes(c.color)).map(c => c.id)
    });
  }

  // One pair (only if remaining 3 cards are all different colors)
  if (counts[0] === 2 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1) {
    const matchColor = parseInt(Object.keys(colorCounts).find(c => colorCounts[c] === 2));
    const roleData = roles.onePair[matchColor];
    if (roleData) {
      candidates.push({
        name: roleData.name,
        points: roleData.points,
        matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id)
      });
    }
  }

  // No pair (always a fallback)
  candidates.push({
    name: roles.noPair.name,
    points: roles.noPair.points,
    matchingCardIds: []
  });

  // Return the role with the highest points
  candidates.sort((a, b) => b.points - a.points);
  return candidates[0];
}

function showRole(role, displayId, cards = null) {
  const display = document.getElementById(displayId);

  // Support both old (.role-name) and new (.battle-role-name) structures
  const roleNameEl = display.querySelector('.role-name') || display.querySelector('.battle-role-name');
  const rolePointsEl = display.querySelector('.role-points span') || display.querySelector('.battle-role-points span');

  if (roleNameEl) roleNameEl.textContent = role.name;
  if (rolePointsEl) rolePointsEl.textContent = role.points;
  display.classList.add('show');

  // Highlight matching cards
  if (cards) {
    // Map displayId to correct hand container
    let containerId;
    if (displayId === 'dealer-role') {
      containerId = 'dealer-hand';
    } else if (displayId === 'player-role') {
      containerId = 'battle-hand';
    } else {
      containerId = displayId.replace('-role', '-hand');
    }

    const container = document.getElementById(containerId);
    if (container) {
      const matchingIds = role.matchingCardIds || [];
      container.querySelectorAll('.card-wrapper').forEach(wrapper => {
        const cardId = parseInt(wrapper.dataset.cardId);
        if (matchingIds.includes(cardId)) {
          wrapper.classList.add('role-match');
        } else if (matchingIds.length > 0) {
          wrapper.classList.add('role-no-match');
        }
      });
    }
  }
}

function updateBattleRoleBoxes(playerRole, dealerRole) {
  const playerBox = document.getElementById('player-role');
  const dealerBox = document.getElementById('dealer-role');

  // Remove previous states
  playerBox.classList.remove('winner', 'loser');
  dealerBox.classList.remove('winner', 'loser');

  if (playerRole.points > dealerRole.points) {
    playerBox.classList.add('winner');
    dealerBox.classList.add('loser');
  } else if (playerRole.points < dealerRole.points) {
    dealerBox.classList.add('winner');
    playerBox.classList.add('loser');
  }
}

// =====================
// Solo Game
// =====================
function startSoloGame() {
  gameState = {
    mode: 'solo',
    round: 1,
    score: 0,
    hand: [],
    dealerHand: [],
    selectedCards: [],
    exchanged: false,
    history: []
  };

  showScreen('game-screen');
  startSoloRound();
}

function startSoloRound() {
  gameState.hand = drawCards(5);
  gameState.selectedCards = [];
  gameState.exchanged = false;

  document.getElementById('solo-round').textContent = gameState.round;
  document.getElementById('solo-score').textContent = gameState.score;
  document.getElementById('solo-role').classList.remove('show');
  document.getElementById('solo-actions').style.display = 'flex';
  document.getElementById('solo-next-actions').style.display = 'none';

  // Reset loading state on exchange button
  const exchangeBtn = document.querySelector('#solo-actions .btn-primary');
  if (exchangeBtn) {
    exchangeBtn.classList.remove('loading');
    exchangeBtn.disabled = false;
  }

  // Update progress bar
  updateProgressBar('solo', gameState.round, 5);

  renderHand(gameState.hand, 'solo-hand');
  updateSelectedCount();
}

function updateProgressBar(mode, current, total) {
  const progressId = mode === 'solo' ? 'solo-progress' : 'battle-progress';
  const progress = document.getElementById(progressId);
  if (progress) {
    const percentage = (current / total) * 100;
    progress.style.width = `${percentage}%`;
  }
}

function exchangeCards() {
  if (gameState.exchanged) return;

  const containerId = 'solo-hand';
  const selectedCardIds = [...gameState.selectedCards];

  // Add loading state to button
  const exchangeBtn = document.querySelector('#solo-actions .btn-primary');
  if (exchangeBtn) {
    exchangeBtn.classList.add('loading');
    exchangeBtn.disabled = true;
  }

  // Animate exchange - apply to wrapper for smooth animation including card info
  selectedCardIds.forEach(cardId => {
    const wrapper = document.querySelector(`#${containerId} .card-wrapper[data-card-id="${cardId}"]`);
    if (wrapper) {
      wrapper.classList.add('exchanging-out');
    }
  });

  setTimeout(() => {
    // Draw new cards
    const newCards = drawCards(selectedCardIds.length, gameState.hand.map(c => c.id));
    let newCardIndex = 0;

    // Replace selected cards in hand and DOM
    selectedCardIds.forEach((oldCardId, i) => {
      const newCard = newCards[newCardIndex++];
      const wrapper = document.querySelector(`#${containerId} .card-wrapper[data-card-id="${oldCardId}"]`);

      if (wrapper) {
        // Update game state
        const handIndex = gameState.hand.findIndex(c => c.id === oldCardId);
        if (handIndex !== -1) {
          gameState.hand[handIndex] = newCard;
        }

        // Replace wrapper content with new card
        replaceCardInWrapper(wrapper, newCard, containerId, i);
      }
    });

    gameState.exchanged = true;
    gameState.selectedCards = [];
    updateSelectedCount();

    // Finish round after enter animation completes
    setTimeout(() => {
      finishSoloRound();
    }, 550);
  }, 420);
}

function replaceCardInWrapper(wrapper, newCard, handId, delayIndex = 0) {
  // Update wrapper data
  wrapper.dataset.cardId = newCard.id;
  wrapper.classList.remove('exchanging-out', 'selected');

  // Clear wrapper
  wrapper.innerHTML = '';

  // Create new card element
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  const colorName = colorNames[newCard.color];
  const furName = furNames[newCard.fur];
  cardDiv.innerHTML = `<img src="${newCard.image}" alt="${colorName}の${furName}猫">`;
  wrapper.appendChild(cardDiv);

  // Create card info
  const infoDiv = document.createElement('div');
  infoDiv.className = 'card-info';
  infoDiv.innerHTML = `
    <span class="card-color">${colorNames[newCard.color]}</span>
    <span class="card-fur">${furNames[newCard.fur]}</span>
  `;
  wrapper.appendChild(infoDiv);

  // Re-attach click handler
  if (handId !== 'dealer-hand') {
    wrapper.onclick = () => toggleCardSelection(newCard.id, handId);
    wrapper.style.cursor = 'pointer';
  }

  // Trigger enter animation with staggered delay
  wrapper.style.opacity = '0';
  wrapper.style.transform = 'translateY(-80px)';

  requestAnimationFrame(() => {
    setTimeout(() => {
      wrapper.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out';
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';

      // Clean up inline styles after animation
      setTimeout(() => {
        wrapper.style.transition = '';
        wrapper.style.opacity = '';
        wrapper.style.transform = '';
      }, 550);
    }, delayIndex * 80);
  });
}

function skipExchange() {
  gameState.exchanged = true;
  finishSoloRound();
}

function finishSoloRound() {
  const role = calculateRole(gameState.hand);
  gameState.score += role.points;

  gameState.history.push({
    round: gameState.round,
    role: role.name,
    points: role.points
  });

  document.getElementById('solo-score').textContent = gameState.score;
  document.getElementById('solo-actions').style.display = 'none';
  document.getElementById('solo-next-actions').style.display = 'flex';

  showRole(role, 'solo-role', gameState.hand);
}

function nextRound() {
  if (gameState.round >= 5) {
    showResults();
  } else {
    gameState.round++;
    startSoloRound();
  }
}

// =====================
// Battle Game
// =====================
function startBattleGame() {
  gameState = {
    mode: 'battle',
    round: 1,
    score: 0,
    hand: [],
    dealerHand: [],
    selectedCards: [],
    exchanged: false,
    history: []
  };

  showScreen('battle-screen');
  startBattleRound();
}

function startBattleRound() {
  const usedCards = [];
  gameState.hand = drawCards(5, usedCards);
  usedCards.push(...gameState.hand.map(c => c.id));
  gameState.dealerHand = drawCards(5, usedCards);
  gameState.selectedCards = [];
  gameState.exchanged = false;

  document.getElementById('battle-round').textContent = gameState.round;
  document.getElementById('battle-score').textContent = gameState.score;

  // Update progress bar
  updateProgressBar('battle', gameState.round, 5);

  // Reset role displays
  const playerRoleBox = document.getElementById('player-role');
  const dealerRoleBox = document.getElementById('dealer-role');
  playerRoleBox.classList.remove('show', 'winner', 'loser');
  dealerRoleBox.classList.remove('show', 'winner', 'loser');
  playerRoleBox.querySelector('.battle-role-name').textContent = '';
  dealerRoleBox.querySelector('.battle-role-name').textContent = '';
  document.getElementById('battle-actions').style.display = 'flex';
  document.getElementById('battle-next-actions').style.display = 'none';

  // Reset loading state on exchange button
  const exchangeBtn = document.querySelector('#battle-actions .btn-primary');
  if (exchangeBtn) {
    exchangeBtn.classList.remove('loading');
    exchangeBtn.disabled = false;
  }

  renderHand(gameState.hand, 'battle-hand');
  renderHand(gameState.dealerHand, 'dealer-hand', true); // Show cards
  updateSelectedCount();
}

function battleExchangeCards() {
  if (gameState.exchanged) return;

  const containerId = 'battle-hand';
  const selectedCardIds = [...gameState.selectedCards];

  // Add loading state to button
  const exchangeBtn = document.querySelector('#battle-actions .btn-primary');
  if (exchangeBtn) {
    exchangeBtn.classList.add('loading');
    exchangeBtn.disabled = true;
  }

  // Animate exchange - apply to wrapper for smooth animation including card info
  selectedCardIds.forEach(cardId => {
    const wrapper = document.querySelector(`#${containerId} .card-wrapper[data-card-id="${cardId}"]`);
    if (wrapper) {
      wrapper.classList.add('exchanging-out');
    }
  });

  setTimeout(() => {
    // Draw new cards (exclude both player and dealer cards)
    const usedIds = [...gameState.hand.map(c => c.id), ...gameState.dealerHand.map(c => c.id)];
    const newCards = drawCards(selectedCardIds.length, usedIds);
    let newCardIndex = 0;

    // Replace selected cards in hand and DOM
    selectedCardIds.forEach((oldCardId, i) => {
      const newCard = newCards[newCardIndex++];
      const wrapper = document.querySelector(`#${containerId} .card-wrapper[data-card-id="${oldCardId}"]`);

      if (wrapper) {
        // Update game state
        const handIndex = gameState.hand.findIndex(c => c.id === oldCardId);
        if (handIndex !== -1) {
          gameState.hand[handIndex] = newCard;
        }

        // Replace wrapper content with new card
        replaceCardInWrapper(wrapper, newCard, containerId, i);
      }
    });

    gameState.exchanged = true;
    gameState.selectedCards = [];
    updateSelectedCount();

    // Dealer exchange after player animation completes
    setTimeout(() => {
      dealerExchange();
    }, 550);
  }, 420);
}

function battleSkipExchange() {
  gameState.exchanged = true;
  dealerExchange();
}

function dealerExchange() {
  // Simple AI: random exchange (in real app, use proper AI logic)
  const usedIds = [...gameState.hand.map(c => c.id), ...gameState.dealerHand.map(c => c.id)];
  const exchangeCount = Math.floor(Math.random() * 3);
  let newCardIds = [];

  if (exchangeCount > 0) {
    // Replace cards at their original positions (first N cards)
    const newCards = drawCards(exchangeCount, usedIds);
    newCardIds = newCards.map(c => c.id);
    gameState.dealerHand = gameState.dealerHand.map((card, index) => {
      if (index < exchangeCount) {
        return newCards[index];
      }
      return card;
    });
  }

  // Reveal dealer cards - only animate newly drawn cards
  setTimeout(() => {
    renderHand(gameState.dealerHand, 'dealer-hand', true, newCardIds.length > 0 ? newCardIds : []);
    finishBattleRound();
  }, 500);
}

function finishBattleRound() {
  const playerRole = calculateRole(gameState.hand);
  const dealerRole = calculateRole(gameState.dealerHand);

  document.getElementById('battle-actions').style.display = 'none';

  showRole(playerRole, 'player-role', gameState.hand);
  showRole(dealerRole, 'dealer-role', gameState.dealerHand);
  updateBattleRoleBoxes(playerRole, dealerRole);

  setTimeout(() => {
    let result, points;

    if (playerRole.points > dealerRole.points) {
      result = 'win';
      points = playerRole.points;
    } else if (playerRole.points < dealerRole.points) {
      result = 'lose';
      points = -dealerRole.points;
    } else {
      result = 'draw';
      points = 0;
    }

    gameState.score += points;
    gameState.history.push({
      round: gameState.round,
      role: playerRole.name,
      points: points,
      dealerRole: dealerRole.name
    });

    // Show winner's role name
    const winnerRoleName = result === 'lose' ? dealerRole.name : playerRole.name;

    document.getElementById('battle-score').textContent = gameState.score;
    showBattleResult(result, points, winnerRoleName);
  }, 1000);
}

function showBattleResult(result, points, roleName) {
  const resultEl = document.getElementById('battle-result');
  const textEl = document.getElementById('battle-result-text');
  const roleEl = document.getElementById('battle-result-role');
  const pointsEl = document.getElementById('battle-result-points');

  textEl.className = 'result-text ' + result;
  roleEl.textContent = roleName;

  if (result === 'win') {
    textEl.textContent = '勝利！';
    pointsEl.textContent = `+${points} ポイント`;
    showConfetti();
  } else if (result === 'lose') {
    textEl.textContent = '敗北...';
    pointsEl.textContent = `${points} ポイント`;
  } else {
    textEl.textContent = '引き分け';
    pointsEl.textContent = '±0 ポイント';
  }

  resultEl.classList.add('show');
}

function showConfetti() {
  // Canvas-based confetti for better performance
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#d4a574', '#e8c9a0', '#c17f59', '#7eb87e', '#f5f0e8'];
  const particles = [];

  // Create particles
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.floor(Math.random() * 3), // 0: square, 1: circle, 2: diamond
      isPaw: Math.random() < 0.2
    });
  }

  let animationId;
  let startTime = Date.now();
  const duration = 5000;

  function animate() {
    const elapsed = Date.now() - startTime;

    if (elapsed >= duration) {
      cancelAnimationFrame(animationId);
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);

      if (p.isPaw) {
        // Draw paw print emoji
        ctx.font = `${p.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐾', 0, 0);
      } else {
        ctx.fillStyle = p.color;

        switch (p.shape) {
          case 0: // Square
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
          case 1: // Circle
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 2: // Diamond
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, 0);
            ctx.lineTo(0, p.size / 2);
            ctx.lineTo(-p.size / 2, 0);
            ctx.closePath();
            ctx.fill();
            break;
        }
      }

      ctx.restore();

      // Update position
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      // Reset if off screen
      if (p.y > canvas.height) {
        p.y = -p.size;
        p.x = Math.random() * canvas.width;
      }
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Handle window resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  // Cleanup after animation ends
  setTimeout(() => {
    window.removeEventListener('resize', handleResize);
  }, duration);
}

function closeBattleResult() {
  document.getElementById('battle-result').classList.remove('show');
  document.getElementById('battle-next-actions').style.display = 'flex';
}

function battleNextRound() {
  if (gameState.round >= 5) {
    showResults();
  } else {
    gameState.round++;
    startBattleRound();
  }
}

// =====================
// Results
// =====================
function showResults() {
  showScreen('result-screen');

  document.getElementById('final-score').textContent = gameState.score;

  const historyList = document.getElementById('round-history-list');
  historyList.innerHTML = '';

  gameState.history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'round-item';

    const pointsClass = item.points > 0 ? 'positive' : item.points < 0 ? 'negative' : '';
    const pointsText = item.points > 0 ? `+${item.points}` : item.points;

    div.innerHTML = `
      <div>
        <span class="round-item-name">ラウンド ${item.round}</span>
        <span class="round-item-role">${item.role}</span>
      </div>
      <span class="round-item-points ${pointsClass}">${pointsText}</span>
    `;

    historyList.appendChild(div);
  });
}

function playAgain() {
  if (gameState.mode === 'solo') {
    startSoloGame();
  } else {
    startBattleGame();
  }
}

// =====================
// Modals
// =====================
let previouslyFocusedElement = null;

function showRulesModal() {
  openModal('rules-modal');
}

function showSettingsModal() {
  openModal('settings-modal');
}

function showStatsModal() {
  openModal('stats-modal');
}

function openModal(modalId) {
  // Store the currently focused element to restore later
  previouslyFocusedElement = document.activeElement;

  const overlay = document.getElementById(modalId);
  overlay.classList.add('show');

  // Set up focus trap and move focus to modal
  const modal = overlay.querySelector('.modal');
  setupFocusTrap(modal);

  // Focus the first focusable element in the modal
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 50);
  }
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  overlay.classList.remove('show');

  // Restore focus to the previously focused element
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

function closeAnyOpenModal() {
  const openModal = document.querySelector('.modal-overlay.show');
  if (openModal) {
    openModal.classList.remove('show');
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
    return true;
  }
  return false;
}

function setupFocusTrap(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', function trapFocus(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

function toggleSetting(element) {
  const isActive = element.classList.toggle('active');
  element.setAttribute('aria-checked', isActive ? 'true' : 'false');
}

function resetStats() {
  if (confirm('戦績をリセットしますか？')) {
    alert('戦績をリセットしました');
  }
}

// =====================
// Event Listeners
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAnyOpenModal();
      }
    });
  });

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAnyOpenModal();
    }
  });

  // Keyboard support for toggle switches
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSetting(toggle);
      }
    });
  });

  // Update volume slider aria-valuenow on change
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      e.target.setAttribute('aria-valuenow', e.target.value);
    });
  }
});
