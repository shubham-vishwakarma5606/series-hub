// Base-aware reference to a file in public/.
// Works on root deployments (https://serieshub.example/…) and on sub-path
// ones (GitHub Pages → https://<user>.github.io/series-hub/…).
// import.meta.env only exists under Vite — fall back to '/' for plain Node
// (scripts/validate-data.mjs imports the catalogue outside a bundler).
const BASE = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')

export const pub = (p = '') => `${BASE}${p.startsWith('/') ? p : `/${p}`}`
export default pub
