# Stratégie : viser 1 000 000 F CFA par mois

## 1. Les chiffres, honnêtement

1 000 000 F par mois, ce n'est pas impossible, mais **ça ne se fait ni tout seul ni dès le premier mois**. Voici le calcul.

**Panier moyen visé : ~7 500 F** (mélange de Pack Premium à 10 000 F, d'e-books à 5 000 F et de packs CV à 3 500 F).

→ Il faut **environ 135 ventes par mois, soit 4 à 5 ventes par jour.**

D'où viennent 135 ventes ? Taux de conversion habituels pour ce type de produit :

| Étape | Taux réaliste | Volume nécessaire / mois |
|---|---|---|
| Visiteurs du site | — | ~9 000 |
| → inscrits au guide gratuit | 15 % | ~1 350 prospects |
| → acheteurs (dont relances WhatsApp) | 10 % des prospects | ~135 ventes |

**9 000 visiteurs par mois = 300 par jour.** Avec des pages de quelques milliers d'abonnés, la portée organique seule n'y suffit pas en général : il faudra de la **publicité Facebook/Instagram** (voir §4).

### Trajectoire réaliste

| Période | Objectif | Moyens |
|---|---|---|
| Mois 1 | 50 000 – 150 000 F | Organique + premiers tests pub (2 000 F/jour) |
| Mois 2–3 | 200 000 – 500 000 F | Pubs gagnantes augmentées, témoignages, partenariats |
| Mois 4–6 | 500 000 – 1 000 000 F | Budget pub 10–15 % du CA, affiliation, nouveaux produits |

Ces chiffres sont des **objectifs**, pas des garanties. Le tableau de bord `/admin` vous montre où vous en êtes chaque jour.

## 2. Ce qui est automatique… et ce qui ne l'est pas

**Automatique (aucune intervention) :** encaissement, vérification du paiement, livraison du guide, statistiques, relance des paiements en attente.

**Ce qui demande ~30 minutes par jour (ou un community manager à déléguer) :**
- Programmer les publications (1 fois par semaine, ~1 h, avec le calendrier fourni).
- Répondre aux messages WhatsApp / commentaires (c'est là que beaucoup de ventes se font).
- Relancer les prospects du guide gratuit (export CSV dans `/admin`).
- Ajuster les publicités 2 fois par semaine.

> « Sans rien toucher » est impossible au démarrage. Une fois les publicités rentables et les messages délégués, le temps nécessaire descend à quelques heures par semaine.

### Outils gratuits pour programmer les publications à l'avance
- **Facebook** : Meta Business Suite → *Planificateur* (programmation jusqu'à 75 jours à l'avance).
- **LinkedIn** : bouton horloge 🕒 lors de la création d'un post (programmation native).
- **Chaîne WhatsApp** : pas de programmation officielle ; préparez les messages du calendrier et publiez-les en 2 minutes par jour.

## 3. L'entonnoir de vente

```
Publication FB / LinkedIn / WhatsApp  ──►  Guide gratuit (nom + WhatsApp)
        │                                          │
        └──► Page produit ◄── relance J+1, J+3, J+7 ┘
                    │
              Paiement Mobile Money ──► Accès automatique ──► Chaîne WhatsApp (fidélisation)
```

**Messages de relance WhatsApp** (à envoyer aux prospects exportés) :
- **J+1** : « Bonjour [Prénom] 👋 Avez-vous pu lire le guide des 7 erreurs ? Quelle erreur vous parle le plus ? »
- **J+3** : « [Prénom], la question qu'on me pose le plus : *où trouver les vraies offres ?* Le Pack Premium contient les 30 sites + les 25 questions d'entretien avec réponses. 👉 [lien]?src=relance »
- **J+7** : « Dernier message de ma part 🙂 Si vous voulez vous lancer sérieusement ce mois-ci, le Pack Premium est ici : [lien]?src=relance. Bonne chance dans vos candidatures ! »

N'écrivez qu'aux personnes qui se sont inscrites, et retirez immédiatement quiconque demande à ne plus être contacté.

## 4. Publicité Facebook / Instagram

- **Objectif de campagne** : *Prospects* ou *Trafic* vers `/?src=fbads#gratuit` (le guide gratuit convertit beaucoup mieux qu'une vente directe).
- **Ciblage** : 20–35 ans, Niger (Niamey, Maradi, Zinder, Tahoua, Dosso, Tillabéri, Diffa, Agadez), intérêts : ONG, Nations Unies, Croix-Rouge, recherche d'emploi, volontariat, développement international.
- **Budget test** : 3 publicités × 1 000–2 000 F/jour pendant 5 jours. Gardez celle dont le **coût par prospect** est le plus bas (objectif < 150 F), arrêtez les autres.
- **Règle de rentabilité** : si 1 prospect coûte 150 F et que 10 % achètent à 7 500 F, chaque 1 500 F de pub rapporte ~7 500 F. Augmentez le budget de 20 % tous les 3 jours tant que ça reste rentable.
- Renseignez `META_PIXEL_ID` pour mesurer les résultats.

## 5. Accélérateurs (mois 2+)

1. **Témoignages** : demandez aux acheteurs un retour (avec leur accord) et publiez-les.
2. **Affiliation** : proposez 20–30 % de commission à des influenceurs emploi / associations étudiantes avec un lien `?src=nom-partenaire` (suivi dans `/admin`).
3. **Partenariats** : universités, clubs étudiants, centres d'orientation (vente groupée à prix réduit).
4. **Nouveaux produits** : guides spécialisés (« Devenir logisticien humanitaire », « Réussir les tests Excel des ONG », « Anglais pour l'humanitaire »).
5. **Offre haut de gamme** (si vous ou un professionnel du secteur avez le temps) : relecture de CV à 15 000 F.

## 6. Règles de confiance (à ne jamais enfreindre)

Votre public est fragile (jeunes au chômage) et il existe de nombreuses arnaques au « recrutement ONG ». C'est justement votre honnêteté qui vous distinguera et vous fera vendre sur la durée :

- **Ne jamais promettre un emploi** ni laisser entendre que vous recrutez pour une ONG ou l'ONU.
- **Ne jamais utiliser les logos** de l'ONU, de la Croix-Rouge ou d'ONG dans vos visuels (c'est interdit et ça ressemble aux arnaques).
- **Prix accessibles**, contenu réellement utile, remboursement si problème technique.
- **Données personnelles** : ne contactez que les personnes inscrites, ne revendez jamais les numéros.
