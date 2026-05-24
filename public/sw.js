const CACHE = 'budgbot-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  // Only handle same-origin; skip auth and API routes
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/sign-')) return

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|svg|png|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((hit) =>
        hit ?? fetch(event.request).then((res) => {
          if (res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(event.request, clone))
          }
          return res
        })
      )
    )
    return
  }

  // Navigation: network-first so auth and server state always fresh
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((hit) =>
          hit ?? new Response('<h1>Offline</h1><p>Check your connection and try again.</p>', {
            headers: { 'Content-Type': 'text/html' },
          })
        )
      )
    )
  }
})
