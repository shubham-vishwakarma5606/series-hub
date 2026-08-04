// JustWatch streaming availability — no official public API available.
// JustWatch operates via region-locked web endpoints with anti-scraping measures.
// This module provides a best-effort scraping template using the search endpoint.
// IMPORTANT: Scraping may violate JustWatch Terms of Service. Use only for
// licensed/research purposes and respect rate limits.

export async function fetchJustWatch (title, region = 'US') {
  // JustWatch does not expose a documented REST API.
  // The common workaround is to query the public search endpoint and parse HTML/JSON responses.
  // For automation, the recommended legal approach is to use JustWatch's partner/affiliate APIs if available,
  // or rely on manual region checks.
  console.log(`[JustWatch] Availability check for "${title}" in region ${region} requires manual verification or partner access.`)
  return {
    title,
    region,
    platforms: [], // Populate manually or via partner feed
    links: {},
    note: 'JustWatch has no public REST API. This is a placeholder. Use JustWatch web UI for region/platform links.'
  }
}
