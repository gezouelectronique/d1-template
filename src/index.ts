import { type AppEnv, getProduct, manualAccounts, whatsappNumber } from "./config";
import {
	type ManualOrder,
	accessMessage,
	adminPage,
	documentPage,
	freeGuidePage,
	homePage,
	manualOrderPage,
	productPage,
	termsPage,
	thankYouPage,
} from "./pages";
import { escapeHtml } from "./markdown";
import { checkPayment, initPayment, paymentsConfigured } from "./payments";

const html = (body: string, status = 200) =>
	new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
const redirect = (to: string) => new Response(null, { status: 303, headers: { location: to } });

const ACCESS_DAYS = 365;
const MAX_ACCESS = 200;
const MANUAL_EXPIRY_DAYS = 7; // une commande manuelle non validée expire après 7 jours

function randomHex(bytes: number): string {
	const a = new Uint8Array(bytes);
	crypto.getRandomValues(a);
	return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(v: unknown, max: number): string {
	return String(v ?? "").trim().slice(0, max);
}

function normalizePhone(v: string): string {
	return v.replace(/[^\d+]/g, "");
}

function sourceOf(url: URL): string {
	return (url.searchParams.get("src") || url.searchParams.get("utm_source") || "").slice(0, 40);
}

/** Vérifie auprès de CinetPay et marque la commande payée si le montant correspond. Idempotent. */
async function syncOrder(env: AppEnv, orderId: string): Promise<void> {
	const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<{
		status: string;
		amount: number;
		currency: string;
		provider: string;
	}>();
	if (!order || order.status === "paid" || order.provider !== "cinetpay" || !paymentsConfigured(env)) return;
	const result = await checkPayment(env, orderId);
	if (result.status === "ACCEPTED" && result.amount === order.amount && result.currency === order.currency) {
		await env.DB.prepare(
			"UPDATE orders SET status='paid', paid_at=datetime('now'), download_token=? WHERE id=? AND status!='paid'",
		)
			.bind(randomHex(24), orderId)
			.run();
	} else if (result.status === "REFUSED") {
		await env.DB.prepare("UPDATE orders SET status='failed' WHERE id=? AND status='pending'").bind(orderId).run();
	}
}

function checkAdmin(request: Request, env: AppEnv): Response | null {
	const expected = env.ADMIN_PASSWORD;
	const auth = request.headers.get("authorization") || "";
	const ok = expected && auth.startsWith("Basic ") && atob(auth.slice(6)).split(":").slice(1).join(":") === expected;
	if (ok) return null;
	return new Response("Accès réservé", { status: 401, headers: { "www-authenticate": 'Basic realm="admin"' } });
}

/** Refuse les formulaires admin envoyés depuis un autre site (protection CSRF). */
function sameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	return !origin || origin === new URL(request.url).origin;
}

