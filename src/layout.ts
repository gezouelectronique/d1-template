import type { AppEnv } from "./config";
import { escapeHtml } from "./markdown";

const CSS = `
:root{--blue:#1c1c28;--blue2:#9b1590;--orange:#c822b6;--bg:#f6f8fb;--text:#1b2733;--muted:#5b6b7a;--ok:#1f8a4c}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--text);background:var(--bg);line-height:1.6}
a{color:var(--blue2)}img{max-width:100%}
.wrap{max-width:1040px;margin:0 auto;padding:0 18px}
header.top{background:#fff;border-bottom:1px solid #e3e8ef}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;color:var(--blue);text-decoration:none;font-size:1.1rem}
.brand img{height:44px;width:auto}.brand span{display:none}
.hero{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;padding:56px 0 64px}
.hero h1{font-size:clamp(1.8rem,4.5vw,2.8rem);line-height:1.2;margin:0 0 14px}
.hero p{font-size:1.15rem;opacity:.92;max-width:680px}
.btn{display:inline-block;background:var(--orange);color:#fff;font-weight:700;padding:14px 26px;border-radius:10px;text-decoration:none;border:0;font-size:1.05rem;cursor:pointer}
.btn:hover{filter:brightness(1.05)}.btn.ghost{background:transparent;border:2px solid #fff}
.btn.block{display:block;width:100%;text-align:center}
section{padding:48px 0}section h2{font-size:1.7rem;color:var(--blue);margin-top:0}
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(0,0,0,.08);position:relative;display:flex;flex-direction:column}
.card h3{margin:0 0 6px;color:var(--blue)}.card ul{padding-left:20px;flex:1}
.badge{position:absolute;top:-12px;right:16px;background:var(--orange);color:#fff;font-size:.8rem;font-weight:700;padding:4px 10px;border-radius:20px}
.price{font-size:1.6rem;font-weight:800;color:var(--blue)}.old{text-decoration:line-through;color:var(--muted);font-size:1rem;margin-left:8px;font-weight:400}
.btn.small{padding:6px 12px;font-size:.9rem;border-radius:8px}.btn.grey{background:#8a96a3}
.btn.ghost-dark{background:transparent;color:var(--blue2);border:2px solid var(--blue2)}
fieldset.methods{border:1px solid #cfd8e3;border-radius:10px;padding:10px 14px;display:grid;gap:8px}
fieldset.methods legend{font-weight:700;padding:0 6px}fieldset.methods label{display:flex;gap:10px;align-items:center;cursor:pointer}
fieldset.methods input{width:auto}.steps li{margin-bottom:10px}.big{font-size:1.25rem;white-space:nowrap}
.muted{color:var(--muted)}.center{text-align:center}
form.stack{display:grid;gap:12px}
input{width:100%;padding:13px 14px;border:1px solid #cfd8e3;border-radius:10px;font-size:1rem}
.notice{background:#fff7ec;border-left:4px solid var(--orange);padding:14px 16px;border-radius:8px}
.success{background:#eaf7ef;border-left:4px solid var(--ok);padding:14px 16px;border-radius:8px}
.faq details{background:#fff;border-radius:10px;padding:14px 18px;margin-bottom:10px}.faq summary{font-weight:700;cursor:pointer}
footer{background:var(--blue);color:#cfe0ee;padding:32px 0;font-size:.95rem}footer a{color:#fff;margin-right:14px}
.doc{background:#fff;max-width:820px;margin:24px auto;padding:36px 42px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.doc h1{color:var(--blue)}.doc h2{color:var(--blue2);border-bottom:2px solid #eef2f6;padding-bottom:6px;margin-top:2em}
.doc blockquote{background:#f1f6fb;border-left:4px solid var(--blue2);margin:16px 0;padding:12px 16px;border-radius:6px}
.checklist{list-style:"☐  "}
table.data{width:100%;border-collapse:collapse;background:#fff;font-size:.92rem}table.data th,table.data td{padding:8px 10px;border-bottom:1px solid #e6ebf1;text-align:left}
.kpi{font-size:1.8rem;font-weight:800;color:var(--blue)}
.bar{height:14px;background:#e3e8ef;border-radius:8px;overflow:hidden}.bar>div{height:100%;background:var(--orange)}
.wa{position:fixed;right:16px;bottom:16px;background:#25d366;color:#fff;border-radius:50px;padding:12px 18px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.2)}
@media(max-width:600px){.doc{padding:22px 18px;margin:14px 0}}
@media print{header.top,footer,.wa,.noprint{display:none!important}body{background:#fff}.doc{box-shadow:none;margin:0;padding:0;max-width:none}}
`;

export function layout(env: AppEnv, title: string, body: string, opts: { description?: string } = {}): string {
	const site = escapeHtml(env.SITE_NAME);
	const logo = env.LOGO_URL ? `<img src="${escapeHtml(env.LOGO_URL)}" alt="${site}">` : "🌍";
	const pixel = env.META_PIXEL_ID
		? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${escapeHtml(env.META_PIXEL_ID)}');fbq('track','PageView');</script>`
		: "";
	const social = [
		env.FACEBOOK_URL && `<a href="${escapeHtml(env.FACEBOOK_URL)}" target="_blank" rel="noopener">Facebook</a>`,
		env.WHATSAPP_CHANNEL_URL && `<a href="${escapeHtml(env.WHATSAPP_CHANNEL_URL)}" target="_blank" rel="noopener">Chaîne WhatsApp</a>`,
		env.LINKEDIN_URL && `<a href="${escapeHtml(env.LINKEDIN_URL)}" target="_blank" rel="noopener">LinkedIn</a>`,
	]
		.filter(Boolean)
		.join("");
	const wa = env.SUPPORT_WHATSAPP
		? `<a class="wa noprint" href="https://wa.me/${escapeHtml(env.SUPPORT_WHATSAPP)}?text=${encodeURIComponent("Bonjour, j'ai une question sur vos guides humanitaires.")}" target="_blank" rel="noopener">💬 WhatsApp</a>`
		: "";
	const desc = escapeHtml(
		opts.description ?? "Guides et e-books pratiques pour décrocher votre premier emploi dans une ONG ou à l'ONU.",
	);
	return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — ${site}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${desc}">
${env.LOGO_URL ? `<meta property="og:image" content="${escapeHtml(env.SITE_URL)}/og.jpg"><link rel="icon" href="${escapeHtml(env.LOGO_URL)}">` : ""}
<style>${CSS}</style>${pixel}
</head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">${logo}<span>${site}</span></a><a href="/#produits" class="noprint">Nos guides</a></div></header>
${body}
<footer><div class="wrap"><p>${social}</p><p>© ${new Date().getFullYear()} ${site}. Contenus éducatifs : aucun produit ne garantit un emploi. Nous ne sommes affiliés à aucune agence des Nations Unies ni ONG citée.</p><p><a href="/conditions">Conditions de vente</a></p></div></footer>
${wa}
</body></html>`;
}
