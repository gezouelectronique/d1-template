import { EBOOK_GUIDE_COMPLET } from "./content/ebook-guide-complet";
import { PACK_CV } from "./content/pack-cv";
import { PACK_RECRUTEMENT } from "./content/pack-recrutement";

export interface AppEnv {
	DB: D1Database;
	SITE_NAME: string;
	SITE_URL: string;
	LOGO_URL?: string;
	CURRENCY: string; // XOF (Afrique de l'Ouest) ou XAF (Afrique Centrale)
	COUNTRY_CODE: string; // ex: CI, SN, CM, BF...
	WHATSAPP_CHANNEL_URL?: string;
	FACEBOOK_URL?: string;
	LINKEDIN_URL?: string;
	SUPPORT_WHATSAPP?: string; // numéro au format international sans + (ex: 2250700000000)
	META_PIXEL_ID?: string;
	PAYMENT_METHODS: string; // moyens de paiement affichés
	MONTHLY_TARGET: string; // objectif mensuel en FCFA
	/** Paiement manuel : "Wave=90000000; MyNita=90000000; …" (un moyen sans numéro n'est pas affiché) */
	MANUAL_PAYMENT_ACCOUNTS?: string;
	/** Nom du titulaire des comptes, affiché au client pour qu'il vérifie le bénéficiaire */
	MANUAL_PAYMENT_HOLDER?: string;
	// Secrets (wrangler secret put ...)
	CINETPAY_API_KEY?: string;
	CINETPAY_SITE_ID?: string;
	ADMIN_PASSWORD?: string;
}

export interface Product {
	slug: string;
	title: string;
	subtitle: string;
	price: number; // FCFA — doit être un multiple de 5 (exigence CinetPay)
	oldPrice?: number;
	badge?: string;
	bullets: string[];
	/** Contenus livrés après paiement (markdown) */
	includes: { title: string; markdown: string }[];
}

export const PRODUCTS: Product[] = [
	{
		slug: "guide-complet",
		title: "Devenir Agent Humanitaire",
		subtitle: "Le guide complet pour décrocher votre premier poste dans une ONG ou à l'ONU",
		price: 5000,
		oldPrice: 7500,
		bullets: [
			"Les 12 métiers de l'humanitaire qui recrutent le plus",
			"Les formations et certificats GRATUITS reconnus par les ONG",
			"Le volontariat (UNV, Croix-Rouge, ONG locales) comme porte d'entrée",
			"Plan d'action de 90 jours, étape par étape",
			"Comment repérer et éviter les arnaques au recrutement",
		],
		includes: [{ title: "E-book : Devenir Agent Humanitaire", markdown: EBOOK_GUIDE_COMPLET }],
	},
	{
		slug: "pack-cv",
		title: "Pack CV & Lettre de Motivation Humanitaire",
		subtitle: "Des modèles prêts à remplir, au format attendu par les recruteurs ONG",
		price: 3500,
		bullets: [
			"Modèle de CV humanitaire (format ONG / format ONU)",
			"3 lettres de motivation types à adapter",
			"Les 40 mots-clés qui passent les filtres des recruteurs",
			"Check-list avant d'envoyer une candidature",
		],
		includes: [{ title: "Pack CV & Lettre de Motivation", markdown: PACK_CV }],
	},
	{
		slug: "pack-premium",
		title: "Pack Premium Carrière Humanitaire",
		subtitle: "Tout ce qu'il faut, du premier pas jusqu'à l'entretien d'embauche",
		price: 10000,
		oldPrice: 15000,
		badge: "Le plus choisi",
		bullets: [
			"L'e-book complet « Devenir Agent Humanitaire »",
			"Le Pack CV & Lettre de Motivation",
			"Les 30 sites où sont publiées les offres (ONU, ONG, volontariat)",
			"Les 25 questions d'entretien les plus posées + réponses modèles",
			"Accès à vie et mises à jour gratuites",
		],
		includes: [
			{ title: "E-book : Devenir Agent Humanitaire", markdown: EBOOK_GUIDE_COMPLET },
			{ title: "Pack CV & Lettre de Motivation", markdown: PACK_CV },
			{ title: "Recrutement : sites d'offres & entretiens", markdown: PACK_RECRUTEMENT },
		],
	},
];

export function getProduct(slug: string): Product | undefined {
	return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(amount: number): string {
	// espaces insécables : le prix ne se coupe pas en fin de ligne
	return amount.toLocaleString("fr-FR").replace(/\s/g, "\u00a0") + "\u00a0F\u00a0CFA";
}

export interface ManualAccount {
	method: string;
	number: string;
}

/** Lit MANUAL_PAYMENT_ACCOUNTS ("Wave=90000000; MyNita=91000000") et ignore les moyens sans numéro. */
export function manualAccounts(env: AppEnv): ManualAccount[] {
	return (env.MANUAL_PAYMENT_ACCOUNTS || "")
		.split(";")
		.map((part) => {
			const i = part.indexOf("=");
			return i < 0 ? null : { method: part.slice(0, i).trim(), number: part.slice(i + 1).trim() };
		})
		.filter((a): a is ManualAccount => Boolean(a && a.method && a.number));
}

/** Numéro au format WhatsApp (international, sans +). Ajoute l'indicatif du Niger aux numéros locaux à 8 chiffres. */
export function whatsappNumber(phone: string): string {
	const digits = phone.replace(/\D/g, "").replace(/^00/, "");
	return digits.length === 8 ? `227${digits}` : digits;
}
