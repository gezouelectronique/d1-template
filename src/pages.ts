import { type AppEnv, type ManualAccount, type Product, PRODUCTS, formatPrice, getProduct, manualAccounts, whatsappNumber } from "./config";
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
  <p class="center muted">Paiement par ${escapeHtml(env.PAYMENT_METHODS)}.</p>
  <div class="grid" style="margin-top:28px">${PRODUCTS.map((p) => productCard(p, src)).join("")}</div>
</div></section>

<section id="gratuit"><div class="wrap grid" style="align-items:center">
  <div><h2>Commencez gratuitement</h2><p>Recevez le mini-guide <strong>« Les 7 erreurs qui empêchent les jeunes d'entrer dans l'humanitaire »</strong>. Lecture : 10 minutes.</p></div>
  <div class="card">${leadForm(src)}</div>
</div></section>

<section class="faq" style="background:#fff"><div class="wrap">
  <h2>Questions fréquentes</h2>
  <details><summary>Est-ce que ce guide me garantit un emploi ?</summary><p>Non, et méfiez-vous de quiconque vous le promet. Nos guides vous donnent une méthode, des ressources et des modèles pour augmenter vos chances. Le recrutement dépend de votre profil, de vos efforts et des postes disponibles.</p></details>
  <details><summary>Comment je reçois mon guide ?</summary><p>Paiement en ligne : immédiatement après le paiement, vous êtes redirigé vers votre lien d'accès personnel. Paiement par Wave, MyNita, Amanata ou Airtel Money vers notre numéro : vous saisissez la référence de la transaction, nous vérifions et vous recevez votre lien sur WhatsApp, en général dans l'heure. Conservez ce lien : il reste valable 1 an. Vous pouvez enregistrer le guide en PDF depuis votre téléphone ou ordinateur.</p></details>
  <details><summary>Quels moyens de paiement ?</summary><p>${escapeHtml(env.PAYMENT_METHODS)}.</p></details>
  <details><summary>J'ai besoin d'un diplôme ?</summary><p>Pas forcément. Certains postes (agent communautaire, enquêteur, volontaire) sont accessibles sans diplôme universitaire. Le guide vous explique les différents parcours.</p></details>
  <details><summary>Je n'ai pas reçu mon lien, que faire ?</summary><p>Contactez-nous sur WhatsApp avec votre numéro de commande, nous vous le renvoyons.</p></details>
</div></section>`;
	return layout(env, "Devenir agent humanitaire", body);
}

/** Choix du moyen de paiement : en ligne (CinetPay, si configuré) et/ou paiement manuel par moyen. */
function methodChoice(env: AppEnv): string {
	const options: { value: string; label: string }[] = [];
	if (env.CINETPAY_API_KEY && env.CINETPAY_SITE_ID) options.push({ value: "online", label: "Paiement en ligne (Mobile Money ou carte)" });
	for (const a of manualAccounts(env)) options.push({ value: `manual:${a.method}`, label: a.method });
	if (options.length === 0) return "";
	return `<fieldset class="methods"><legend>Moyen de paiement</legend>${options
		.map(
			(o, i) =>
				`<label><input type="radio" name="method" value="${escapeHtml(o.value)}" required${i === 0 ? " checked" : ""}> ${escapeHtml(o.label)}</label>`,
		)
		.join("")}</fieldset>`;
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
      <input name="phone" type="tel" placeholder="Votre numéro WhatsApp" required maxlength="20">
      <input name="email" type="email" placeholder="E-mail (facultatif)" maxlength="120">
      ${methodChoice(env)}
      <button class="btn block" type="submit">Commander · ${formatPrice(p.price)}</button>
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

export interface ManualOrder {
	id: string;
	status: string;
	product_slug: string;
	amount: number;
	customer_phone: string;
	payment_method: string | null;
	payment_reference: string | null;
	download_token: string | null;
}

/** Page d'une commande en paiement manuel : instructions, saisie de la référence, puis attente de validation. */
export function manualOrderPage(env: AppEnv, order: ManualOrder, account: ManualAccount | undefined, error?: string): string {
	if (order.status === "paid" || order.status === "failed") return thankYouPage(env, order);
	const product = getProduct(order.product_slug);
	const ref = escapeHtml(order.id);
	const support = env.SUPPORT_WHATSAPP
		? `<p><a class="btn ghost-dark" href="https://wa.me/${escapeHtml(env.SUPPORT_WHATSAPP)}?text=${encodeURIComponent(
				`Bonjour, j'ai payé ma commande ${order.id} (${product?.title ?? order.product_slug}) par ${order.payment_method ?? ""}. Référence : ${order.payment_reference ?? "…"}`,
			)}" target="_blank" rel="noopener">💬 Nous écrire sur WhatsApp</a></p>`
		: "";
	let content: string;
	if (order.payment_reference) {
		content = `<div class="success"><strong>Merci ! Votre paiement est en cours de vérification.</strong></div>
      <p>Nous vérifions la réception de <strong>${formatPrice(order.amount)}</strong> par ${escapeHtml(order.payment_method ?? "")} (référence <code>${escapeHtml(order.payment_reference)}</code>).</p>
      <p>Dès que c'est fait, vous recevrez votre lien d'accès sur WhatsApp au <strong>${escapeHtml(order.customer_phone)}</strong>. Le lien s'affichera aussi sur cette page : gardez-la ouverte ou revenez plus tard.</p>
      <p class="muted">Numéro de commande : ${ref}</p>
      ${support}
      <script>setTimeout(()=>location.reload(),30000)</script>`;
	} else if (!account) {
		content = `<p class="notice">Ce moyen de paiement n'est plus disponible. <a href="/produit/${escapeHtml(order.product_slug)}">Choisir un autre moyen</a></p>`;
	} else {
		const holder = env.MANUAL_PAYMENT_HOLDER ? ` (au nom de <strong>${escapeHtml(env.MANUAL_PAYMENT_HOLDER)}</strong>)` : "";
		content = `<h1 style="color:var(--blue)">Payez par ${escapeHtml(account.method)}</h1>
      <p>Commande : <strong>${escapeHtml(product?.title ?? order.product_slug)}</strong> — n° ${ref}</p>
      ${error ? `<p class="notice">${escapeHtml(error)}</p>` : ""}
      <ol class="steps">
        <li>Ouvrez ${escapeHtml(account.method)} et envoyez exactement <strong>${formatPrice(order.amount)}</strong> au numéro <strong class="big">${escapeHtml(account.number)}</strong>${holder}.</li>
        <li>Vous recevez un SMS de confirmation : repérez la <strong>référence</strong> (ou « ID de transaction »).</li>
        <li>Saisissez cette référence ci-dessous et validez.</li>
      </ol>
      <form class="stack card" method="post" action="/commande/${ref}">
        <input name="reference" placeholder="Référence de la transaction" required maxlength="60" autocomplete="off">
        <button class="btn block" type="submit">J'ai payé, envoyer la référence</button>
      </form>
      <p class="muted">Vous recevrez votre lien d'accès sur WhatsApp dès que le paiement est vérifié. Ne payez jamais à un autre numéro que celui affiché ici.</p>
      ${support}`;
	}
	return layout(env, "Paiement", `<section><div class="wrap" style="max-width:640px">${content}</div></section>`);
}

