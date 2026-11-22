# Carrière Humanitaire au Niger — boutique de guides numériques

Site de vente de guides et e-books pour les jeunes Nigériens qui veulent travailler dans l'humanitaire (ONG, ONU, Croix-Rouge).
Paiement Mobile Money (Airtel Money, Moov Money…) et carte via CinetPay, livraison automatique, tableau de bord des ventes.

Hébergement : Cloudflare Workers + base D1 (gratuit jusqu'à ~100 000 visites/jour).

## Ce que fait le site

| Page | Rôle |
|---|---|
| `/` | Page d'accueil : arguments, 3 produits, formulaire guide gratuit, FAQ |
| `/produit/<slug>` | Page de vente + formulaire de commande |
| `/guide-gratuit` | Mini-guide gratuit (récupère nom + WhatsApp du prospect) |
| `/merci?commande=…` | Confirmation de paiement + lien d'accès |
| `/acces/<jeton>` | Contenu acheté (lien personnel, valable 1 an, exportable en PDF) |
| `/admin` | Tableau de bord : CA du mois vs objectif 1 000 000 F, ventes par canal, export des prospects |
| `/conditions` | Conditions de vente |

Ajoutez `?src=facebook`, `?src=whatsapp` ou `?src=linkedin` à vos liens : le tableau de bord vous dira quel réseau vend le plus.

## Produits (modifiables dans `src/config.ts`)

- **Devenir Agent Humanitaire** (e-book) — 5 000 F
- **Pack CV & Lettre de Motivation** — 3 500 F
- **Pack Premium** (e-book + pack CV + sites d'offres + 25 questions d'entretien) — 10 000 F
- **Guide gratuit** « Les 7 erreurs… » — aimant à prospects

Les textes sont dans `src/content/`.

## Documentation

- [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) — mise en ligne pas à pas (≈ 1 heure)
- [docs/STRATEGIE.md](docs/STRATEGIE.md) — plan pour viser 1 000 000 F/mois, chiffres réalistes
- [docs/CALENDRIER-30-JOURS.md](docs/CALENDRIER-30-JOURS.md) — publications prêtes à copier pour Facebook, WhatsApp, LinkedIn

## Développement local

```bash
npm install
npx wrangler d1 migrations apply DB --local
echo "ADMIN_PASSWORD=test" > .dev.vars
npx wrangler dev
```
