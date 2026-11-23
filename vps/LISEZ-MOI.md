# CARRIÈRE HUMANITAIRE NIGER — À lire en premier

## Contenu de ce dossier

| Dossier / fichier | Contenu |
|---|---|
| `site/` | Le site prêt à être installé sur le VPS (ne rien modifier dedans, sauf `configuration.env`) |
| `envoyer-sur-vps.ps1` | Envoi + installation automatique depuis **Windows** |
| `envoyer-sur-vps.sh` | Envoi + installation automatique depuis **Mac / Linux** |
| `documents/` | Les e-books en PDF, la stratégie, le calendrier de 30 jours de publications |
| `code-source/` | Le code complet (pour les futures modifications) |

---

## Ce qu'il faut avant l'installation

1. **Un VPS** sous **Ubuntu 22.04 / 24.04** ou **Debian 12**, avec l'accès `root` (adresse IP + mot de passe ou clé SSH). 1 Go de RAM suffit.
2. **Un nom de domaine**, avec deux enregistrements DNS de type **A** pointant vers l'IP du VPS :
   - `mondomaine.com` → `IP du VPS`
   - `www.mondomaine.com` → `IP du VPS`

   (À faire chez le vendeur du domaine, rubrique « DNS » ou « Zone DNS ». La prise en compte peut prendre de quelques minutes à quelques heures.)

## Installation (5 minutes)

### Depuis Windows

1. Ouvrez ce dossier, faites **Maj + clic droit** dans un espace vide → **Ouvrir la fenêtre PowerShell ici** (ou « Ouvrir dans le terminal »).
2. Tapez (en remplaçant l'IP et le domaine) :

   ```
   powershell -ExecutionPolicy Bypass -File .\envoyer-sur-vps.ps1 -IP 1.2.3.4 -Domaine mondomaine.com
   ```
3. Tapez `yes` si on vous demande de confirmer la connexion, puis le mot de passe du VPS (2 ou 3 fois ; il ne s'affiche pas quand vous tapez, c'est normal).

### Depuis Mac / Linux

```
bash envoyer-sur-vps.sh 1.2.3.4 mondomaine.com
```

À la fin, le script affiche : **✅ Site installé : https://mondomaine.com**

Le script installe tout automatiquement : Node.js, la base de données, le serveur web Nginx, le certificat HTTPS gratuit, le redémarrage automatique du site, et une sauvegarde quotidienne de la base.

## Après l'installation : remplir les secrets

Connectez-vous au VPS (`ssh root@1.2.3.4`) puis :

```
nano /opt/carriere-humanitaire/.env
```

Remplissez :
- `ADMIN_PASSWORD` : mot de passe du tableau de bord `https://mondomaine.com/admin`
- `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` : fournis par CinetPay une fois votre compte marchand validé
- `SUPPORT_WHATSAPP` : votre numéro WhatsApp (ex. `22790000000`)

Enregistrez (`Ctrl+O`, `Entrée`, `Ctrl+X`) puis redémarrez :

```
systemctl restart carriere-humanitaire
```

Tant que CinetPay n'est pas configuré, le site fonctionne (pages, guide gratuit, inscriptions), mais le bouton de paiement affiche « paiement pas encore activé ».

**Important** : avant d'ouvrir votre compte CinetPay, demandez-leur quels opérateurs Mobile Money sont acceptés **au Niger**, et mettez la liste exacte dans `PAYMENT_METHODS`.

## Commandes utiles sur le VPS

| Action | Commande |
|---|---|
| Voir si le site tourne | `systemctl status carriere-humanitaire` |
| Voir les erreurs | `journalctl -u carriere-humanitaire -n 50` |
| Redémarrer | `systemctl restart carriere-humanitaire` |
| Sauvegardes de la base | dossier `/opt/carriere-humanitaire/backups/` |

## Mettre à jour le site plus tard

Relancez simplement le même script d'envoi avec la nouvelle version du dossier : votre configuration (`.env`) et vos ventes (base de données) sont conservées.
