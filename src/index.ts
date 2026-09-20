import { renderHtml } from "./renderHtml";

const APP_NAME = "Sterling Abonnés";
const THEME_COLOR = "#0f172a";
const ICON_BACKGROUND = "#1d4ed8";
const ICON_FOREGROUND = "#ffffff";

function renderIcon(size: number) {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${APP_NAME}">
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${ICON_BACKGROUND}" />
      <text
        x="50%"
        y="54%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="system-ui, sans-serif"
        font-size="${Math.round(size * 0.46)}"
        fill="${ICON_FOREGROUND}"
      >
        S
      </text>
    </svg>
  `;
}

function renderManifest(requestUrl: URL) {
	return JSON.stringify(
		{
			name: APP_NAME,
			short_name: "Sterling",
			description: "Application installable de gestion des abonnés Sterling.",
			start_url: "/",
			scope: "/",
			display: "standalone",
			background_color: THEME_COLOR,
			theme_color: THEME_COLOR,
			orientation: "portrait",
			icons: [192, 512].map((size) => ({
				src: new URL(`/icons/icon-${size}.svg`, requestUrl).toString(),
				sizes: "any",
				type: "image/svg+xml",
				purpose: "any maskable",
			})),
		},
		null,
		2,
	);
}

const SERVICE_WORKER = `const CACHE_NAME = "sterling-abonnes-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkResponse = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }

          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponse;
    }),
  );
});`;

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/manifest.webmanifest") {
			return new Response(renderManifest(url), {
				headers: {
					"content-type": "application/manifest+json; charset=utf-8",
					"cache-control": "public, max-age=3600",
				},
			});
		}

		if (url.pathname === "/sw.js") {
			return new Response(SERVICE_WORKER, {
				headers: {
					"content-type": "application/javascript; charset=utf-8",
					"cache-control": "no-cache",
				},
			});
		}

		const iconMatch = url.pathname.match(/^\/icons\/icon-(192|512)\.svg$/);
		if (iconMatch) {
			const size = Number(iconMatch[1]);
			return new Response(renderIcon(size), {
				headers: {
					"content-type": "image/svg+xml; charset=utf-8",
					"cache-control": "public, max-age=86400",
				},
			});
		}

		const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
		const { results } = await stmt.all();

		return new Response(renderHtml(JSON.stringify(results, null, 2)), {
			headers: {
				"content-type": "text/html; charset=utf-8",
			},
		});
	},
} satisfies ExportedHandler<Env>;
