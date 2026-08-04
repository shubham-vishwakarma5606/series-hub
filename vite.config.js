import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production CSP — injected only into the built HTML (dev server stays
// unrestricted so HMR keeps working). Streaming/media rules allow https
// video + MSE blobs + HLS workers; iframes limited to youtube-nocookie.
// NOTE: frame-ancestors intentionally omitted so the app can be embedded
// in sandbox previews (e2b, arena) and still work when deployed; security
// is kept via X-Frame-Options via hosting config if needed.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "media-src 'self' https: blob: data:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "connect-src 'self' https: wss: ws:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  'upgrade-insecure-requests'
].join('; ')

const injectCsp = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml (html) {
    return html.replace(
      '<meta name="theme-color"',
      `<meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="theme-color"`
    )
  }
}

export default defineConfig({
  plugins: [react(), injectCsp],
  // sub-path deploys (GitHub Pages) set VITE_BASE — e.g. VITE_BASE=/series-hub/
  base: process.env.VITE_BASE || '/',
  server: { host: true, port: 5173, allowedHosts: true },
  // preview runs behind a sandbox/proxy host — accept it (CSP still applies)
  preview: { host: true, port: 4173, allowedHosts: true }
})
