import { type AppEnv, type Product, PRODUCTS, formatPrice } from "./config";
import { layout } from "./layout";
import { escapeHtml, markdownToHtml } from "./markdown";
import { GUIDE_GRATUIT } from "./content/guide-gratuit";

function productCard(p: Product, src: string): string {
	return `<div class="card">
  ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ""}
  <h3>${escapeHtml(p.title)}</h3>
  <p class="muted">${escapeHtml(p.subtitle)}</p>
  <ul>${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
  <p class="price">${formatPrice(p.price)}${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}</p>
  <a class="btn block" href="/produit/${p.slug}${src ? `?src=${encodeURIComponent(src)}` : ""}">Je le veux</a>
</div>`;
}

function leadForm(src: string): string {
	return `<form class="stack" method="post" action="/api/guide-gratuit">
  <input type="hidden" name="source" value="${escapeHtml(src)}">
  <input name="name" placeholder="Votre prénom et nom" required maxlength="80">
  <input name="phone" type="tel" placeholder="Votre numéro WhatsApp" required maxlength="20">
  <input name="email" type="email" placeholder="Votre e-mail (facultatif)" maxlength="120">
  <button class="btn" type="submit">Recevoir le guide gratuit</button>
</form>`;
}

export function homePage(env: AppEnv, src: string): string {
	const body = `
<div class="hero"><div class="wrap">
  <h1>Décrochez votre premier poste dans l'humanitaire</h1>
  <p>Les ONG et les agences de l'ONU recrutent chaque année des centaines de jeunes Nigériens, à Niamey, Diffa, Tillabéri, Maradi, Zinder, Tahoua, Agadez… Apprenez les codes du secteur : les métiers, les formations gratuites, le CV qui se fait remarquer, l'entretien.</p>
  <p><a class="btn" href="#produits">Voir les guides</a> &nbsp; <a class="btn ghost" href="#gratuit">Guide gratuit</a></p>
</div></div>

<section><div class="wrap grid">
  <div><h3>🎯 Concret</h3><p>Pas de théorie inutile : des étapes, des modèles, des liens vers les vraies plateformes.</p></div>
  <div><h3>🆓 Ressources gratuites</h3><p>Nous vous montrons les formations certifiantes gratuites que les recruteurs reconnaissent.</p></div>
  <div><h3>🛡️ Anti-arnaque</h3><p>Apprenez à repérer les fausses offres « ONU » et « ONG » qui demandent de l'argent.</p></div>
</div></section>

<section id="produits" style="background:#fff"><div class="wrap">
  <h2 class="center">Nos guides</h2>
  <p class="center muted">Paiement sécurisé par ${escapeHtml(env.PAYMENT_METHODS)}. Accès immédiat après paiement.</p>
  <div class="grid" style="margin-top:28px">${PRODUCTS.map((p) => productCard(p, src)).join("")}</div>
</div></section>

<section id="gratuit"><div class="wrap grid" style="align-items:center">
  <div><h2>Commencez gratuitement</h2><p>Recevez le mini-guide <strong>« Les 7 erreurs qui empêchent les jeunes d'entrer dans l'humanitaire »</strong>. Lecture : 10 minutes.</p></div>
  <div class="card">${leadForm(src)}</div>
</div></section>

<section class="faq" style="background:#fff"><div class="wrap">
  <h2>Questions fréquentes</h2>
  <details><summary>Est-ce que ce guide me garantit un emploi ?</summary><p>Non, et méfiez-vous de quiconque vous le promet. Nos guides vous donnent une méthode, des ressources et des modèles pour augmenter vos chances. Le recrutement dépend de votre profil, de vos efforts et des postes disponibles.</p></details>
  <details><summary>Comment je reçois mon guide ?</summary><p>Immédiatement après le paiement, vous êtes redirigé vers une page avec votre lien d'accès personnel. Conservez ce lien : il reste valable 1 an. Vous pouvez enregistrer le guide en PDF depuis votre téléphone ou ordinateur.</p></details>
  <details><summary>Quels moyens de paiement ?</summary><p>${escapeHtml(env.PAYMENT_METHODS)}, via une plateforme de paiement sécurisée.</p></details>
  <details><summary>J'ai besoin d'un diplôme ?</summary><p>Pas forcément. Certains postes (agent communautaire, enquêteur, volontaire) sont accessibles sans diplôme universitaire. Le guide vous explique les différents parcours.</p></details>
  <details><summary>Je n'ai pas reçu mon lien, que faire ?</summary><p>Contactez-nous sur WhatsApp avec votre numéro de commande, nous vous le renvoyons.</p></details>
</div></section>`;
	return layout(env, "Devenir agent humanitaire", body);
}

