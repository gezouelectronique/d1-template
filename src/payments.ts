// Intégration CinetPay (Mobile Money Orange, MTN, Moov, Wave + cartes) — API Checkout v2.
// Doc : https://docs.cinetpay.com/api/1.0-fr/checkout/initialisation
import type { AppEnv } from "./config";

const API = "https://api-checkout.cinetpay.com/v2";

export function paymentsConfigured(env: AppEnv): boolean {
	return Boolean(env.CINETPAY_API_KEY && env.CINETPAY_SITE_ID);
}

export interface InitPaymentInput {
	transactionId: string;
	amount: number;
	description: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string | null;
}

export async function initPayment(env: AppEnv, input: InitPaymentInput): Promise<string> {
	const [firstName, ...rest] = input.customerName.trim().split(/\s+/);
	const body = {
		apikey: env.CINETPAY_API_KEY,
		site_id: env.CINETPAY_SITE_ID,
		transaction_id: input.transactionId,
		amount: input.amount,
		currency: env.CURRENCY,
		description: input.description.replace(/[^\p{L}\p{N} .,'-]/gu, ""),
		notify_url: `${env.SITE_URL}/api/paiement/notification`,
		return_url: `${env.SITE_URL}/merci?commande=${encodeURIComponent(input.transactionId)}`,
		channels: "ALL",
		lang: "fr",
		customer_name: rest.join(" ") || firstName,
		customer_surname: firstName,
		customer_phone_number: input.customerPhone,
		customer_email: input.customerEmail || "client@example.com",
		customer_address: "N/A",
		customer_city: "N/A",
		customer_country: env.COUNTRY_CODE,
		customer_state: env.COUNTRY_CODE,
		customer_zip_code: "00000",
	};
	const res = await fetch(`${API}/payment`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = (await res.json()) as { code?: string; message?: string; data?: { payment_url?: string } };
	if (data.code !== "201" || !data.data?.payment_url) {
		throw new Error(`CinetPay: ${data.code} ${data.message}`);
	}
	return data.data.payment_url;
}

/** Interroge CinetPay pour connaître le statut réel d'une transaction (ne jamais faire confiance au navigateur). */
export async function checkPayment(
	env: AppEnv,
	transactionId: string,
): Promise<{ status: "ACCEPTED" | "REFUSED" | "PENDING"; amount?: number; currency?: string }> {
	const res = await fetch(`${API}/payment/check`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			apikey: env.CINETPAY_API_KEY,
			site_id: env.CINETPAY_SITE_ID,
			transaction_id: transactionId,
		}),
	});
	const data = (await res.json()) as {
		code?: string;
		data?: { status?: string; amount?: string | number; currency?: string };
	};
	const status = data.data?.status;
	if (data.code === "00" && status === "ACCEPTED") {
		return { status: "ACCEPTED", amount: Number(data.data?.amount), currency: data.data?.currency };
	}
	if (status === "REFUSED") return { status: "REFUSED" };
	return { status: "PENDING" };
}
