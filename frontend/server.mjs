import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 19821
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:19820'
const backendTarget = new URL(BACKEND_URL)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = http.createServer((req, res) => {
  const reqUrl = req.url || '/'

  // 1. Proxy para backend (/api/, /admin/, /media/)
  if (reqUrl.startsWith('/api/') || reqUrl.startsWith('/admin/') || reqUrl.startsWith('/media/')) {
    const options = {
      hostname: backendTarget.hostname,
      port: backendTarget.port || (backendTarget.protocol === 'https:' ? 443 : 80),
      path: reqUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: backendTarget.host,
      },
    }

    const proxyReq = http.request(options, (backendRes) => {
      res.writeHead(backendRes.statusCode || 500, backendRes.headers)
      backendRes.pipe(res)
    })

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] ${req.method} ${reqUrl} -> ${err.message}`)
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Backend unreachable', details: err.message }))
    })

    req.pipe(proxyReq)
    return
  }

  // 2. Servir archivos estáticos del frontend (dist)
  const cleanUrl = reqUrl.split('?')[0]
  let filePath = path.join(DIST_DIR, cleanUrl)

  // Prevenir path traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // Si es un directorio o no existe, SPA fallback a index.html
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html')
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404)
        res.end('Not Found')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server listening on http://0.0.0.0:${PORT}`)
  console.log(`Proxying /api, /admin, /media to ${BACKEND_URL}`)
})