export function productPage(env: AppEnv, p: Product, src: string, error?: string): string {
	const body = `
<section><div class="wrap grid" style="align-items:start">
  <div>
    <h1 style="color:var(--blue)">${escapeHtml(p.title)}</h1>
    <p style="font-size:1.15rem">${escapeHtml(p.subtitle)}</p>
    <ul>${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
    <p class="notice">Contenu éducatif. Aucun produit ne peut garantir un emploi ; ce guide vous donne une méthode et des ressources fiables.</p>
  </div>
  <div class="card">
    <p class="price">${formatPrice(p.price)}${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}</p>
    ${error ? `<p class="notice">${escapeHtml(error)}</p>` : ""}
    <form class="stack" method="post" action="/api/commande">
      <input type="hidden" name="slug" value="${p.slug}">
      <input type="hidden" name="source" value="${escapeHtml(src)}">
      <input name="name" placeholder="Prénom et nom" required maxlength="80">
      <input name="phone" type="tel" placeholder="Numéro de téléphone (Mobile Money)" required maxlength="20">
      <input name="email" type="email" placeholder="E-mail (facultatif)" maxlength="120">
      <button class="btn block" type="submit">Payer ${formatPrice(p.price)}</button>
    </form>
    <p class="muted center" style="font-size:.9rem">🔒 Paiement sécurisé · ${escapeHtml(env.PAYMENT_METHODS)}</p>
  </div>
</div></section>`;
	return layout(env, p.title, body, { description: p.subtitle });
}

export function thankYouPage(
	env: AppEnv,
	order: { id: string; status: string; download_token: string | null; product_slug: string } | null,
): string {
	let content: string;
	if (!order) {
		content = `<p class="notice">Commande introuvable.</p>`;
	} else if (order.status === "paid" && order.download_token) {
		const link = `${env.SITE_URL}/acces/${order.download_token}`;
		content = `<div class="success"><strong>Paiement confirmé, merci !</strong></div>
      <p>Votre accès personnel :</p>
      <p><a class="btn" href="/acces/${order.download_token}">📘 Ouvrir mon guide</a></p>
      <p class="muted">Enregistrez ce lien (valable 1 an) : <br><code>${escapeHtml(link)}</code></p>
      <p>Référence de commande : <strong>${escapeHtml(order.id)}</strong></p>
      ${env.WHATSAPP_CHANNEL_URL ? `<p>Rejoignez notre <a href="${escapeHtml(env.WHATSAPP_CHANNEL_URL)}" target="_blank" rel="noopener">chaîne WhatsApp</a> pour recevoir les nouvelles offres et conseils.</p>` : ""}`;
	} else if (order.status === "failed") {
		content = `<p class="notice">Le paiement n'a pas abouti. <a href="/produit/${escapeHtml(order.product_slug)}">Réessayer</a></p>`;
	} else {
		content = `<p class="notice">Paiement en cours de vérification… Cette page se rafraîchit automatiquement.</p>
      <p class="muted">Référence : ${escapeHtml(order.id)}</p>
      <script>setTimeout(()=>location.reload(),5000)</script>`;
	}
	return layout(env, "Merci", `<section><div class="wrap" style="max-width:640px">${content}</div></section>`);
}

export function documentPage(env: AppEnv, title: string, docs: { title: string; markdown: string }[], cta = ""): string {
	const toc =
		docs.length > 1
			? `<div class="doc noprint"><strong>Contenu de votre pack :</strong><ol>${docs.map((d, i) => `<li><a href="#doc${i}">${escapeHtml(d.title)}</a></li>`).join("")}</ol></div>`
			: "";
	const body = `<div class="wrap">
  <p class="noprint center" style="margin-top:20px"><button class="btn" onclick="window.print()">⬇️ Enregistrer en PDF / Imprimer</button></p>
  ${toc}
  ${docs.map((d, i) => `<article class="doc" id="doc${i}">${markdownToHtml(d.markdown)}</article>`).join("")}
  ${cta}
</div>`;
	return layout(env, title, body);
}

