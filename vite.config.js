import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production CSP — injected only into the built HTML (dev server stays
// unrestricted so HMR keeps working). Streaming/media rules allow https
// video + MSE blobs + HLS workers; iframes limited to youtube-nocookie.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "media-src 'self' https: blob: data:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "connect-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
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
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 }
})
