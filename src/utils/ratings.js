// Maturity ranking for Kids-profile filtering
export const AGE_RANK = { 'TV-Y': 0, 'TV-PG': 1, 'PG-13': 2, 'TV-14': 3, R: 4, 'TV-MA': 5 }

// Kids profile sees TV-PG / PG-13 and below
export const kidsAllowed = (show) => (AGE_RANK[show.age] ?? 3) <= 2
