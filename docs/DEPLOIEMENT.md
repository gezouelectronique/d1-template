# Mise en ligne — pas à pas

Durée : environ 1 heure, plus le délai de validation CinetPay (quelques jours, pièces d'identité / documents d'entreprise demandés).

## 1. Ouvrir un compte CinetPay (encaissement Mobile Money)

1. Créez un compte marchand sur **cinetpay.com**.
2. Fournissez les documents demandés (pièce d'identité, et selon le pays registre de commerce / statut d'auto-entrepreneur). Sans validation, vous ne pouvez encaisser que des paiements de test.
3. Dans le tableau de bord : **Intégration** → notez votre **API KEY** et votre **SITE ID**.
4. Vérifiez la devise de votre compte : **XOF** (UEMOA : Côte d'Ivoire, Sénégal, Burkina, Mali, Bénin, Togo, Niger) ou **XAF** (CEMAC : Cameroun, Gabon, Congo…).

> Alternatives si CinetPay n'est pas disponible dans votre pays : FedaPay, PayDunya, Kkiapay. Seul le fichier `src/payments.ts` serait à adapter.

## 2. Déployer sur Cloudflare (gratuit)

```bash
npm install
npx wrangler login
npx wrangler d1 create cap-humanitaire-db
```

Copiez le `database_id` affiché dans `wrangler.json` (champ `d1_databases[0].database_id`, et mettez `database_name` à `cap-humanitaire-db`).

Ajoutez les secrets (ils ne sont jamais écrits dans le code) :

```bash
npx wrangler secret put CINETPAY_API_KEY
npx wrangler secret put CINETPAY_SITE_ID
npx wrangler secret put ADMIN_PASSWORD
```

Puis déployez :

```bash
npm run deploy
```

Wrangler affiche l'adresse du site, du type `https://cap-humanitaire.<votre-compte>.workers.dev`.

## 3. Personnaliser `wrangler.json` → `vars`

| Variable | Exemple | Rôle |
|---|---|---|
| `SITE_NAME` | `Cap Humanitaire` | Nom affiché (mettez le nom de votre marque) |
| `SITE_URL` | `https://cap-humanitaire.xxx.workers.dev` | **Obligatoire et exact** : sert aux retours de paiement |
| `LOGO_URL` | `https://…/logo.png` | Votre logo (voir ci-dessous) |
| `CURRENCY` | `XOF` ou `XAF` | Devise de votre compte CinetPay |
| `COUNTRY_CODE` | `CI`, `SN`, `CM`… | Pays |
| `FACEBOOK_URL`, `WHATSAPP_CHANNEL_URL`, `LINKEDIN_URL` | liens de vos pages | Affichés en pied de page |
| `SUPPORT_WHATSAPP` | `2250700000000` | Bouton WhatsApp flottant (sans le +) |
| `META_PIXEL_ID` | `1234567890` | Suivi des publicités Facebook (facultatif) |
| `MONTHLY_TARGET` | `1000000` | Objectif affiché dans `/admin` |

**Logo** : le plus simple est de le mettre dans un dossier `public/` servi par Cloudflare, ou de l'héberger sur votre page Facebook / un service d'images, puis de coller l'adresse directe de l'image dans `LOGO_URL`. Redéployez après chaque modification (`npm run deploy`).

## 4. Tester avant d'annoncer

1. Ouvrez le site sur votre téléphone.
2. Achetez le Pack CV (3 500 F) avec votre propre Mobile Money.
3. Vérifiez : redirection vers `/merci`, lien d'accès qui fonctionne, vente visible dans `/admin` (identifiant : n'importe lequel, mot de passe : `ADMIN_PASSWORD`).

## 5. (Recommandé) Nom de domaine

Un domaine `.com` ou national (ex. `caphumanitaire.com`, ~10 000 F/an) inspire plus confiance. Ajoutez-le dans Cloudflare → Workers → votre worker → *Domains & Routes*, puis mettez à jour `SITE_URL`.

## Fonctionnement automatique

- Le client paie → CinetPay notifie le site → le site **vérifie le paiement auprès de CinetPay** (montant et devise) → le lien d'accès est créé. Aucune intervention de votre part.
- Toutes les 30 minutes, une tâche planifiée revérifie les paiements en attente (au cas où une notification se perdrait).
- Les contenus ne sont jamais accessibles sans paiement vérifié.
