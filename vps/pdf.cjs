// Génère les PDF des produits à partir du serveur local (utilisé par preparer-dossier.sh).
const { DatabaseSync } = require("node:sqlite");
const { chromium } = require("playwright");
const path = require("node:path");

const [appDir, outDir] = process.argv.slice(2);
const db = new DatabaseSync(path.join(appDir, "data", "boutique.sqlite"));
const products = [
	["guide-complet", "E-book - Devenir Agent Humanitaire.pdf"],
	["pack-cv", "Pack CV et Lettres de Motivation.pdf"],
	["pack-premium", "Pack Premium Carriere Humanitaire.pdf"],
];
for (const [slug] of products) {
	db.prepare(
		"INSERT OR IGNORE INTO orders (id, product_slug, amount, currency, customer_name, customer_phone, status, download_token, paid_at) VALUES (?, ?, 0, 'XOF', 'pdf', '0', 'paid', ?, datetime('now'))",
	).run("PDF-" + slug, slug, "pdf-" + slug);
}
(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	for (const [slug, name] of products) {
		await page.goto(`http://localhost:3377/acces/pdf-${slug}`);
		await page.pdf({ path: path.join(outDir, name), format: "A4", margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
	}
	await page.goto("http://localhost:3377/guide-gratuit");
	await page.pdf({ path: path.join(outDir, "Guide gratuit - Les 7 erreurs.pdf"), format: "A4", margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
	await browser.close();
})();