const MANUAL_ORDER_SQL =
	"SELECT id, status, product_slug, amount, customer_phone, payment_method, payment_reference, download_token FROM orders WHERE id = ? AND provider = 'manual'";

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname.replace(/\/+$/, "") || "/";
		const method = request.method;

		// --- Pages publiques ---
		if (path === "/" && method === "GET") return html(homePage(env, sourceOf(url)));
		if (path === "/conditions") return html(termsPage(env));
		if (path === "/guide-gratuit" && method === "GET") return html(freeGuidePage(env));

		if (path.startsWith("/produit/") && method === "GET") {
			const p = getProduct(path.slice("/produit/".length));
			return p ? html(productPage(env, p, sourceOf(url))) : html("Produit introuvable", 404);
		}

		// --- Capture de prospects (guide gratuit) ---
		if (path === "/api/guide-gratuit" && method === "POST") {
			const f = await request.formData();
			const name = clean(f.get("name"), 80);
			const phone = normalizePhone(clean(f.get("phone"), 20));
			if (name && phone.length >= 8) {
				await env.DB.prepare(
					"INSERT INTO leads (name, phone, email, source) VALUES (?, ?, ?, ?) ON CONFLICT(phone) DO NOTHING",
				)
					.bind(name, phone, clean(f.get("email"), 120) || null, clean(f.get("source"), 40) || null)
					.run();
			}
			return redirect("/guide-gratuit");
		}

		// --- Commande -> redirection vers CinetPay ---
		if (path === "/api/commande" && method === "POST") {
			const f = await request.formData();
			const product = getProduct(clean(f.get("slug"), 40));
			if (!product) return html("Produit introuvable", 404);
			const src = clean(f.get("source"), 40);
			const name = clean(f.get("name"), 80);
			const phone = normalizePhone(clean(f.get("phone"), 20));
			const email = clean(f.get("email"), 120) || null;
			if (!name || phone.length < 8) {
				return html(productPage(env, product, src, "Merci d'indiquer votre nom et un numéro valide."), 400);
			}
			const method = clean(f.get("method"), 60) || "online";
			const manual = method.startsWith("manual:") ? manualAccounts(env).find((a) => `manual:${a.method}` === method) : undefined;
			if (method.startsWith("manual:") && !manual) {
				return html(productPage(env, product, src, "Choisissez un moyen de paiement."), 400);
			}
			if (!manual && !paymentsConfigured(env)) {
				return html(
					productPage(env, product, src, "Le paiement en ligne n'est pas encore activé. Contactez-nous sur WhatsApp."),
					503,
				);
			}
			const id = `CH${Date.now()}${randomHex(5)}`.toUpperCase();
			await env.DB.prepare(
				"INSERT INTO orders (id, product_slug, amount, currency, customer_name, customer_phone, customer_email, source, provider, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			)
				.bind(id, product.slug, product.price, env.CURRENCY, name, phone, email, src || null, manual ? "manual" : "cinetpay", manual?.method ?? null)
				.run();
			if (manual) return redirect(`/commande/${id}`);
			try {
				const paymentUrl = await initPayment(env, {
					transactionId: id,
					amount: product.price,
					description: product.title,
					customerName: name,
					customerPhone: phone,
					customerEmail: email,
				});
				return redirect(paymentUrl);
			} catch (e) {
				console.error(e);
				return html(productPage(env, product, src, "Le service de paiement est indisponible. Réessayez dans un instant."), 502);
			}
		}

		// --- Paiement manuel : instructions + saisie de la référence ---
		if (path.startsWith("/commande/")) {
			const id = path.slice("/commande/".length).slice(0, 64);
			const order = await env.DB.prepare(MANUAL_ORDER_SQL).bind(id).first<ManualOrder>();
			if (!order) return html("Commande introuvable", 404);
			const account = manualAccounts(env).find((a) => a.method === order.payment_method);
			if (method === "POST") {
				const reference = clean((await request.formData()).get("reference"), 60).replace(/\s+/g, " ");
				if (order.status !== "pending" || order.payment_reference) return redirect(`/commande/${id}`);
				if (reference.length < 4) {
					return html(manualOrderPage(env, order, account, "Merci de saisir la référence complète reçue par SMS."), 400);
				}
				const used = await env.DB.prepare("SELECT 1 v FROM orders WHERE payment_method = ? AND payment_reference = ? AND id != ?")
					.bind(order.payment_method, reference, id)
					.first();
				if (used) {
					return html(manualOrderPage(env, order, account, "Cette référence a déjà été utilisée pour une autre commande."), 400);
				}
				try {
					await env.DB.prepare(
						"UPDATE orders SET payment_reference = ?, reference_at = datetime('now') WHERE id = ? AND payment_reference IS NULL",
					)
						.bind(reference, id)
						.run();
				} catch {
					return html(manualOrderPage(env, order, account, "Cette référence a déjà été utilisée pour une autre commande."), 400);
				}
				return redirect(`/commande/${id}`);
			}
			return html(manualOrderPage(env, order, account));
		}

		// --- Notification serveur-à-serveur de CinetPay ---
		if (path === "/api/paiement/notification") {
			if (method === "POST") {
				const f = await request.formData();
				const id = clean(f.get("cpm_trans_id"), 64);
				if (id) await syncOrder(env, id);
			}
			return new Response("OK"); // CinetPay vérifie aussi l'URL en GET
		}

		// --- Retour client après paiement ---
		if (path === "/merci") {
			const id = (url.searchParams.get("commande") || "").slice(0, 64);
			if (id) await syncOrder(env, id);
			const order = id
				? await env.DB.prepare("SELECT id, status, download_token, product_slug FROM orders WHERE id = ?")
						.bind(id)
						.first<{ id: string; status: string; download_token: string | null; product_slug: string }>()
				: null;
			return html(thankYouPage(env, order));
		}

		// --- Accès au contenu acheté ---
		if (path.startsWith("/acces/") && method === "GET") {
			const token = path.slice("/acces/".length);
			const order = await env.DB.prepare(
				`SELECT id, product_slug, download_count FROM orders
         WHERE download_token = ? AND status = 'paid' AND paid_at > datetime('now', '-${ACCESS_DAYS} days')`,
			)
				.bind(token)
				.first<{ id: string; product_slug: string; download_count: number }>();
			const product = order && getProduct(order.product_slug);
			if (!order || !product) return html("Lien invalide ou expiré. Contactez-nous sur WhatsApp.", 404);
			if (order.download_count >= MAX_ACCESS) return html("Nombre d'accès dépassé. Contactez-nous.", 403);
			await env.DB.prepare("UPDATE orders SET download_count = download_count + 1 WHERE id = ?").bind(order.id).run();
			const res = html(documentPage(env, product.title, product.includes));
			res.headers.set("x-robots-tag", "noindex");
			res.headers.set("cache-control", "private, no-store");
			return res;
		}

		// --- Administration ---
		if ((path === "/admin/valider" || path === "/admin/refuser") && method === "POST") {
			const denied = checkAdmin(request, env);
			if (denied) return denied;
			if (!sameOrigin(request)) return html("Requête refusée", 403);
			const id = clean((await request.formData()).get("id"), 64);
			if (path === "/admin/refuser") {
				await env.DB.prepare("UPDATE orders SET status='failed' WHERE id=? AND provider='manual' AND status='pending'").bind(id).run();
				return redirect("/admin");
			}
			await env.DB.prepare(
				"UPDATE orders SET status='paid', paid_at=datetime('now'), download_token=? WHERE id=? AND provider='manual' AND status='pending'",
			)
				.bind(randomHex(24), id)
				.run();
			return redirect(`/admin?valide=${encodeURIComponent(id)}`);
		}

		if (path === "/admin" || path === "/admin/leads.csv") {
			const denied = checkAdmin(request, env);
			if (denied) return denied;
			if (path === "/admin/leads.csv") {
				const { results } = await env.DB.prepare("SELECT name, phone, email, source, created_at FROM leads ORDER BY id DESC").all();
				const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
				const csv = ["nom,telephone,email,source,date", ...results.map((r) => Object.values(r).map(esc).join(","))].join("\n");
				return new Response(csv, {
					headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=prospects.csv" },
				});
			}
			const one = async (sql: string) => (await env.DB.prepare(sql).first<{ v: number }>())?.v ?? 0;
			const stats = {
				monthRevenue: await one("SELECT COALESCE(SUM(amount),0) v FROM orders WHERE status='paid' AND paid_at >= date('now','start of month')"),
				monthOrders: await one("SELECT COUNT(*) v FROM orders WHERE status='paid' AND paid_at >= date('now','start of month')"),
				totalRevenue: await one("SELECT COALESCE(SUM(amount),0) v FROM orders WHERE status='paid'"),
				leads: await one("SELECT COUNT(*) v FROM leads"),
				pending: await one("SELECT COUNT(*) v FROM orders WHERE status='pending'"),
			};
			const { results: orders } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50").all();
			const { results: bySource } = await env.DB.prepare(
				"SELECT source, COUNT(*) n, SUM(amount) revenue FROM orders WHERE status='paid' AND paid_at >= datetime('now','-30 days') GROUP BY source ORDER BY revenue DESC",
			).all<{ source: string | null; n: number; revenue: number }>();
			const { results: toValidate } = await env.DB.prepare(
				"SELECT * FROM orders WHERE provider='manual' AND status='pending' ORDER BY payment_reference IS NULL, created_at DESC LIMIT 100",
			).all();
			let flash = "";
			const validated = url.searchParams.get("valide");
			if (validated) {
				const o = await env.DB.prepare(
					"SELECT customer_name, customer_phone, product_slug, download_token FROM orders WHERE id=? AND status='paid'",
				)
					.bind(validated.slice(0, 64))
					.first<{ customer_name: string; customer_phone: string; product_slug: string; download_token: string }>();
				if (o) {
					const title = getProduct(o.product_slug)?.title ?? o.product_slug;
					const wa = `https://wa.me/${whatsappNumber(o.customer_phone)}?text=${encodeURIComponent(accessMessage(env, title, o.download_token))}`;
					flash = `<div class="success" style="margin-top:24px"><strong>Commande ${escapeHtml(validated)} validée.</strong> Envoyez maintenant son lien à ${escapeHtml(o.customer_name)} :<br><a class="btn small" style="margin-top:8px;background:#25d366" href="${escapeHtml(wa)}" target="_blank" rel="noopener">💬 Envoyer le lien sur WhatsApp</a></div>`;
				}
			}
			return html(adminPage(env, stats, orders, bySource, toValidate, flash));
		}

		return html("Page introuvable", 404);
	},

	// Tâche planifiée : re-vérifie les paiements en attente (au cas où une notification aurait été perdue).
	async scheduled(_event, env): Promise<void> {
		const { results } = await env.DB.prepare(
			"SELECT id FROM orders WHERE status='pending' AND provider='cinetpay' AND created_at > datetime('now','-2 days') LIMIT 50",
		).all<{ id: string }>();
		for (const r of results) await syncOrder(env, r.id);
		await env.DB.prepare(
			"UPDATE orders SET status='failed' WHERE status='pending' AND provider='cinetpay' AND created_at <= datetime('now','-2 days')",
		).run();
		await env.DB.prepare(
			`UPDATE orders SET status='failed' WHERE status='pending' AND provider='manual' AND created_at <= datetime('now','-${MANUAL_EXPIRY_DAYS} days')`,
		).run();
	},
} satisfies ExportedHandler<AppEnv>;
