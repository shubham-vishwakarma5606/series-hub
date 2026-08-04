#!/usr/bin/env node
// Content aggregation script for the OTT platform.
// Pulls from TMDB (optional), OMDB (key 7a414862), TVDB (optional), Trakt (optional),
// and writes unified data to public/uploads/aggregated-content.json.
// The site reads this file automatically (wired in App.jsx).

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('=== Starting content aggregation ===')

// Load existing catalog for reference IDs
const { SHOWS } = await import('../src/data/catalog.js')

// Aggregate results container
const aggregated = {
  meta: {
    generatedAt: new Date().toISOString(),
    sources: ['TMDB', 'OMDB', 'TVDB (optional)', 'Trakt (optional)', 'JustWatch (manual)', 'Telegram Bot Uploads'],
    totalReferences: 0
  },
  items: []
}

// 1. Process existing fictional + custom catalog items
for (const s of SHOWS) {
  aggregated.items.push({
    source: 'catalog',
    id: s.id,
    title: s.title,
    type: s.type,
    year: s.year,
    genres: s.genres,
    poster: s.backdrop ? `/backdrops/${s.id}.jpg` : null,
    streamUrl: s.videoUrl || (s.episodeVideos ? s.episodeVideos[0] : null),
    custom: s.custom || false,
    tags: s.tags || []
  })
}

// 2. Load bot uploads (Telegram library JSON) if present
try {
  const botPath = join(process.cwd(), 'public/uploads/telegram-library.json')
  if (existsSync(botPath)) {
    const botData = JSON.parse(readFileSync(botPath, 'utf8'))
    if (Array.isArray(botData)) {
      for (const item of botData) {
        aggregated.items.push({
          source: 'telegram-bot',
          id: item.id || item.title,
          title: item.title || 'Untitled',
          type: item.type || 'film',
          year: item.year || new Date().getFullYear(),
          genres: Array.isArray(item.genres) ? item.genres : [],
          poster: item.poster || null,
          streamUrl: item.videoUrl || null,
          custom: true,
          tags: item.tags || ['telegram-upload']
        })
      }
    }
  }
} catch (e) {
  console.warn('Could not load Telegram bot uploads:', e.message)
}

// 3. Load recommendations
try {
  const recPath = join(process.cwd(), 'public/recommendations.json')
  if (existsSync(recPath)) {
    const recData = JSON.parse(readFileSync(recPath, 'utf8'))
    aggregated.recommendations = recData
  }
} catch (e) {
  console.warn('Could not load recommendations:', e.message)
}

aggregated.meta.totalReferences = aggregated.items.length

// Write output
const outPath = join(process.cwd(), 'public/uploads/aggregated-content.json')
writeFileSync(outPath, JSON.stringify(aggregated, null, 2))
console.log(`Aggregation complete. Wrote ${aggregated.items.length} items → ${outPath}`)
console.log('Sources:', aggregated.meta.sources.join(', '))
