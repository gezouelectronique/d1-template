# Mise en ligne — pas à pas

Durée : environ 1 heure, plus le délai de validation CinetPay (quelques jours, pièces d'identité / documents d'entreprise demandés).

## 1. Ouvrir un compte CinetPay (encaissement Mobile Money)

1. Créez un compte marchand sur **cinetpay.com**.
2. Fournissez les documents demandés (pièce d'identité, et selon le pays registre de commerce / statut d'auto-entrepreneur). Sans validation, vous ne pouvez encaisser que des paiements de test.
3. Dans le tableau de bord : **Intégration** → notez votre **API KEY** et votre **SITE ID**.
4. Devise : **XOF** (le Niger est dans la zone UEMOA) — déjà configuré.
5. **Important pour le Niger** : avant de signer, demandez au service commercial quels opérateurs sont couverts **au Niger** (Airtel Money, Moov Money/Flooz, Zamani Cash, Nita…) et mettez la liste exacte dans la variable `PAYMENT_METHODS` de `wrangler.json`. Si la couverture Niger est insuffisante, comparez avec d'autres agrégateurs présents dans la zone UEMOA (FedaPay, PayDunya, Kkiapay…) : seul `src/payments.ts` serait à adapter.


## 1 bis. Paiement manuel (Wave, MyNita, Amanata, Airtel Money) — utilisable tout de suite

Sans attendre CinetPay, le client peut payer en envoyant l'argent à **votre** numéro :

1. Sur la page produit, il choisit son moyen (Wave, MyNita…) et clique sur **Commander**.
2. Le site lui affiche le montant exact et votre numéro, puis lui demande la **référence de transaction** reçue par SMS.
3. Dans `/admin`, section **Paiements manuels à valider**, vous vérifiez dans votre application que l'argent est bien arrivé avec cette référence, puis cliquez sur **Valider** (ou **Refuser**).
4. Un bouton **Envoyer le lien sur WhatsApp** apparaît : il ouvre WhatsApp avec le message et le lien d'accès déjà écrits. Le lien s'affiche aussi sur la page du client.

Réglages dans `wrangler.json` → `vars` :

| Variable | Exemple |
|---|---|
| `MANUAL_PAYMENT_ACCOUNTS` | `Wave=90000000; MyNita=91000000; Amanata=92000000; Airtel Money=96000000` |
| `MANUAL_PAYMENT_HOLDER` | `Moussa Abdou` (nom affiché au client pour qu'il vérifie le bénéficiaire) |
| `PAYMENT_METHODS` | texte affiché sur le site, ex. `Wave, MyNita, Amanata ou Airtel Money` |

Un moyen sans numéro (`Amanata=`) n'est pas proposé. Si CinetPay est aussi configuré, le client voit en plus « Paiement en ligne ».
Une même référence ne peut pas servir à deux commandes ; les commandes non validées expirent après 7 jours.

**Ne validez jamais sur la seule foi d'une capture d'écran** : vérifiez toujours la réception dans votre application ou votre relevé.

## 2. Déployer sur Cloudflare (gratuit)

```bash
npm install
npx wrangler login
npx wrangler d1 create carriere-humanitaire-db
```

Copiez le `database_id` affiché dans `wrangler.json` (champ `d1_databases[0].database_id`, et mettez `database_name` à `carriere-humanitaire-db`).

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

Wrangler affiche l'adresse du site, du type `https://carriere-humanitaire-niger.<votre-compte>.workers.dev`. **Copiez-la dans `SITE_URL`** (`wrangler.json`) puis relancez `npm run deploy`.

## 3. Personnaliser `wrangler.json` → `vars`

| Variable | Exemple | Rôle |
|---|---|---|
| `SITE_NAME` | `Carrière Humanitaire au Niger` | Nom affiché |
| `SITE_URL` | `https://carriere-humanitaire-niger.xxx.workers.dev` | **Obligatoire et exact** : sert aux retours de paiement |
| `LOGO_URL` | `/logo.png` | Votre logo (fichier dans `public/`) |
| `CURRENCY` | `XOF` ou `XAF` | Devise de votre compte CinetPay |
| `COUNTRY_CODE` | `NE` | Pays (Niger) |
| `FACEBOOK_URL`, `WHATSAPP_CHANNEL_URL`, `LINKEDIN_URL` | liens de vos pages | Affichés en pied de page |
| `SUPPORT_WHATSAPP` | `22790000000` | Bouton WhatsApp flottant (sans le +) |
| `META_PIXEL_ID` | `1234567890` | Suivi des publicités Facebook (facultatif) |
| `MONTHLY_TARGET` | `1000000` | Objectif affiché dans `/admin` |

Déjà configurés : nom, logo (`public/logo.png`, image de partage `public/og.jpg`), chaîne WhatsApp, page Facebook, pays Niger, devise XOF. **À compléter** : `SUPPORT_WHATSAPP` (votre numéro, ex. `22790000000`), `LINKEDIN_URL`, `META_PIXEL_ID`. Redéployez après chaque modification (`npm run deploy`).

## 4. Tester avant d'annoncer

1. Ouvrez le site sur votre téléphone.
2. Achetez le Pack CV (3 500 F) avec votre propre Mobile Money.
3. Vérifiez : redirection vers `/merci`, lien d'accès qui fonctionne, vente visible dans `/admin` (identifiant : n'importe lequel, mot de passe : `ADMIN_PASSWORD`).

## 5. (Recommandé) Nom de domaine

Un domaine `.com` ou national (ex. `carrierehumanitaire.ne` ou `.com`) inspire plus confiance. Ajoutez-le dans Cloudflare → Workers → votre worker → *Domains & Routes*, puis mettez à jour `SITE_URL`.

## Fonctionnement automatique

- Le client paie → CinetPay notifie le site → le site **vérifie le paiement auprès de CinetPay** (montant et devise) → le lien d'accès est créé. Aucune intervention de votre part.
- Toutes les 30 minutes, une tâche planifiée revérifie les paiements en attente (au cas où une notification se perdrait).
- Les contenus ne sont jamais accessibles sans paiement vérifié.
