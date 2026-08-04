import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load module directly (no regex needed for automated process)
const { SHOWS, byId, ROWS } = await import('../src/data/catalog.js');

// Compute recommendations for each show
const recommendations = {};
for (const s of SHOWS) {
  if (s.custom) continue; // skip user uploads for base recommendations
  const similar = SHOWS
    .filter((o) => o.id !== s.id && o.type === s.type)
    .map((o) => {
      const sharedGenres = s.genres.filter((g) => o.genres.includes(g)).length;
      return { id: o.id, score: sharedGenres + (o.match || 0) / 100 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.id);
  recommendations[s.id] = similar;
}

// Write recommendations file
const outPath = join(__dirname, '../public/recommendations.json');
writeFileSync(outPath, JSON.stringify(recommendations, null, 2));
console.log('Auto-recommendations generated for', Object.keys(recommendations).length, 'titles →', outPath);