export function freeGuidePage(env: AppEnv): string {
	const cta = `<div class="doc noprint center"><h2>Prêt à passer à l'étape suivante ?</h2><p>Le Pack Premium contient l'e-book complet, les modèles de CV et lettres, les 30 sites d'offres et les 25 questions d'entretien avec réponses.</p><a class="btn" href="/produit/pack-premium?src=guide-gratuit">Découvrir le Pack Premium</a></div>`;
	return documentPage(env, "Guide gratuit", [{ title: "Guide gratuit", markdown: GUIDE_GRATUIT }], cta);
}

export function termsPage(env: AppEnv): string {
	const md = `
# Conditions générales de vente

## Produits
${env.SITE_NAME} vend des contenus numériques éducatifs (guides, e-books, modèles) sur l'orientation professionnelle dans le secteur humanitaire.

## Absence de garantie d'emploi
Nos produits sont des outils d'information et de méthode. **Ils ne garantissent en aucun cas l'obtention d'un emploi, d'un stage ou d'un volontariat.** ${env.SITE_NAME} n'est affilié à aucune agence des Nations Unies, ni à aucune ONG citée dans ses contenus, et ne réalise aucun recrutement.

## Paiement et livraison
Le paiement est traité par CinetPay. L'accès au contenu est fourni immédiatement après confirmation du paiement, via un lien personnel valable 1 an.

## Remboursement
Si vous ne parvenez pas à accéder à votre contenu, contactez-nous : nous le renvoyons ou remboursons. Les contenus numériques consultés ne sont pas remboursables, sauf défaut technique de notre fait.

## Données personnelles
Votre nom, téléphone et e-mail servent uniquement à traiter votre commande et, si vous l'acceptez en vous inscrivant au guide gratuit, à vous envoyer des conseils. Vous pouvez demander leur suppression à tout moment.

## Usage personnel
Les contenus sont réservés à l'usage personnel de l'acheteur. Toute revente ou diffusion est interdite.
`;
	return documentPage(env, "Conditions de vente", [{ title: "CGV", markdown: md }]);
}

export function adminPage(
	env: AppEnv,
	stats: { monthRevenue: number; monthOrders: number; totalRevenue: number; leads: number; pending: number },
	orders: Record<string, unknown>[],
	bySource: { source: string | null; n: number; revenue: number }[],
): string {
	const target = Number(env.MONTHLY_TARGET) || 1000000;
	const pct = Math.min(100, Math.round((stats.monthRevenue / target) * 100));
	const rows = orders
		.map(
			(o) =>
				`<tr><td>${escapeHtml(String(o.created_at))}</td><td>${escapeHtml(String(o.customer_name))}</td><td>${escapeHtml(String(o.customer_phone))}</td><td>${escapeHtml(String(o.product_slug))}</td><td>${formatPrice(Number(o.amount))}</td><td>${escapeHtml(String(o.status))}</td><td>${escapeHtml(String(o.source ?? ""))}</td></tr>`,
		)
		.join("");
	const body = `<section><div class="wrap">
  <h1 style="color:var(--blue)">Tableau de bord</h1>
  <div class="grid">
    <div class="card"><div class="muted">Ventes ce mois</div><div class="kpi">${formatPrice(stats.monthRevenue)}</div><div class="bar"><div style="width:${pct}%"></div></div><small>${pct}% de l'objectif (${formatPrice(target)})</small></div>
    <div class="card"><div class="muted">Commandes payées ce mois</div><div class="kpi">${stats.monthOrders}</div></div>
    <div class="card"><div class="muted">Prospects (guide gratuit)</div><div class="kpi">${stats.leads}</div><a href="/admin/leads.csv">Exporter CSV</a></div>
    <div class="card"><div class="muted">Total depuis le début</div><div class="kpi">${formatPrice(stats.totalRevenue)}</div><small>${stats.pending} paiements en attente</small></div>
  </div>
  <h2 style="margin-top:32px">Ventes par canal (30 derniers jours)</h2>
  <table class="data"><tr><th>Source</th><th>Ventes</th><th>CA</th></tr>${bySource.map((s) => `<tr><td>${escapeHtml(s.source || "direct")}</td><td>${s.n}</td><td>${formatPrice(s.revenue)}</td></tr>`).join("")}</table>
  <h2 style="margin-top:32px">50 dernières commandes</h2>
  <div style="overflow-x:auto"><table class="data"><tr><th>Date</th><th>Client</th><th>Téléphone</th><th>Produit</th><th>Montant</th><th>Statut</th><th>Source</th></tr>${rows}</table></div>
</div></section>`;
	return layout(env, "Admin", body);
}
