// Serveur Node.js pour VPS : exécute la même application que Cloudflare,
// avec une base SQLite locale (node:sqlite) à la place de D1.
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, extname, resolve, normalize } from "node:path";
import { DatabaseSync } from "node:sqlite";
import app from "../src/index";
import type { AppEnv } from "../src/config";

const ROOT = resolve(process.env.APP_DIR || process.cwd());
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = join(ROOT, "data");
mkdirSync(DATA_DIR, { recursive: true });

// ---------- Base de données + adaptateur compatible D1 ----------
const sqlite = new DatabaseSync(join(DATA_DIR, "boutique.sqlite"));
sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");

function applyMigrations() {
	sqlite.exec("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT DEFAULT (datetime('now')))");
	const dir = join(ROOT, "migrations");
	const done = new Set((sqlite.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name));
	for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
		if (done.has(file)) continue;
		sqlite.exec(readFileSync(join(dir, file), "utf8"));
		sqlite.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
		console.log(`Migration appliquée : ${file}`);
	}
}
applyMigrations();

type Val = string | number | null;
class Stmt {
	constructor(private sql: string, private params: Val[] = []) {}
	bind(...params: unknown[]) {
		return new Stmt(this.sql, params.map((p) => (p === undefined ? null : (p as Val))));
	}
	async first<T>() {
		return ((sqlite.prepare(this.sql).get(...this.params) as T) ?? null) as T | null;
	}
	async all<T>() {
		return { results: sqlite.prepare(this.sql).all(...this.params) as T[], success: true };
	}
	async run() {
		const r = sqlite.prepare(this.sql).run(...this.params);
		return { success: true, meta: { changes: Number(r.changes) } };
	}
}
const DB = { prepare: (sql: string) => new Stmt(sql) } as unknown as D1Database;

// ---------- Configuration (fichier .env chargé par systemd / node --env-file) ----------
const e = process.env;
const env: AppEnv = {
	DB,
	SITE_NAME: e.SITE_NAME || "Carrière Humanitaire au Niger",
	SITE_URL: (e.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, ""),
	LOGO_URL: e.LOGO_URL ?? "/logo.png",
	CURRENCY: e.CURRENCY || "XOF",
	COUNTRY_CODE: e.COUNTRY_CODE || "NE",
	WHATSAPP_CHANNEL_URL: e.WHATSAPP_CHANNEL_URL,
	FACEBOOK_URL: e.FACEBOOK_URL,
	LINKEDIN_URL: e.LINKEDIN_URL,
	SUPPORT_WHATSAPP: e.SUPPORT_WHATSAPP,
	META_PIXEL_ID: e.META_PIXEL_ID,
	PAYMENT_METHODS: e.PAYMENT_METHODS || "Mobile Money ou carte bancaire",
	MONTHLY_TARGET: e.MONTHLY_TARGET || "1000000",
	MANUAL_PAYMENT_ACCOUNTS: e.MANUAL_PAYMENT_ACCOUNTS,
	MANUAL_PAYMENT_HOLDER: e.MANUAL_PAYMENT_HOLDER,
	CINETPAY_API_KEY: e.CINETPAY_API_KEY || undefined,
	CINETPAY_SITE_ID: e.CINETPAY_SITE_ID || undefined,
	ADMIN_PASSWORD: e.ADMIN_PASSWORD || undefined,
};

// ---------- Fichiers statiques (logo, image de partage) ----------
const PUBLIC = join(ROOT, "public");
const MIME: Record<string, string> = {
	".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
	".ico": "image/x-icon", ".webp": "image/webp", ".css": "text/css", ".js": "text/javascript", ".txt": "text/plain",
};
function staticFile(pathname: string): { body: Buffer; type: string } | null {
	const file = normalize(join(PUBLIC, decodeURIComponent(pathname)));
	if (!file.startsWith(PUBLIC) || !existsSync(file) || !statSync(file).isFile()) return null;
	return { body: readFileSync(file), type: MIME[extname(file).toLowerCase()] || "application/octet-stream" };
}

// ---------- Serveur HTTP ----------
createServer(async (req, res) => {
	try {
		const url = new URL(req.url || "/", env.SITE_URL);
		if (req.method === "GET" && url.pathname !== "/") {
			const f = staticFile(url.pathname);
			if (f) {
				res.writeHead(200, { "content-type": f.type, "cache-control": "public, max-age=86400" });
				return res.end(f.body);
			}
		}
		const chunks: Buffer[] = [];
		for await (const c of req) chunks.push(c as Buffer);
		const headers = new Headers();
		for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
		const request = new Request(url, {
			method: req.method,
			headers,
			body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
		});
		const response = await app.fetch!(request as never, env, {} as never);
		const out: Record<string, string> = {};
		response.headers.forEach((v, k) => (out[k] = v));
		res.writeHead(response.status, out);
		res.end(Buffer.from(await response.arrayBuffer()));
	} catch (err) {
		console.error(err);
		res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
		res.end("Erreur interne");
	}
}).listen(PORT, "127.0.0.1", () => console.log(`${env.SITE_NAME} en ligne sur le port ${PORT} (${env.SITE_URL})`));

// ---------- Tâche planifiée : vérification des paiements en attente toutes les 30 min ----------
setInterval(() => {
	app.scheduled!({} as never, env, {} as never)?.catch?.((err: unknown) => console.error(err));
}, 30 * 60 * 1000);