/** Message WhatsApp envoyé au client après validation manuelle. */
export function accessMessage(env: AppEnv, productTitle: string, token: string): string {
	return `Bonjour, votre paiement est confirmé, merci ! Voici votre accès à « ${productTitle} » (lien personnel, valable 1 an) : ${env.SITE_URL}/acces/${token}`;
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
Le paiement en ligne est traité par CinetPay ; l'accès est alors fourni immédiatement. Pour un paiement par transfert Mobile Money (Wave, MyNita, Amanata, Airtel Money…) vers le numéro indiqué sur le site, l'accès est fourni après vérification de la transaction, en général dans l'heure aux heures ouvrables. Dans les deux cas, l'accès se fait par un lien personnel valable 1 an.

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
	toValidate: Record<string, unknown>[] = [],
	flash = "",
): string {
	const target = Number(env.MONTHLY_TARGET) || 1000000;
	const pct = Math.min(100, Math.round((stats.monthRevenue / target) * 100));
	const rows = orders
		.map(
			(o) =>
				`<tr><td>${escapeHtml(String(o.created_at))}</td><td>${escapeHtml(String(o.customer_name))}</td><td>${escapeHtml(String(o.customer_phone))}</td><td>${escapeHtml(String(o.product_slug))}</td><td>${formatPrice(Number(o.amount))}</td><td>${escapeHtml(String(o.status))}</td><td>${escapeHtml(o.provider === "manual" ? `${o.payment_method ?? ""} ${o.payment_reference ?? ""}` : "en ligne")}</td><td>${escapeHtml(String(o.source ?? ""))}</td></tr>`,
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
  ${flash}
  <h2 style="margin-top:32px">Paiements manuels à valider (${toValidate.length})</h2>
  <p class="muted">Vérifiez dans votre application (Wave, MyNita…) que le montant est bien arrivé avec cette référence avant de valider.</p>
  <div style="overflow-x:auto"><table class="data"><tr><th>Date</th><th>N°</th><th>Client</th><th>Téléphone</th><th>Produit</th><th>Montant</th><th>Moyen</th><th>Référence</th><th></th></tr>${toValidate
		.map((o) => {
			const id = escapeHtml(String(o.id));
			const action = (verb: string, label: string, cls: string) =>
				`<form method="post" action="/admin/${verb}" style="display:inline"><input type="hidden" name="id" value="${id}"><button class="btn small ${cls}" type="submit"${verb === "refuser" ? ` onclick="return confirm('Refuser cette commande ?')"` : ""}>${label}</button></form>`;
			return `<tr><td>${escapeHtml(String(o.created_at))}</td><td>${id}</td><td>${escapeHtml(String(o.customer_name))}</td><td><a href="https://wa.me/${escapeHtml(whatsappNumber(String(o.customer_phone)))}" target="_blank" rel="noopener">${escapeHtml(String(o.customer_phone))}</a></td><td>${escapeHtml(String(o.product_slug))}</td><td>${formatPrice(Number(o.amount))}</td><td>${escapeHtml(String(o.payment_method ?? ""))}</td><td>${o.payment_reference ? `<code>${escapeHtml(String(o.payment_reference))}</code>` : `<span class="muted">pas encore saisie</span>`}</td><td>${action("valider", "Valider", "")} ${action("refuser", "Refuser", "grey")}</td></tr>`;
		})
		.join("")}</table></div>
  <h2 style="margin-top:32px">Ventes par canal (30 derniers jours)</h2>
  <table class="data"><tr><th>Source</th><th>Ventes</th><th>CA</th></tr>${bySource.map((s) => `<tr><td>${escapeHtml(s.source || "direct")}</td><td>${s.n}</td><td>${formatPrice(s.revenue)}</td></tr>`).join("")}</table>
  <h2 style="margin-top:32px">50 dernières commandes</h2>
  <div style="overflow-x:auto"><table class="data"><tr><th>Date</th><th>Client</th><th>Téléphone</th><th>Produit</th><th>Montant</th><th>Statut</th><th>Paiement</th><th>Source</th></tr>${rows}</table></div>
</div></section>`;
	return layout(env, "Admin", body);
}
